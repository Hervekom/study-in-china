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
  Award
} from 'lucide-react';
import { StudentApplication, ApplicationStatus, DocumentItem } from '../types';
import { siteConfig, pricing } from '../data/siteConfig';
import {
  getStoredApplications,
  updateApplicationStatus,
  updateDocumentStatus,
  recordPayment,
  addAdvisorMessage,
  setActiveApplicationId
} from '../data/applicationStorage';
import { useAuth } from '../context/AuthContext';

interface AdminPortalProps {
  onBackToHome: () => void;
  onGoToDashboard: (appId?: string) => void;
  onGoToApply: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToHome,
  onGoToDashboard,
  onGoToApply,
}) => {
  const { isAdmin, loginAsDemo } = useAuth();
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
      showToast(`Status updated to ${targetStatus.replace('_', ' ').toUpperCase()} for ${selectedApp.personal.firstName}!`);
    }
  };

  const handleApproveDoc = (docId: string) => {
    if (!selectedApp) return;
    const updated = updateDocumentStatus(selectedApp.id, docId, 'verified');
    if (updated) {
      setSelectedApp(updated);
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

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 text-left">
            <span className="font-bold text-[#18151B] block mb-1">Evaluator Quick Access:</span>
            <p className="text-[11px] text-[#575260]">
              You can instantly authenticate as Senior Admissions Director Elena Zhao to inspect applicant dossiers and review documents.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => loginAsDemo('admin')}
              className="w-full py-2.5 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authenticate as Admissions Director</span>
            </button>
            <button
              onClick={onBackToHome}
              className="w-full py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl text-xs font-semibold transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Website</span>
            </button>
            <div className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#6D1838] text-white font-bold text-xs flex items-center justify-center">
                CS
              </span>
              <span className="font-extrabold text-sm sm:text-base text-[#18151B]">
                Admissions Directorate & Operations Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onGoToDashboard()}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Dashboard View</span>
            </button>
            <button
              onClick={onGoToApply}
              className="px-3 py-1.5 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              + New Application
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <span className="text-2xl font-black text-[#6D1838] mt-1 block">
              ${totalRevenue.toLocaleString()} USD
            </span>
            <span className="text-[11px] text-neutral-400">From Deposits & Balances</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by student name, Ref ID, or program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-2.5 pl-9 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
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

        {/* Applications Data Table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F9] text-[#575260] uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Applicant & Country</th>
                  <th className="py-3 px-4">Target Program & Degree</th>
                  <th className="py-3 px-4">Current Pipeline Status</th>
                  <th className="py-3 px-4">Deposit (${pricing.depositUSD})</th>
                  <th className="py-3 px-4">Admission (${pricing.admissionPaymentUSD})</th>
                  <th className="py-3 px-4">Final (${pricing.finalPaymentUSD.toLocaleString()})</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredApps.map(app => {
                  return (
                    <tr key={app.id} className="hover:bg-[#FAF2F5]/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#6D1838]">
                        {app.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-[#18151B] block">{app.personal.firstName} {app.personal.lastName}</strong>
                        <span className="text-[11px] text-[#575260]">{app.personal.nationality} · {app.personal.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#18151B] block">{app.preferences.specificProgram || app.preferences.preferredField || 'Open Academic Track'}</span>
                        <span className="text-[11px] text-[#575260]">{app.preferences.targetDegree} · {app.preferences.preferredField}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF2F5] text-[#6D1838] border border-[#EAD5DE]">
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {app.payments.deposit.paid ? (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ ${pricing.depositUSD} Paid</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {app.payments.admissionPayment?.paid ? (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ ${pricing.admissionPaymentUSD} Paid</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {app.payments.finalPayment.paid ? (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ ${pricing.finalPaymentUSD.toLocaleString()} Paid</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDossier(app)}
                            className="px-3 py-1.5 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                          >
                            Manage Dossier
                          </button>
                          <button
                            onClick={() => handleSwitchToStudentView(app.id)}
                            className="p-1.5 border border-neutral-300 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
                            title="View as Student"
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
      </main>

      {/* ================= APPLICATION DOSSIER DRAWER / MODAL ================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-neutral-200 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 bg-[#FAF7F9] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#6D1838] bg-[#FAF2F5] px-2 py-0.5 rounded border border-[#EAD5DE]">
                    {selectedApp.id}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Created on {selectedApp.createdAt.split('T')[0]}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#18151B] mt-0.5">
                  Applicant Dossier: {selectedApp.personal.firstName} {selectedApp.personal.lastName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#18151B]">
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
                      <option value="final_payment_pending">Stage 2 Balance Pending ($1,575)</option>
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
                  <span className="text-[11px] text-neutral-400">Approve or request revision</span>
                </div>

                <div className="space-y-2">
                  {selectedApp.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
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
                        <p className="text-[11px] text-[#575260] mt-0.5">
                          {doc.name || 'Not uploaded yet'} {doc.fileSize && `· ${doc.fileSize}`}
                        </p>
                        {doc.feedback && (
                          <p className="text-[10px] text-amber-800 font-medium mt-1">
                            Note: {doc.feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.status !== 'verified' && (
                          <button
                            onClick={() => handleApproveDoc(doc.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold transition-colors"
                          >
                            ✓ Approve
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setFeedbackDoc(doc);
                            setFeedbackText('');
                          }}
                          className="px-2.5 py-1 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          Request Fix
                        </button>
                      </div>
                    </div>
                  ))}
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
            <div className="p-4 border-t border-neutral-200 bg-[#FAF7F9] flex items-center justify-between">
              <button
                onClick={() => handleSwitchToStudentView(selectedApp.id)}
                className="text-xs font-bold text-[#6D1838] hover:underline flex items-center gap-1"
              >
                <span>Preview Student View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
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
