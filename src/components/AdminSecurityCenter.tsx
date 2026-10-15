import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  Users,
  Download,
  Upload,
  Clock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  UserMinus,
  Lock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, DEMO_MODE } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { auditService, AuditEntry } from '../services/auditService';
import { getStoredApplications, saveApplications } from '../data/applicationStorage';

type Tab = 'security' | 'team' | 'backup' | 'logs';

interface TableStatus {
  table_name: string;
  rls_enabled: boolean;
  policy_count: number;
  row_count: number;
}

interface AdminRow {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

// Restore order respects foreign keys (parents first). audit_logs is never restored (immutable trail).
const BACKUP_TABLES = [
  'universities',
  'programs',
  'profiles',
  'applications',
  'application_universities',
  'application_documents',
  'admissions',
  'jw_documents',
  'payments',
  'messages',
  'notifications',
  'application_status_history',
  'blog_posts',
  'faqs',
  'testimonials',
  'site_content',
  'audit_logs',
];
const NOT_RESTORABLE = new Set(['audit_logs']);

const MIGRATION_FILE = 'supabase/migrations/20261015_admin_security_center.sql';

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const humanAction = (a: string) => a.replace(/_/g, ' ');

export const AdminSecurityCenter: React.FC<{ onToast: (msg: string) => void }> = ({ onToast }) => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('security');
  const actorLabel = profile?.email || user?.email || 'admin';

  // ---------- Security (RLS) ----------
  const [secLoading, setSecLoading] = useState(false);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [secError, setSecError] = useState<string | null>(null);
  const [probe, setProbe] = useState<{ table: string; visible: number | null; error?: string }[]>([]);

