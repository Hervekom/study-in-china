import React, { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Building,
  GraduationCap,
  CreditCard,
  DollarSign,
  Send,
  Check,
  X,
  RefreshCw,
  FileText,
  UserCheck,
  Award,
  LogOut,
} from 'lucide-react';
import { StudentApplication, ApplicationStatus, DocumentItem } from '../types';
import { siteConfig, pricing } from '../data/siteConfig';
import {
  getStoredApplications,
  updateApplicationStatus,
  updateDocumentStatus,
  recordPayment,
  addAdvisorMessage,
  acknowledgeDocument,
  setActiveApplicationId
} from '../data/applicationStorage';
import { useAuth } from '../context/AuthContext';
import { DEMO_MODE } from '../lib/supabase';
import { AdminSecurityCenter } from './AdminSecurityCenter';
import { AdminContentEditor } from './AdminContentEditor';
import { auditService } from '../services/auditService';
import { notifyStudent } from '../services/studentNotifier';
import { getDocumentUrl } from '../services/documentFiles';
import { isSupabaseConfigured } from '../lib/supabase';
import { useCloudSync } from '../hooks/useCloudSync';

interface AdminPortalProps {
  onBackToHome: () => void;
  onGoToDashboard: (appId?: string) => void;
  onGoToApply: () => void;
}

const formatStatus = (status: string) => status.replace(/_/g, ' ').toUpperCase();

