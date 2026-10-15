import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Audit trail for admin actions.
 * - Production (Supabase): rows are written to public.audit_logs (admins only, cannot be edited or deleted).
 * - Demo / offline: entries are kept in this browser so the screen still works.
 */

export interface AuditEntry {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

const LOCAL_KEY = 'sic_audit_logs_local';
let cachedActorProfileId: string | null = null;

const readLocal = (): AuditEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocal = (entries: AuditEntry[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, 500)));
  } catch {
    /* storage full or blocked: ignore */
  }
};

const getActorProfileId = async (): Promise<string | null> => {
  if (cachedActorProfileId) return cachedActorProfileId;
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;
  const { data } = await supabase.from('profiles').select('id').eq('user_id', uid).maybeSingle();
  cachedActorProfileId = data?.id || null;
  return cachedActorProfileId;
};

export const auditService = {
  async log(params: {
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
    actorLabel?: string;
  }): Promise<void> {
    const entry: AuditEntry = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      actor: params.actorLabel || 'admin',
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
    };

    if (isSupabaseConfigured()) {
      try {
        const actorId = await getActorProfileId();
        if (actorId) {
          const { error } = await supabase.from('audit_logs').insert({
            actor_id: actorId,
            action: params.action,
            entity_type: params.entityType,
            entity_id: params.entityId || null,
            details: params.details || {},
          });
          if (!error) return;
          console.warn('Audit log write failed, keeping a local copy:', error.message);
        }
      } catch (e) {
        console.warn('Audit log error, keeping a local copy:', e);
      }
    }

    writeLocal([entry, ...readLocal()]);
  },

  async list(): Promise<{ entries: AuditEntry[]; source: 'database' | 'local'; error?: string }> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, created_at, action, entity_type, entity_id, details, actor:profiles(email, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(300);

      if (!error && data) {
        const entries: AuditEntry[] = data.map((row: any) => ({
          id: row.id,
          createdAt: row.created_at,
          actor: row.actor?.email || [row.actor?.first_name, row.actor?.last_name].filter(Boolean).join(' ') || 'unknown',
          action: row.action,
          entityType: row.entity_type,
          entityId: row.entity_id || undefined,
          details: row.details || {},
        }));
        return { entries: [...entries, ...readLocal()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), source: 'database' };
      }
      return { entries: readLocal(), source: 'local', error: error?.message };
    }
    return { entries: readLocal(), source: 'local' };
  },
};