  const loadSecurity = async () => {
    if (!isSupabaseConfigured()) return;
    setSecLoading(true);
    setSecError(null);
    const { data, error } = await supabase.rpc('security_overview');
    if (error) {
      setSecError(error.message);
      setTables([]);
    } else {
      setTables((data as TableStatus[]) || []);
    }

    // Visitor probe: what can an anonymous visitor read with the public key?
    try {
      const anon = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, storageKey: 'sic-rls-probe' },
      });
      const sensitive = ['profiles', 'applications', 'application_documents', 'payments', 'messages', 'audit_logs'];
      const results = await Promise.all(
        sensitive.map(async t => {
          const { data: rows, error: e } = await anon.from(t).select('id').limit(5);
          return { table: t, visible: e ? null : (rows?.length ?? 0), error: e?.message };
        })
      );
      setProbe(results);
    } catch (e: any) {
      setProbe([]);
    }
    setSecLoading(false);
  };

  // ---------- Team ----------
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);

  const loadTeam = async () => {
    if (!isSupabaseConfigured()) return;
    setTeamLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: true });
    setTeamError(error ? error.message : null);
    setAdmins((data as AdminRow[]) || []);
    setTeamLoading(false);
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = promoteEmail.trim().toLowerCase();
    if (!email) return;
    setTeamError(null);
    const { data: target, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .ilike('email', email)
      .maybeSingle();
    if (error) {
      setTeamError(error.message);
      return;
    }
    if (!target) {
      setTeamError('No account uses this email. The person must first create an account on the website (or you create it in Supabase → Authentication → Users).');
      return;
    }
    if (target.role === 'admin') {
      setTeamError('This person is already an admin.');
      return;
    }
    if (!window.confirm(`Give full admin access to ${target.email}? They will see every application, document and payment.`)) return;
    const { error: upErr } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', target.id);
    if (upErr) {
      setTeamError(upErr.message);
      return;
    }
    await auditService.log({ action: 'admin_granted', entityType: 'profile', entityId: target.id, details: { email: target.email }, actorLabel });
    onToast(`${target.email} is now an admin.`);
    setPromoteEmail('');
    loadTeam();
  };

  const handleRevoke = async (row: AdminRow) => {
    if (row.user_id === user?.id) return;
    if (admins.length <= 1) {
      setTeamError('You cannot remove the last admin.');
      return;
    }
    if (!window.confirm(`Remove admin access from ${row.email}? They will become a regular student account.`)) return;
    const { error } = await supabase.from('profiles').update({ role: 'student' }).eq('id', row.id);
    if (error) {
      setTeamError(error.message);
      return;
    }
    await auditService.log({ action: 'admin_revoked', entityType: 'profile', entityId: row.id, details: { email: row.email }, actorLabel });
    onToast(`Admin access removed for ${row.email}.`);
    loadTeam();
  };

  // ---------- Backups ----------
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupReport, setBackupReport] = useState<{ title: string; lines: { name: string; ok: boolean; info: string }[] } | null>(null);

  const fetchAllRows = async (table: string) => {
    const all: any[] = [];
    const page = 1000;
    for (let from = 0; from < 20000; from += page) {
      const { data, error } = await supabase.from(table).select('*').range(from, from + page - 1);
      if (error) throw new Error(error.message);
      all.push(...(data || []));
      if (!data || data.length < page) break;
    }
    return all;
  };

  const handleExport = async () => {
    setBackupBusy(true);
    setBackupReport(null);
    const lines: { name: string; ok: boolean; info: string }[] = [];
    const dbData: Record<string, any[]> = {};

    if (isSupabaseConfigured()) {
      for (const t of BACKUP_TABLES) {
        try {
          dbData[t] = await fetchAllRows(t);
          lines.push({ name: t, ok: true, info: `${dbData[t].length} rows` });
        } catch (e: any) {
          lines.push({ name: t, ok: false, info: e.message });
        }
      }
    }

    const localApps = getStoredApplications();
    lines.push({ name: 'dashboard applications (this browser)', ok: true, info: `${localApps.length} records` });

    const backup = {
      meta: {
        app: 'Study In China',
        version: 1,
        exportedAt: new Date().toISOString(),
        exportedBy: actorLabel,
        source: isSupabaseConfigured() ? 'supabase' : 'local-demo',
        note: 'Uploaded files (passports, diplomas) live in Supabase Storage and are not included.',
      },
      database: dbData,
      local: { applications: localApps },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyInChina_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    const totalRows = Object.values(dbData).reduce((n, rows) => n + rows.length, 0);
    await auditService.log({ action: 'backup_exported', entityType: 'database', details: { tables: Object.keys(dbData).length, rows: totalRows }, actorLabel });
    setBackupReport({ title: 'Backup downloaded', lines });
    onToast('Backup file downloaded.');
    setBackupBusy(false);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    let parsed: any;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      onToast('This file is not valid JSON.');
      return;
    }
    if (parsed?.meta?.app !== 'Study In China') {
      onToast('This file is not a Study In China backup.');
      return;
    }
    if (
      !window.confirm(
        `Restore the backup from ${fmtDate(parsed.meta.exportedAt)}?\n\nRecords in the backup will be written back (existing records with the same ID are overwritten). Records created after the backup are kept. Audit logs are never changed.`
      )
    )
      return;

    setBackupBusy(true);
    setBackupReport(null);
    const lines: { name: string; ok: boolean; info: string }[] = [];

    if (isSupabaseConfigured() && parsed.database) {
      for (const t of BACKUP_TABLES) {
        if (NOT_RESTORABLE.has(t)) continue;
        const rows = parsed.database[t];
        if (!Array.isArray(rows) || rows.length === 0) continue;
        let written = 0;
        let failed: string | null = null;
        for (let i = 0; i < rows.length; i += 500) {
          const { error } = await supabase.from(t).upsert(rows.slice(i, i + 500), { onConflict: 'id' });
          if (error) {
            failed = error.message;
            break;
          }
          written += Math.min(500, rows.length - i);
        }
        lines.push({ name: t, ok: !failed, info: failed ? `stopped after ${written}: ${failed}` : `${written} rows restored` });
      }
    }

    if (Array.isArray(parsed.local?.applications)) {
      saveApplications(parsed.local.applications);
      window.dispatchEvent(new Event('chinastudy_applications_updated'));
      lines.push({ name: 'dashboard applications (this browser)', ok: true, info: `${parsed.local.applications.length} records restored` });
    }

    await auditService.log({
      action: 'backup_restored',
      entityType: 'database',
      details: { file: file.name, exportedAt: parsed.meta.exportedAt, failures: lines.filter(l => !l.ok).length },
      actorLabel,
    });
    setBackupReport({ title: 'Restore finished', lines });
    onToast('Restore finished. Check the report below.');
    setBackupBusy(false);
  };

  // ---------- Logs ----------
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [logsSource, setLogsSource] = useState<'database' | 'local'>('local');
  const [logsError, setLogsError] = useState<string | undefined>();
  const [logsLoading, setLogsLoading] = useState(false);
  const [logQuery, setLogQuery] = useState('');

  const loadLogs = async () => {
    setLogsLoading(true);
    const res = await auditService.list();
    setLogs(res.entries);
    setLogsSource(res.source);
    setLogsError(res.error);
    setLogsLoading(false);
  };

  const filteredLogs = useMemo(() => {
    const q = logQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l =>
      [l.actor, l.action, l.entityType, l.entityId, JSON.stringify(l.details || {})].join(' ').toLowerCase().includes(q)
    );
  }, [logs, logQuery]);

  useEffect(() => {
    if (tab === 'security') loadSecurity();
    if (tab === 'team') loadTeam();
    if (tab === 'logs') loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const protectedCount = tables.filter(t => t.rls_enabled && t.policy_count > 0).length;
  const unprotected = tables.filter(t => !t.rls_enabled);
  const leaking = probe.filter(p => (p.visible ?? 0) > 0);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'security', label: 'RLS Security', icon: ShieldCheck },
    { id: 'team', label: 'Admin Team', icon: Users },
    { id: 'backup', label: 'Backups', icon: Database },
    { id: 'logs', label: 'Audit Logs', icon: Clock },
  ];

  const MigrationHint = ({ error }: { error?: string | null }) => (
    <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-xs text-amber-900 space-y-1.5">
      <p className="font-bold flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4" /> One-time database setup needed
      </p>
      <p>
        In Supabase, open <strong>SQL Editor → New query</strong>, paste the content of{' '}
        <code className="font-mono bg-white/70 px-1 rounded">{MIGRATION_FILE}</code> and click <strong>Run</strong>. Then refresh this page.
      </p>
      {error && <p className="font-mono text-[11px] text-amber-800 break-words">Details: {error}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-[#18151B] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#6D1838]" />
          Security & Server Management
        </h2>
        <p className="text-xs sm:text-sm text-[#575260] mt-1">
          Check database protection (RLS), manage the admin team, download full backups in one click and review the security audit trail.
        </p>
      </div>

      {DEMO_MODE && (
        <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-700">
          Demo mode: Supabase is not connected, so only local data is shown here.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-neutral-200 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                active ? 'border-[#6D1838] text-[#6D1838]' : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.id === 'logs' && logs.length > 0 && <span className="text-[10px] text-neutral-400">({logs.length})</span>}
            </button>
          );
        })}
      </div>

      {/* ============ RLS SECURITY ============ */}
      {tab === 'security' && (
        <div className="space-y-4">
          {!isSupabaseConfigured() ? null : secError ? (
            <MigrationHint error={secError} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#575260]">Protected tables</p>
                  <p className={`text-2xl font-black mt-1 ${unprotected.length ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {secLoading ? '…' : `${protectedCount}/${tables.length}`}
                  </p>
                  <p className="text-[11px] text-[#575260]">RLS on, with access rules</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#575260]">Visitor test</p>
                  <p className={`text-2xl font-black mt-1 ${leaking.length ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {secLoading ? '…' : leaking.length ? `${leaking.length} leak${leaking.length > 1 ? 's' : ''}` : 'Passed'}
                  </p>
                  <p className="text-[11px] text-[#575260]">Private data hidden from the public</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#575260]">Demo shortcuts</p>
                  <p className={`text-2xl font-black mt-1 ${DEMO_MODE ? 'text-amber-700' : 'text-emerald-700'}`}>{DEMO_MODE ? 'On' : 'Off'}</p>
                  <p className="text-[11px] text-[#575260]">1-click demo logins disabled online</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#18151B]">Visitor access test</p>
                    <p className="text-[11px] text-[#575260]">What someone who is not logged in can read with the public key.</p>
                  </div>
                  <button onClick={loadSecurity} className="shrink-0 h-9 px-3 rounded-lg border border-neutral-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50">
                    <RefreshCw className={`w-4 h-4 ${secLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Re-run</span>
                  </button>
                </div>
                <div className="divide-y divide-neutral-100">
                  {probe.map(p => (
                    <div key={p.table} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                      <span className="font-mono text-[#18151B]">{p.table}</span>
                      {p.visible === null ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold"><Lock className="w-3.5 h-3.5" /> Blocked</span>
                      ) : p.visible === 0 ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Nothing visible</span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-700 font-bold"><XCircle className="w-3.5 h-3.5" /> {p.visible}+ rows visible</span>
                      )}
                    </div>
                  ))}
                  {probe.length === 0 && !secLoading && <p className="px-4 py-3 text-xs text-neutral-500">No result yet.</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                  <p className="text-sm font-bold text-[#18151B]">Tables & Row Level Security</p>
                  <p className="text-[11px] text-[#575260]">Every table should have RLS on and at least one rule.</p>
                </div>
                <div className="table-scroll">
                  <table className="w-full min-w-[480px] text-xs">
                    <thead className="bg-[#FAF7F9] text-[#575260] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4 text-left">Table</th>
                        <th className="py-2.5 px-4 text-left">RLS</th>
                        <th className="py-2.5 px-4 text-right">Rules</th>
                        <th className="py-2.5 px-4 text-right">Rows</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {tables.map(t => (
                        <tr key={t.table_name}>
                          <td className="py-2.5 px-4 font-mono">{t.table_name}</td>
                          <td className="py-2.5 px-4">
                            {t.rls_enabled ? (
                              t.policy_count > 0 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> On</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold"><Lock className="w-3.5 h-3.5" /> On · locked</span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><ShieldAlert className="w-3.5 h-3.5" /> Off</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums">{t.policy_count}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums">{Number(t.row_count).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============ ADMIN TEAM ============ */}
      {tab === 'team' && (
        <div className="space-y-4">
          {DEMO_MODE ? (
            <p className="text-xs text-neutral-600">Connect Supabase to manage real admin accounts.</p>
          ) : (
            <>
              <form onSubmit={handlePromote} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-[#18151B]">Add an admin</p>
                  <p className="text-[11px] text-[#575260]">The person must already have an account. Enter the email they signed up with.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={promoteEmail}
                    onChange={e => setPromoteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="flex-1 p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                  />
                  <button type="submit" className="px-4 py-3 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                    <UserPlus className="w-4 h-4" /> Give admin access
                  </button>
                </div>
              </form>

              {teamError && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800">{teamError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamLoading && <p className="text-xs text-neutral-500">Loading…</p>}
                {admins.map(a => {
                  const isMe = a.user_id === user?.id;
                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#18151B] truncate">{[a.first_name, a.last_name].filter(Boolean).join(' ') || 'Admin'}</p>
                          <p className="text-xs text-[#575260] truncate">{a.email}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF2F5] text-[#6D1838] border border-[#EAD5DE]">
                          {isMe ? 'You' : 'Admin'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Since {new Date(a.created_at).toLocaleDateString()}</span>
                        {!isMe && (
                          <button onClick={() => handleRevoke(a)} className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-1">
                            <UserMinus className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ============ BACKUPS ============ */}
      {tab === 'backup' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#FAF2F5] text-[#6D1838] border border-[#EAD5DE] shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#18151B]">Full backup of Study In China</p>
                <p className="text-xs text-[#575260] mt-0.5">
                  Includes accounts, applications, documents list, payments, messages, programs, blog, FAQs and the audit trail. Uploaded files (passports, diplomas) stay in Supabase Storage and are not in the file.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-bold text-[#18151B]">Download a backup</p>
                  <p className="text-[11px] text-[#575260]">Saves a .json file on this device. Keep it somewhere safe: it contains personal data.</p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={backupBusy}
                  className="w-full py-3 bg-[#18151B] hover:bg-black disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  {backupBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download backup
                </button>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-bold text-[#18151B]">Restore a backup</p>
                  <p className="text-[11px] text-[#575260]">Writes the records from a backup file back. Newer records are kept; audit logs are never changed.</p>
                </div>
                <label className={`w-full py-3 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${backupBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload className="w-4 h-4" />
                  Choose backup file
                  <input type="file" accept=".json,application/json" onChange={handleRestore} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {backupReport && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <p className="p-4 border-b border-neutral-200 text-sm font-bold text-[#18151B]">{backupReport.title}</p>
              <div className="divide-y divide-neutral-100">
                {backupReport.lines.map(l => (
                  <div key={l.name} className="px-4 py-2.5 flex items-start justify-between gap-3 text-xs">
                    <span className="font-mono text-[#18151B]">{l.name}</span>
                    <span className={`text-right ${l.ok ? 'text-emerald-700' : 'text-rose-700'} break-words max-w-[60%]`}>{l.info}</span>
                  </div>
                ))}
              </div>
              {backupReport.lines.some(l => !l.ok) && isSupabaseConfigured() && (
                <div className="p-4 border-t border-neutral-200"><MigrationHint /></div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ AUDIT LOGS ============ */}
      {tab === 'logs' && (
        <div className="space-y-3">
          {isSupabaseConfigured() && logsError && <MigrationHint error={logsError} />}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative sm:w-80">
              <input
                value={logQuery}
                onChange={e => setLogQuery(e.target.value)}
                placeholder="Search action, admin, reference…"
                className="w-full p-3 pl-9 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
              <span>{logsSource === 'database' ? 'Stored in database · cannot be edited' : 'Stored in this browser'}</span>
              <button onClick={loadLogs} className="h-9 px-3 rounded-lg border border-neutral-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50 text-neutral-700">
                <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-500">
              No entries yet. Admin actions (status changes, document reviews, payments, backups, admin access) are recorded here.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 max-h-[560px] overflow-y-auto">
              {filteredLogs.map(l => (
                <div key={l.id} className="px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                  <span className="text-neutral-400 font-mono text-[11px] sm:w-40 shrink-0">{fmtDate(l.createdAt)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#18151B]">
                      <span className="font-bold uppercase tracking-wide text-[#6D1838] text-[11px]">{humanAction(l.action)}</span>
                      {l.entityId && <span className="font-mono text-neutral-500"> · {l.entityId}</span>}
                    </p>
                    {l.details && Object.keys(l.details).length > 0 && (
                      <p className="text-[11px] text-[#575260] break-words">
                        {Object.entries(l.details).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-500 sm:text-right truncate sm:max-w-[200px]">{l.actor}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