const statusBadgeClass = (status: string) => {
  if (['admission_granted', 'jw202_issued', 'visa_preparation', 'pre_departure', 'completed'].includes(status)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (['document_review', 'final_payment_pending'].includes(status)) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return 'bg-[#FAF2F5] text-[#6D1838] border-[#EAD5DE]';
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToHome,
  onGoToDashboard,
  onGoToApply,
}) => {
  const { isAdmin, loginAsDemo, logout, profile, user } = useAuth();
  const { loading: cloudLoading } = useCloudSync();
  const [section, setSection] = useState<'applications' | 'content' | 'security'>('applications');
  const audit = (action: string, entityId: string, details: Record<string, unknown> = {}) =>
    auditService.log({ action, entityType: 'application', entityId, details, actorLabel: profile?.email || user?.email || 'admin' });
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);

  // Status update form
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('document_review');
  const [statusNote, setStatusNote] = useState('');
  
  // Document feedback modal
  const [feedbackDoc, setFeedbackDoc] = useState<DocumentItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Toast
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const loadApps = () => {
    const list = getStoredApplications();
    setApplications(list);
    if (selectedApp) {
      const refreshed = list.find(a => a.id === selectedApp.id);
      if (refreshed) setSelectedApp(refreshed);
    }
  };

  useEffect(() => {
    loadApps();

    const handleUpdate = () => {
      loadApps();
    };

    window.addEventListener('chinastudy_applications_updated', handleUpdate);
    return () => {
      window.removeEventListener('chinastudy_applications_updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const staffName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Admissions Team';
  const [adminMessage, setAdminMessage] = useState('');
  const [docBusy, setDocBusy] = useState<string | null>(null);

  /** Email the student about a change (production only). */
  const emailStudent = (app: StudentApplication, subject: string, headline: string, message: string) => {
    if (!isSupabaseConfigured()) return;
    void notifyStudent({ applicationId: app.id, subject, headline, message }).then(res => {
      showToast(res.sent ? `Email sent to ${app.personal.email}` : `Saved, but the email was not sent (${res.error}).`);
    });
  };

  const handleOpenDoc = async (doc: DocumentItem, download: boolean) => {
    if (!doc.storagePath) return;
    setDocBusy(doc.id);
    try {
      const url = await getDocumentUrl(doc.storagePath, download ? doc.name || `${doc.type}.pdf` : undefined);
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        window.open(url, '_blank', 'noopener');
      }
      if (selectedApp) audit(download ? 'document_downloaded' : 'document_viewed', selectedApp.id, { document: doc.title });
    } catch (err: any) {
      showToast(err?.message || 'Could not open the file.');
    } finally {
      setDocBusy(null);
    }
  };

  const handleAcknowledgeDoc = (doc: DocumentItem) => {
    if (!selectedApp) return;
    const updated = acknowledgeDocument(selectedApp.id, doc.id, staffName);
    if (updated) {
      setSelectedApp(updated);
      audit('document_acknowledged', selectedApp.id, { document: doc.title });
      showToast(`Acknowledgment sent to ${selectedApp.personal.firstName}.`);
      emailStudent(
        selectedApp,
        `We received your ${doc.title}`,
        'Document received',
        `We have received your document "${doc.title}". Our admissions team will review it and let you know if anything else is needed.`
      );
    }
  };

  const handleSendAdminMessage = () => {
    if (!selectedApp || !adminMessage.trim()) return;
    const text = adminMessage.trim();
    const updated = addAdvisorMessage(selectedApp.id, 'advisor', staffName, text);
    if (updated) {
      setSelectedApp(updated);
      setAdminMessage('');
      audit('message_sent', selectedApp.id, { length: text.length });
      showToast('Message sent to the student dashboard.');
      emailStudent(selectedApp, 'New message from your advisor', 'You have a new message', text);
    }
  };

  // Metrics calculation
  const totalApps = applications.length;
  const pendingDocsCount = applications.filter(a => a.documents.some(d => d.status === 'pending' || d.status === 'needs_resubmission')).length;
  const admissionsCount = applications.filter(a => ['admission_granted', 'jw202_issued', 'visa_preparation', 'pre_departure'].includes(a.status)).length;
  const totalRevenue = applications.reduce((acc, a) => {
    let rev = 0;
    if (a.payments.deposit.paid) rev += a.payments.deposit.amount || pricing.depositUSD;
    if (a.payments.admissionPayment?.paid) rev += a.payments.admissionPayment.amount || pricing.admissionPaymentUSD;
    if (a.payments.finalPayment.paid) rev += a.payments.finalPayment.amount || pricing.finalPaymentUSD;
    return acc + rev;
  }, 0);

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.personal.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personal.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.preferences.specificProgram && app.preferences.specificProgram.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.preferences.preferredField && app.preferences.preferredField.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.personal.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personal.nationality.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'needs_review') return ['deposit_paid', 'document_review'].includes(app.status);
    if (filterStatus === 'university_submitted') return app.status === 'university_submitted';
    if (filterStatus === 'admission_granted') return ['admission_granted', 'jw202_issued'].includes(app.status);
    if (filterStatus === 'completed') return ['visa_preparation', 'pre_departure'].includes(app.status);

    return true;
  });

  const handleOpenDossier = (app: StudentApplication) => {
    setSelectedApp(app);
    setTargetStatus(app.status);
    setStatusNote('');
  };

  const handleUpdateStatus = () => {
    if (!selectedApp) return;
    const updated = updateApplicationStatus(selectedApp.id, targetStatus, statusNote.trim() || undefined);
    if (updated) {
      setSelectedApp(updated);
      audit('status_changed', selectedApp.id, { from: selectedApp.status, to: targetStatus, student: selectedApp.personal.email, note: statusNote.trim() || undefined });
      emailStudent(
        selectedApp,
        'Your application status has been updated',
        `New status: ${formatStatus(targetStatus)}`,
        statusNote.trim() || 'Your application has moved to a new stage. Sign in to your dashboard to see the details.'
      );
      showToast(`Status updated to ${formatStatus(targetStatus)} for ${selectedApp.personal.firstName}!`);
    }
  };

  const handleApproveDoc = (docId: string) => {
    if (!selectedApp) return;
    const updated = updateDocumentStatus(selectedApp.id, docId, 'verified');
    if (updated) {
      setSelectedApp(updated);
      const approvedTitle = selectedApp.documents.find(d => d.id === docId)?.title || 'document';
      audit('document_approved', selectedApp.id, { document: approvedTitle });
      emailStudent(selectedApp, `Your ${approvedTitle} has been verified`, 'Document verified', `Good news: your document "${approvedTitle}" has been checked and verified by our admissions team.`);
      showToast('Document verified and stamped approved!');
    }
  };

  const handleRequestDocResubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !feedbackDoc) return;

    const note = feedbackText.trim() || 'Please re-scan with higher resolution and include certified English translation.';
    const updated = updateDocumentStatus(selectedApp.id, feedbackDoc.id, 'needs_resubmission', note);
    if (updated) {
      setSelectedApp(updated);
      audit('document_fix_requested', selectedApp.id, { document: feedbackDoc.title, note });
      emailStudent(selectedApp, `Action needed: ${feedbackDoc.title}`, 'Please update a document', `Our team needs a new version of "${feedbackDoc.title}": ${note} Sign in to your dashboard to upload it.`);
      setFeedbackDoc(null);
      setFeedbackText('');
      showToast('Document flagged: Feedback sent to student dashboard!');
    }
  };

  const handleToggleDeposit = () => {
    if (!selectedApp) return;
    const isCurrentlyPaid = selectedApp.payments.deposit.paid;
    const updated = recordPayment(selectedApp.id, 'deposit', {
      paid: !isCurrentlyPaid,
      amount: pricing.depositUSD,
      method: 'Admin Manual Settlement',
    });
    if (updated) {
      setSelectedApp(updated);
      audit('payment_updated', selectedApp.id, { stage: 'deposit', paid: !isCurrentlyPaid, amountUSD: pricing.depositUSD });
      if (!isCurrentlyPaid) emailStudent(selectedApp, 'Payment confirmed', 'Payment received', `We confirm receipt of your Stage 1 initial deposit ($${pricing.depositUSD.toLocaleString()} USD). Thank you!`);
      showToast(`Stage 1 Deposit marked as ${!isCurrentlyPaid ? 'PAID' : 'PENDING'}`);
    }
  };

  const handleToggleAdmissionPayment = () => {
    if (!selectedApp) return;
    const isCurrentlyPaid = selectedApp.payments.admissionPayment?.paid;
    const updated = recordPayment(selectedApp.id, 'admissionPayment', {
      paid: !isCurrentlyPaid,
      amount: pricing.admissionPaymentUSD,
      method: 'Admin Manual Settlement',
    });
    if (updated) {
      setSelectedApp(updated);
      audit('payment_updated', selectedApp.id, { stage: 'admission', paid: !isCurrentlyPaid, amountUSD: pricing.admissionPaymentUSD });
      if (!isCurrentlyPaid) emailStudent(selectedApp, 'Payment confirmed', 'Payment received', `We confirm receipt of your Stage 2 admission payment ($${pricing.admissionPaymentUSD.toLocaleString()} USD). Thank you!`);
      showToast(`Stage 2 Admission Payment marked as ${!isCurrentlyPaid ? 'PAID' : 'PENDING'}`);
    }
  };

  const handleToggleFinalPayment = () => {
    if (!selectedApp) return;
    const isCurrentlyPaid = selectedApp.payments.finalPayment.paid;
    const updated = recordPayment(selectedApp.id, 'finalPayment', {
      paid: !isCurrentlyPaid,
      amount: pricing.finalPaymentUSD,
      method: 'Admin Manual Settlement',
    });
    if (updated) {
      setSelectedApp(updated);
      audit('payment_updated', selectedApp.id, { stage: 'final', paid: !isCurrentlyPaid, amountUSD: pricing.finalPaymentUSD });
      if (!isCurrentlyPaid) emailStudent(selectedApp, 'Payment confirmed', 'Payment received', `We confirm receipt of your Stage 3 final payment ($${pricing.finalPaymentUSD.toLocaleString()} USD). Thank you!`);
      showToast(`Stage 3 Final Payment marked as ${!isCurrentlyPaid ? 'PAID' : 'PENDING'}`);
    }
  };

  const handleSwitchToStudentView = (appId: string) => {
    setActiveApplicationId(appId);
    onGoToDashboard(appId);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FDFCFD] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF2F5] text-[#6D1838] flex items-center justify-center mx-auto border border-[#EAD5DE]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D1838]">
              Restricted Directorate Portal
            </span>
            <h2 className="text-xl font-extrabold text-[#18151B] mt-1">
              Admissions Staff Authorization Required
            </h2>
            <p className="text-xs text-[#575260] mt-1.5 leading-relaxed">
              This area is restricted to authorized admissions directors and counselors. Standard student accounts cannot access administrative applicant dossiers.
            </p>
          </div>

          {DEMO_MODE && (
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 text-left">
              <span className="font-bold text-[#18151B] block mb-1">Evaluator Quick Access (demo):</span>
              <p className="text-[11px] text-[#575260]">
                Local demo mode: authenticate as a sample admissions director to explore the portal.
              </p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                if (DEMO_MODE) {
                  loginAsDemo('admin');
                } else {
                  window.history.pushState({}, '', '/login');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="w-full py-3 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{DEMO_MODE ? 'Authenticate as Admissions Director' : 'Sign in with a staff account'}</span>
            </button>
            <button
              onClick={onBackToHome}
              className="w-full py-3 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl text-sm font-semibold transition-colors"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-[#18151B]">
      {/* Toast */}
      {adminToast && (
        <aside aria-label="Notification" className="fixed top-20 right-4 z-50 bg-[#18151B] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{adminToast}</span>
        </aside>
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBackToHome}
              aria-label="Back to website"
              className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 -ml-1 shrink-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Back to Website</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 shrink-0 rounded-md bg-[#6D1838] text-white font-bold text-[10px] flex items-center justify-center">
                SIC
              </span>
              <div className="min-w-0 leading-tight">
                <span className="block font-extrabold text-sm sm:text-base text-[#18151B] truncate">
                  <span className="sm:hidden">Admin Portal</span>
                  <span className="hidden sm:inline">Admissions Admin Portal</span>
                </span>
                <span className="hidden sm:block text-[11px] text-[#575260] truncate">Applications, documents & payments</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onGoToDashboard()}
              aria-label="Student dashboard view"
              title="Student dashboard view"
              className="h-9 px-2.5 sm:px-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Student View</span>
            </button>
            <button
              onClick={onGoToApply}
              aria-label="New application"
              className="h-9 px-2.5 sm:px-3 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:inline">New Application</span>
            </button>
            <button
              onClick={async () => { await logout(); onBackToHome(); }}
              aria-label="Log out"
              title="Log out"
              className="h-9 w-9 border border-neutral-200 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 rounded-lg transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Section switcher */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'applications' as const, label: 'Applications', icon: Users },
            { id: 'content' as const, label: 'Site Content', icon: FileText },
            { id: 'security' as const, label: 'Security & Server', icon: ShieldCheck },
          ].map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                  active ? 'border-[#6D1838] text-[#6D1838]' : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {section === 'content' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminContentEditor onToast={showToast} />
        </main>
      )}

      {section === 'security' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminSecurityCenter onToast={showToast} />
        </main>
      )}

      {/* Main Container */}
      {section === 'applications' && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575260] block">
              Total Applicants
            </span>
            <span className="text-2xl font-black text-[#18151B] mt-1 block">
              {totalApps}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">All dossiers logged</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575260] block">
              Pending Document Audits
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {pendingDocsCount}
            </span>
            <span className="text-[11px] text-neutral-400">Requires verification</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575260] block">
              Admissions Secured
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {admissionsCount}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Official offers issued</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575260] block">
              Total Service Revenue
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#6D1838] mt-1 block whitespace-nowrap">
              ${totalRevenue.toLocaleString()} USD
            </span>
            <span className="text-[11px] text-neutral-400">From Deposits & Balances</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-80 shrink-0">
            <input
              type="text"
              placeholder="Search by student name, Ref ID, or program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-9 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto -mx-1 px-1">
            {[
              { id: 'all', label: 'All Applications' },
              { id: 'needs_review', label: 'Needs Review' },
              { id: 'university_submitted', label: 'Submitted to Committee' },
              { id: 'admission_granted', label: 'Admitted / JW202' },
              { id: 'completed', label: 'Visa & Departure' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-[#6D1838] text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications: cards on phones, table on larger screens */}
        {filteredApps.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
            <p className="text-sm font-bold text-[#18151B]">{cloudLoading ? 'Loading applications…' : applications.length === 0 ? 'No applications yet' : 'No applications found'}</p>
            <p className="text-xs text-[#575260] mt-1">{cloudLoading ? '' : applications.length === 0 ? 'New student applications will appear here automatically.' : 'Try another filter or search term.'}</p>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#18151B] truncate">{app.personal.firstName} {app.personal.lastName}</p>
                  <p className="text-[11px] text-[#575260] truncate">{app.personal.nationality} · {app.personal.email}</p>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#6D1838] bg-[#FAF2F5] px-2 py-0.5 rounded border border-[#EAD5DE] shrink-0">
                  {app.id}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#18151B] leading-snug">{app.preferences.specificProgram || app.preferences.preferredField || 'Open Academic Track'}</p>
                <p className="text-[11px] text-[#575260]">{app.preferences.targetDegree} · {app.preferences.preferredField}</p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border ${statusBadgeClass(app.status)}`}>
                {formatStatus(app.status)}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Deposit', paid: app.payments.deposit.paid, amount: pricing.depositUSD },
                  { label: 'Admission', paid: Boolean(app.payments.admissionPayment?.paid), amount: pricing.admissionPaymentUSD },
                  { label: 'Final', paid: app.payments.finalPayment.paid, amount: pricing.finalPaymentUSD },
                ].map(pmt => (
                  <div key={pmt.label} className={`rounded-xl border px-2 py-2 ${pmt.paid ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className="text-[10px] uppercase tracking-wide text-[#575260] font-semibold">{pmt.label}</p>
                    <p className={`text-xs font-bold ${pmt.paid ? 'text-emerald-700' : 'text-neutral-400'}`}>
                      {pmt.paid ? `✓ $${pmt.amount.toLocaleString()}` : 'Pending'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenDossier(app)}
                  className="flex-1 py-2.5 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Manage Dossier
                </button>
                <button
                  onClick={() => handleSwitchToStudentView(app.id)}
                  className="px-3 border border-neutral-300 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors flex items-center"
                  aria-label="View as student"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop / tablet table */}
        {filteredApps.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-[#FAF7F9] text-[#575260] uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Ref ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Program & Degree</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap">Deposit</th>
                  <th className="py-3 px-4 whitespace-nowrap">Admission</th>
                  <th className="py-3 px-4 whitespace-nowrap">Final</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredApps.map(app => {
                  return (
                    <tr key={app.id} className="hover:bg-[#FAF2F5]/30 transition-colors align-middle">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#6D1838] whitespace-nowrap">
                        {app.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-[#18151B] block">{app.personal.firstName} {app.personal.lastName}</strong>
                        <span className="text-[11px] text-[#575260]">{app.personal.nationality} · {app.personal.email}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <span className="font-bold text-[#18151B] block">{app.preferences.specificProgram || app.preferences.preferredField || 'Open Academic Track'}</span>
                        <span className="text-[11px] text-[#575260]">{app.preferences.targetDegree} · {app.preferences.preferredField}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border ${statusBadgeClass(app.status)}`}>
                          {formatStatus(app.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {app.payments.deposit.paid ? (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ ${pricing.depositUSD}</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {app.payments.admissionPayment?.paid ? (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ ${pricing.admissionPaymentUSD}</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {app.payments.finalPayment.paid ? (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ ${pricing.finalPaymentUSD.toLocaleString()}</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDossier(app)}
                            className="px-3 py-2 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-xs font-bold transition-colors shadow-xs whitespace-nowrap"
                          >
                            Manage Dossier
                          </button>
                          <button
                            onClick={() => handleSwitchToStudentView(app.id)}
                            className="p-2 border border-neutral-300 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
                            title="View as Student"
                            aria-label="View as student"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </main>
      )}

      {/* ================= APPLICATION DOSSIER DRAWER / MODAL ================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full h-[94dvh] sm:h-auto sm:max-h-[92vh] flex flex-col border border-neutral-200 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 bg-[#FAF7F9] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#6D1838] bg-[#FAF2F5] px-2 py-0.5 rounded border border-[#EAD5DE]">
                    {selectedApp.id}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Created on {selectedApp.createdAt.split('T')[0]}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-[#18151B] mt-1">
                  <span className="hidden sm:inline">Applicant Dossier: </span>{selectedApp.personal.firstName} {selectedApp.personal.lastName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                aria-label="Close"
                className="w-9 h-9 shrink-0 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs text-[#18151B] flex-1">
              {/* Pipeline Status Controller */}
              <div className="p-4 bg-gradient-to-br from-[#FAF2F5] to-[#F8F5FD] border border-[#EAD5DE] rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D1838]">
                  Admissions Pipeline Control
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#575260] mb-1">
                      Promote / Set Pipeline Stage
                    </label>
                    <select
                      value={targetStatus}
                      onChange={e => setTargetStatus(e.target.value as ApplicationStatus)}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-medium focus:outline-none focus:border-[#6D1838]"
                    >
                      <option value="deposit_paid">Deposit Paid & Created</option>
                      <option value="document_review">Document Review in Progress</option>
                      <option value="university_submitted">Submitted to Admissions Committee</option>
                      <option value="interview_evaluation">Faculty Evaluation / Interview</option>
                      <option value="admission_granted">Admission Offer Granted 🎉</option>
                      <option value="jw202_issued">JW202 / JW201 Form Issued 📄</option>
                      <option value="final_payment_pending">Final Payment Pending (${pricing.finalPaymentUSD.toLocaleString()})</option>
                      <option value="visa_preparation">Chinese Embassy Visa Preparation (X1/X2)</option>
                      <option value="pre_departure">Pre-Departure & Campus Arrival ✈️</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#575260] mb-1">
                      Counselor Update Note (Sent to Student)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Faculty approved academic admission, JW202 visa processing requested"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-[#6D1838] text-white font-bold rounded-xl hover:bg-[#58122c] transition-colors shadow-xs"
                  >
                    Save & Publish Stage Change
                  </button>
                </div>
              </div>

              {/* Applicant Credentials Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <strong className="block text-[#6D1838] uppercase font-bold text-[10px]">Contact Profile</strong>
                  <p><strong>Email:</strong> {selectedApp.personal.email}</p>
                  <p><strong>WhatsApp:</strong> {selectedApp.personal.whatsapp}</p>
                  <p><strong>Location:</strong> {selectedApp.personal.currentCity}, {selectedApp.personal.currentCountry}</p>
                  <p><strong>Nationality:</strong> {selectedApp.personal.nationality}</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <strong className="block text-[#6D1838] uppercase font-bold text-[10px]">Education Background</strong>
                  <p><strong>Level:</strong> {selectedApp.education.highestEducation}</p>
                  <p><strong>School:</strong> {selectedApp.education.schoolName}</p>
                  <p><strong>GPA:</strong> {selectedApp.education.gpaOrGrade}</p>
                  <p><strong>English:</strong> {selectedApp.education.englishProficiency}</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                  <strong className="block text-[#6D1838] uppercase font-bold text-[10px]">Candidate Preferences (3-Tier)</strong>
                  <p><strong>1st Choice:</strong> {selectedApp.preferences.firstChoice?.program || selectedApp.preferences.specificProgram || selectedApp.preferences.preferredField} ({selectedApp.preferences.firstChoice?.degreeLevel || selectedApp.preferences.targetDegree})</p>
                  {selectedApp.preferences.secondChoice && (
                    <p><strong>2nd Choice:</strong> {selectedApp.preferences.secondChoice.program} ({selectedApp.preferences.secondChoice.degreeLevel})</p>
                  )}
                  {selectedApp.preferences.thirdChoice && (
                    <p><strong>3rd Choice:</strong> {selectedApp.preferences.thirdChoice.program} ({selectedApp.preferences.thirdChoice.degreeLevel})</p>
                  )}
                  <p><strong>Funding Goal:</strong> {selectedApp.preferences.fundingPreference}</p>
                </div>
              </div>

              {/* Document Audit & Stamping Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#18151B] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#6D1838]" /> Uploaded Student Documents ({selectedApp.documents.length})
                  </h3>
                  <span className="hidden sm:inline text-[11px] text-neutral-400">Approve or request revision</span>
                </div>

                <div className="space-y-2">
                  {selectedApp.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-[#18151B]">{doc.title}</strong>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            doc.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'needs_resubmission'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#575260] mt-0.5 break-all">
                          {doc.name || 'Not uploaded yet'} {doc.fileSize && `· ${doc.fileSize}`} {doc.uploadDate && `· ${doc.uploadDate}`}
                        </p>
                        {doc.receivedAt && (
                          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                            ✓ Receipt acknowledged {new Date(doc.receivedAt).toLocaleDateString()}{doc.receivedBy ? ` by ${doc.receivedBy}` : ''}
                          </p>
                        )}
                        {doc.feedback && (
                          <p className="text-[10px] text-amber-800 font-medium mt-1">
                            Note: {doc.feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full sm:w-auto">
                        {doc.storagePath && (
                          <>
                            <button
                              onClick={() => handleOpenDoc(doc, false)}
                              disabled={docBusy === doc.id}
                              className="flex-1 sm:flex-none px-3 py-2 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleOpenDoc(doc, true)}
                              disabled={docBusy === doc.id}
                              className="flex-1 sm:flex-none px-3 py-2 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              Download
                            </button>
                          </>
                        )}
                        {doc.name && !doc.receivedAt && (
                          <button
                            onClick={() => handleAcknowledgeDoc(doc)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Acknowledge receipt
                          </button>
                        )}
                        {doc.status !== 'verified' && doc.name && (
                          <button
                            onClick={() => handleApproveDoc(doc.id)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            ✓ Approve
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setFeedbackDoc(doc);
                            setFeedbackText('');
                          }}
                          className="flex-1 sm:flex-none px-3 py-2 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Request Fix
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message the student */}
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D1838]">Message the student</span>
                <p className="text-[11px] text-[#575260]">Appears in the student's dashboard (Messages){isSupabaseConfigured() ? ' and is sent by email' : ''}. Use it for payment instructions, requests or updates.</p>
                {selectedApp.messages.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                    {selectedApp.messages.slice(-6).map(m => (
                      <div key={m.id} className={`text-[11px] p-2 rounded-lg ${m.sender === 'student' ? 'bg-white border border-neutral-200' : 'bg-[#FAF2F5]'}`}>
                        <span className="font-bold text-[#18151B]">{m.sender === 'student' ? 'Student' : m.senderName}</span>
                        <span className="text-neutral-400"> · {new Date(m.timestamp).toLocaleString()}</span>
                        <p className="text-[#575260] whitespace-pre-line mt-0.5">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  value={adminMessage}
                  onChange={e => setAdminMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Here are the instructions to pay your $515 deposit…"
                  className="w-full p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendAdminMessage}
                    disabled={!adminMessage.trim()}
                    className="px-4 py-2.5 bg-[#6D1838] hover:bg-[#58122c] disabled:opacity-40 text-white rounded-xl text-sm font-bold"
                  >
                    Send message
                  </button>
                </div>
              </div>

              {/* Payment Settlement Toggles */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#18151B]">
                  Service Fee Billing Administration (USD Only)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Stage 1: Deposit */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl flex flex-col justify-between gap-2">
                    <div>
                      <strong className="block text-[#18151B] text-xs">Stage 1: Deposit (${pricing.depositUSD} USD)</strong>
                      <span className="text-[11px] text-[#575260]">
                        Status: {selectedApp.payments.deposit.paid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    <button
                      onClick={handleToggleDeposit}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                        selectedApp.payments.deposit.paid
                          ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {selectedApp.payments.deposit.paid ? 'Mark Unpaid' : `Mark Paid ($${pricing.depositUSD})`}
                    </button>
                  </div>

                  {/* Stage 2: Admission Payment */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl flex flex-col justify-between gap-2">
                    <div>
                      <strong className="block text-[#18151B] text-xs">Stage 2: Admission (${pricing.admissionPaymentUSD} USD)</strong>
                      <span className="text-[11px] text-[#575260]">
                        Status: {selectedApp.payments.admissionPayment?.paid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    <button
                      onClick={handleToggleAdmissionPayment}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                        selectedApp.payments.admissionPayment?.paid
                          ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          : 'bg-[#6C3B9E] text-white hover:bg-[#582e82]'
                      }`}
                    >
                      {selectedApp.payments.admissionPayment?.paid ? 'Mark Unpaid' : `Mark Paid ($${pricing.admissionPaymentUSD})`}
                    </button>
                  </div>

                  {/* Stage 3: Final Payment */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl flex flex-col justify-between gap-2">
                    <div>
                      <strong className="block text-[#18151B] text-xs">Stage 3: Final (${pricing.finalPaymentUSD.toLocaleString()} USD)</strong>
                      <span className="text-[11px] text-[#575260]">
                        Status: {selectedApp.payments.finalPayment.paid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    <button
                      onClick={handleToggleFinalPayment}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                        selectedApp.payments.finalPayment.paid
                          ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          : 'bg-[#6D1838] text-white hover:bg-[#58122c]'
                      }`}
                    >
                      {selectedApp.payments.finalPayment.paid ? 'Mark Unpaid' : `Mark Paid ($${pricing.finalPaymentUSD.toLocaleString()})`}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 sm:p-4 border-t border-neutral-200 bg-[#FAF7F9] flex items-center justify-between gap-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => handleSwitchToStudentView(selectedApp.id)}
                className="text-xs font-bold text-[#6D1838] hover:underline flex items-center gap-1"
              >
                <span>Preview Student View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Feedback Modal */}
      {feedbackDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-neutral-200 shadow-2xl">
            <h3 className="font-bold text-sm text-[#18151B]">
              Request Fix for: {feedbackDoc.title}
            </h3>
            <p className="text-xs text-[#575260]">
              Specify exactly what the student needs to adjust (e.g. higher resolution scan, missing official stamp, certified English translation).
            </p>
            <form onSubmit={handleRequestDocResubmission} className="space-y-4">
              <textarea
                rows={3}
                placeholder="Enter counselor feedback..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackDoc(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800"
                >
                  Send Feedback to Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
