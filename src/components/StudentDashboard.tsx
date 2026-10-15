import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  MapPin,
  Building,
  GraduationCap,
  Compass,
  Plane,
  Award,
  Lock,
  Send,
  UserCheck,
  Check,
  Eye,
  RefreshCw,
  Info,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentApplication, ApplicationStatus, DocumentType, DocumentItem } from '../types';
import { siteConfig, pricing } from '../config/siteConfig';
import { calculateApplicationProgress } from '../services/applicationService';
import { notificationService, AppNotification } from '../services/notificationService';
import {
  getStoredApplications,
  getActiveApplicationId,
  setActiveApplicationId,
  getApplicationById,
  updateApplicationStatus,
  uploadOrReplaceDocument,
  recordPayment,
  addAdvisorMessage
} from '../data/applicationStorage';
import { useSiteContent } from '../context/SiteContentContext';
import { useCloudSync } from '../hooks/useCloudSync';
import { isSupabaseConfigured } from '../lib/supabase';
import { uploadDocumentFile, getDocumentUrl, validateDocumentFile, formatBytes, ACCEPTED_DOCUMENT_TYPES } from '../services/documentFiles';

const CLOUD = isSupabaseConfigured();

interface StudentDashboardProps {
  onBackToHome: () => void;
  onGoToApply: () => void;
  onGoToAdmin: () => void;
  onLogout?: () => void;
  initialAppId?: string;
}

const AdvisorAvatar: React.FC<{ src?: string; name: string; className: string }> = ({ src, name, className }) => {
  const [failed, setFailed] = React.useState(false);
  const initials = name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  if (!src || failed) {
    return (
      <div className={`${className} bg-[#6D1838] text-white font-bold flex items-center justify-center shrink-0`} aria-label={name}>
        {initials}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setFailed(true)} className={`${className} object-cover shrink-0`} />;
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onBackToHome,
  onGoToApply,
  onGoToAdmin,
  onLogout,
  initialAppId,
}) => {
  const { content: siteContent } = useSiteContent();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [activeApp, setActiveApp] = useState<StudentApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'admission_visa' | 'payments' | 'predeparture' | 'messages'>('overview');
  
  // Auth context
  const { logout, isAdmin } = useAuth();
  const { loading: cloudLoading } = useCloudSync();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Document upload modal state
  const [uploadModalDoc, setUploadModalDoc] = useState<DocumentItem | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Payment modal state: supports admissionPayment or finalPayment
  const [payingStage, setPayingStage] = useState<'admissionPayment' | 'finalPayment' | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Derived state and setters for final balance / stage payments
  const isPayingFinalBalance = payingStage === 'finalPayment';
  const setIsPayingFinalBalance = (val: boolean) => setPayingStage(val ? 'finalPayment' : null);
  
  // Messages state
  const [chatInput, setChatInput] = useState('');

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const loadData = () => {
    const all = getStoredApplications();
    setApplications(all);
    const targetId = initialAppId || getActiveApplicationId();
    const current = all.find(a => a.id === targetId) || all[0];
    if (current) {
      setActiveApp(current);
      setActiveApplicationId(current.id);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('chinastudy_applications_updated', handleUpdate);
    window.addEventListener('chinastudy_active_app_updated', handleUpdate);

    return () => {
      window.removeEventListener('chinastudy_applications_updated', handleUpdate);
      window.removeEventListener('chinastudy_active_app_updated', handleUpdate);
    };
  }, [initialAppId]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleSelectApp = (id: string) => {
    setActiveApplicationId(id);
    const found = applications.find(a => a.id === id);
    if (found) setActiveApp(found);
  };

  const closeUploadModal = () => {
    setUploadModalDoc(null);
    setUploadFile(null);
    setUploadError(null);
    setUploadFileName('');
  };

  const handleOpenOwnDocument = async (doc: DocumentItem) => {
    if (!doc.storagePath) return;
    try {
      const url = await getDocumentUrl(doc.storagePath);
      window.open(url, '_blank', 'noopener');
    } catch (err: any) {
      showToast(err?.message || 'Could not open the file.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !uploadModalDoc) return;

    if (CLOUD) {
      if (!uploadFile) {
        setUploadError('Please choose a file first.');
        return;
      }
      setUploading(true);
      setUploadError(null);
      try {
        const up = await uploadDocumentFile(activeApp.id, uploadModalDoc.type, uploadFile);
        const updated = uploadOrReplaceDocument(activeApp.id, uploadModalDoc.type, { name: up.name, size: up.size, storagePath: up.storagePath });
        if (updated) setActiveApp(updated);
        showToast(`"${uploadModalDoc.title}" uploaded. The admissions team has been notified.`);
        closeUploadModal();
      } catch (err: any) {
        setUploadError(err?.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
      return;
    }

    const fileName = uploadFileName.trim() || `${uploadModalDoc.type}_verified_scan.pdf`;
    const updated = uploadOrReplaceDocument(activeApp.id, uploadModalDoc.type, {
      name: fileName,
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
    });

    if (updated) {
      setActiveApp(updated);
      setUploadModalDoc(null);
      setUploadFileName('');
      showToast(`Document "${uploadModalDoc.title}" submitted successfully for audit!`);
    }
  };

  const handleProcessStagePayment = () => {
    if (!activeApp || !payingStage) return;
    if (CLOUD) {
      const stageLabel = payingStage === 'admissionPayment' ? `Stage 2 Admission Payment ($${pricing.admissionPaymentUSD})` : `Stage 3 Final Payment ($${pricing.finalPaymentUSD.toLocaleString()})`;
      const text = `Hello, I would like to pay the ${stageLabel} for my application ${activeApp.id}. Could you send me the payment instructions?`;
      window.open(`https://wa.me/${siteConfig.contact.whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      setPayingStage(null);
      showToast('Your advisor will send you payment instructions and confirm the payment in your dashboard.');
      return;
    }
    setPaymentProcessing(true);

    const isAdmission = payingStage === 'admissionPayment';
    const stageAmount = isAdmission ? pricing.admissionPayment.usd : pricing.finalPayment.usd;
    const stageLabel = isAdmission ? 'Admission Payment' : 'Final Payment';

    setTimeout(() => {
      setPaymentProcessing(false);
      const updated = recordPayment(activeApp.id, payingStage, {
        amount: stageAmount,
        method: 'Credit Card (Instant)',
      });

      if (updated) {
        setActiveApp(updated);
        showToast(`${stageLabel} ($${stageAmount} USD) settled successfully!`);
      }
      setPayingStage(null);
    }, 1200);
  };

  const handlePayFinalBalance = () => {
    handleProcessStagePayment();
  };

  const handleConfirmInstitutionDeposit = () => {
    if (!activeApp || !activeApp.institutionDeposit) return;
    const updated: StudentApplication = {
      ...activeApp,
      institutionDeposit: {
        ...activeApp.institutionDeposit,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        receiptNumber: `INST-CONF-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    };
    setActiveApp(updated);
    showToast(`Institution deposit ($${activeApp.institutionDeposit.amountUSD} USD) recorded as settled!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !chatInput.trim()) return;

    const studentText = chatInput.trim();
    setChatInput('');

    const updated = addAdvisorMessage(
      activeApp.id,
      'student',
      `${activeApp.personal.firstName} ${activeApp.personal.lastName}`,
      studentText
    );

    if (updated) setActiveApp(updated);

    // Auto-reply simulation from advisor after 1.5s
    setTimeout(() => {
      const counselorReplies = [
        `Thank you for your message, ${activeApp.personal.firstName}. I have reviewed your file and our admissions team is in direct communication with the admissions faculty.`,
        `Hello ${activeApp.personal.firstName}, we have noted your inquiry. Your documentation meets all official criteria and we will update your timeline immediately as soon as the admissions committee issues the next confirmation.`,
        `Great update! Please make sure your passport validity remains at least 18 months, as required for the Chinese student visa issuance.`,
      ];
      const randomReply = counselorReplies[Math.floor(Math.random() * counselorReplies.length)];
      const afterReply = addAdvisorMessage(activeApp.id, 'advisor', activeApp.advisor.name, randomReply);
      if (afterReply) setActiveApp(afterReply);
    }, 1500);
  };

  if (!activeApp) {
    if (cloudLoading) {
      return (
        <div className="min-h-screen bg-[#FAF7F9] flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-[#6D1838] border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#FAF7F9] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm max-w-md w-full">
          <GraduationCap className="w-12 h-12 text-[#6D1838] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#18151B]">No application yet</h2>
          <p className="text-sm text-[#575260] mt-1 mb-5">
            Start your application to track your documents, admission and visa progress here.
          </p>
          <div className="space-y-2">
            <button
              onClick={onGoToApply}
              className="w-full px-5 py-3 bg-[#6D1838] hover:bg-[#58122c] text-white text-sm font-bold rounded-xl"
            >
              Start Your Application
            </button>
            <button
              onClick={onBackToHome}
              className="w-full px-5 py-3 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-50"
            >
              Back to Website
            </button>
            <button
              onClick={async () => { await logout(); (onLogout || onBackToHome)(); }}
              className="w-full px-5 py-2 text-xs font-semibold text-rose-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Status mapping - USD ONLY
  const statusBadges: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string }> = {
    deposit_pending: { label: 'Stage 1: Initial Deposit Pending ($515 USD)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    deposit_paid: { label: 'Stage 1: Deposit Paid ($515 USD)', bg: 'bg-neutral-100', text: 'text-neutral-800', border: 'border-neutral-300' },
    document_review: { label: 'Document Review in Progress', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    university_submitted: { label: 'Submitted to Admissions Committee', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    interview_evaluation: { label: 'Faculty Evaluation / Interview', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
    admission_granted: { label: 'Official Admission Offer Granted! 🎉', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    admission_payment_pending: { label: 'Stage 2: Admission Payment Pending ($858 USD)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    jw202_issued: { label: 'JW202 / JW201 Visa Form Issued 📄', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    final_payment_pending: { label: 'Stage 3: Final Payment Pending ($1,716 USD)', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
    visa_preparation: { label: 'Chinese Embassy Visa Preparation (X1/X2)', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
    pre_departure: { label: 'Visa Approved & Pre-Departure Ready ✈️', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400' },
  };

  const currentBadge = statusBadges[activeApp.status] || statusBadges.deposit_paid;

  // 3-Choice Preferences & Matching Status
  const firstChoice = activeApp.preferences.firstChoice || {
    priority: 1,
    fieldOfStudy: activeApp.preferences.preferredField || 'Computer Science & AI',
    program: activeApp.preferences.specificProgram || `${activeApp.preferences.targetDegree} Degree Track`,
    degreeLevel: activeApp.preferences.targetDegree,
    studyLanguage: 'English',
    intake: activeApp.preferences.intakeSeason || 'Autumn Intake',
  };

  const secondChoice = activeApp.preferences.secondChoice || {
    priority: 2,
    fieldOfStudy: activeApp.preferences.preferredField || 'Software Engineering & IT',
    program: `Alternative Curriculum in ${activeApp.preferences.preferredField}`,
    degreeLevel: activeApp.preferences.targetDegree,
    studyLanguage: 'English',
    intake: activeApp.preferences.intakeSeason || 'Autumn Intake',
  };

  const thirdChoice = activeApp.preferences.thirdChoice || {
    priority: 3,
    fieldOfStudy: 'Engineering & Technology',
    program: `Backup Curriculum in ${activeApp.preferences.preferredField}`,
    degreeLevel: activeApp.preferences.targetDegree,
    studyLanguage: 'English',
    intake: activeApp.preferences.intakeSeason || 'Autumn Intake',
  };

  const matchingStatusMap: Record<string, { label: string; bg: string; text: string; border: string; desc: string }> = {
    preferences_submitted: {
      label: 'Preferences Submitted',
      bg: 'bg-neutral-100',
      text: 'text-neutral-800',
      border: 'border-neutral-300',
      desc: 'Your three study preferences are registered. Committee evaluation is preparing candidate matching.',
    },
    under_review: {
      label: 'Under Review',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      desc: 'Admissions committee is auditing academic transcripts, eligibility standards, and qualification equivalence.',
    },
    matching_in_progress: {
      label: 'Matching in Progress',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      desc: 'Evaluating current academic availability and maximum scholarship quotas across your 1st, 2nd, and 3rd choices.',
    },
    opportunity_identified: {
      label: 'Opportunity Identified',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-300',
      desc: 'Strong academic match and scholarship quota confirmed. Formal placement dossier prepared.',
    },
    application_preparation: {
      label: 'Application Preparation',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      desc: 'Finalizing formal academic dossier for committee registry.',
    },
    admission_process: {
      label: 'Admission Process',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      desc: 'Academic admissions committee review in final evaluation stage.',
    },
    admission_confirmed: {
      label: 'Admission Confirmed',
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      border: 'border-emerald-400',
      desc: 'Official admission notice secured for your matching study preference.',
    },
  };

  const rawMatchingKey = activeApp.preferences.matchingStatus || (
    ['admission_granted', 'jw202_issued', 'final_payment_pending', 'visa_preparation', 'pre_departure'].includes(activeApp.status)
      ? 'admission_confirmed'
      : activeApp.status === 'admission_payment_pending'
      ? 'admission_process'
      : activeApp.status === 'interview_evaluation'
      ? 'application_preparation'
      : activeApp.status === 'university_submitted'
      ? 'opportunity_identified'
      : activeApp.status === 'document_review'
      ? 'under_review'
      : 'matching_in_progress'
  );

  const matchingInfo = matchingStatusMap[rawMatchingKey] || matchingStatusMap.matching_in_progress;

  // Milestone unlocks
  const isAdmissionUnlocked = ['admission_granted', 'admission_payment_pending', 'jw202_issued', 'final_payment_pending', 'visa_preparation', 'pre_departure'].includes(activeApp.status);
  const isJWUnlocked = ['jw202_issued', 'final_payment_pending', 'visa_preparation', 'pre_departure'].includes(activeApp.status);

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-[#18151B]">
      {/* Toast Feedback */}
      {feedbackToast && (
        <aside aria-label="Notification" className="fixed top-20 right-4 z-50 bg-[#18151B] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </aside>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
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
              <span className="font-extrabold text-sm sm:text-base text-[#18151B] truncate">
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Student Dashboard</span>
              </span>
            </div>
          </div>

          {/* Quick Profile / Application Switcher & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setSwitcherOpen(o => !o)}
                aria-expanded={switcherOpen}
                className="h-9 px-2.5 sm:px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="font-mono truncate max-w-[92px] sm:max-w-[180px]">
                  <span className="hidden sm:inline font-sans">{activeApp.personal.firstName} · </span>{activeApp.id}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${switcherOpen ? '-rotate-90' : 'rotate-90'}`} />
              </button>
              {switcherOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-[min(18rem,calc(100vw-2rem))] bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50">
                    <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Switch Active Application
                    </div>
                    {applications.map(app => (
                      <button
                        key={app.id}
                        onClick={() => { handleSelectApp(app.id); setSwitcherOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between gap-2 hover:bg-[#FAF2F5] transition-colors ${
                          app.id === activeApp.id ? 'bg-[#FAF2F5] font-bold text-[#6D1838]' : 'text-neutral-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate">{app.personal.firstName} {app.personal.lastName}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{app.id} · {app.preferences.specificProgram || app.preferences.preferredField || app.preferences.targetDegree}</p>
                        </div>
                        {app.id === activeApp.id && <Check className="w-3.5 h-3.5 text-[#6D1838] shrink-0" />}
                      </button>
                    ))}
                    <div className="border-t border-neutral-100 mt-1 pt-1">
                      <button
                        onClick={onGoToApply}
                        className="w-full text-left px-3 py-2.5 text-xs text-[#6D1838] font-bold hover:bg-[#FAF2F5]"
                      >
                        + Submit Another Application
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={onGoToAdmin}
                aria-label="Admin portal"
                className="h-9 px-2.5 sm:px-3 bg-[#FAF2F5] hover:bg-[#F3EEFA] text-[#6D1838] border border-[#EAD5DE] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Open the admissions admin portal"
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden lg:inline">Admin Portal</span>
              </button>
            )}

            <button
              onClick={async () => {
                await logout();
                if (onLogout) {
                  onLogout();
                } else {
                  onBackToHome();
                }
              }}
              aria-label="Log out"
              className="h-9 px-2.5 sm:px-3 bg-white hover:bg-rose-50 text-neutral-700 hover:text-rose-700 border border-neutral-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Application Header Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-[#6D1838] bg-[#FAF2F5] px-2.5 py-0.5 rounded-md border border-[#EAD5DE]">
                  {activeApp.id}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {currentBadge.label}
                </span>
                <span className="text-xs text-neutral-400">
                  Applied on {activeApp.createdAt.split('T')[0]}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#18151B]">
                Welcome back, {activeApp.personal.firstName} {activeApp.personal.lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#575260] mt-1.5">
                <span className="flex items-center gap-1 font-semibold text-[#18151B]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#6D1838]" />
                  {firstChoice.degreeLevel} in {firstChoice.fieldOfStudy}
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#6D1838]" />
                  <strong className="text-[#18151B]">1st Choice:</strong> {firstChoice.program}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${matchingInfo.bg} ${matchingInfo.text} ${matchingInfo.border}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {matchingInfo.label}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Intake: {firstChoice.intake || activeApp.preferences.intakeSeason}
                </span>
              </div>

              {/* Dynamic Application Progress Bar */}
              <div className="mt-3.5 pt-3 border-t border-neutral-100 max-w-xl">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#575260] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#6D1838]" />
                    <span>Application Milestones Progress</span>
                  </span>
                  <span className="font-bold text-[#6D1838]">
                    {calculateApplicationProgress(activeApp.status)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6D1838] h-full rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${calculateApplicationProgress(activeApp.status)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats or Actions */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <a
                href={siteConfig.contact.whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>WhatsApp Advisor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setActiveTab('messages')}
                className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Advisor Messages ({activeApp.messages.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Action Required Banner */}
        {activeApp.status === 'admission_granted' && (
          <aside aria-label="Action required" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#FAF2F5] to-emerald-500/5 border-2 border-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Milestone Reached · Official Admission Secured!
                </span>
                <h3 className="text-base font-bold text-[#18151B]">
                  Your Admission Offer for {activeApp.admissionNotice?.program || activeApp.preferences.specificProgram || activeApp.preferences.preferredField} is Ready!
                </h3>
                <p className="text-xs text-[#575260] mt-0.5">
                  The academic admissions committee has officially accepted your dossier. You can review your admission notice in the 'Admission & Visa' tab.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('admission_visa')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
            >
              View Admission Letter
            </button>
          </aside>
        )}

        {activeApp.status === 'jw202_issued' && (
          <aside aria-label="Action required" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#6D1838]/10 via-[#FAF2F5] to-amber-500/10 border-2 border-[#6D1838] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D1838] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D1838]">
                  Action Required · Release Original Consular Packet
                </span>
                <h3 className="text-base font-bold text-[#18151B]">
                  JW202 Electronic Visa Form Issued (No. {activeApp.jw202Form?.formNumber})
                </h3>
                <p className="text-xs text-[#575260] mt-0.5">
                  Both your admission letter and JW202 government form are secured. Complete your Stage 3 final payment (${pricing.finalPaymentUSD.toLocaleString()} USD) to unlock DHL dispatch of original hard copies for your embassy visa interview.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPayingFinalBalance(true)}
              className="px-5 py-2.5 bg-[#6D1838] hover:bg-[#58122c] text-white text-xs font-bold rounded-xl shrink-0 transition-all shadow-md flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Stage 3 Balance (${pricing.finalPaymentUSD.toLocaleString()})</span>
            </button>
          </aside>
        )}

        {activeApp.documents.some(d => d.status === 'needs_resubmission') && (
          <aside aria-label="Action required" className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold">Document Attention Required:</strong>
              <p className="mt-0.5">
                Our admissions committee flagged one or more documents that need updated scanning or certified translation. Check your Document Vault below to upload revised copies.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('documents')}
              className="px-3 py-1.5 bg-amber-700 text-white font-bold rounded-lg text-xs hover:bg-amber-800 shrink-0"
            >
              Open Vault
            </button>
          </aside>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="sticky top-[53px] sm:top-[57px] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#FDFCFD]/95 backdrop-blur-md flex items-center gap-1 sm:gap-2 border-b border-neutral-200 overflow-x-auto no-scrollbar pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: Clock },
            { id: 'documents', label: `Documents (${activeApp.documents.length})`, icon: FileText },
            { id: 'admission_visa', label: 'Admission & Visa', icon: Award },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'predeparture', label: 'Pre-Departure', icon: Plane },
            { id: 'messages', label: `Messages (${activeApp.messages.length})`, icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => { setActiveTab(tab.id as any); (e.currentTarget as HTMLElement).scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }}
                className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-[#6D1838] text-[#6D1838] bg-[#FAF2F5]/60 rounded-t-lg'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW & PROGRESS TRACKER ================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Left 2 Cols: Study Preferences + 8-Stage Interactive Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card: Study Preferences (3-Choice System) */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D1838]">
                      Candidate Program Selections
                    </span>
                    <h2 className="text-base font-bold text-[#18151B]">
                      Study Preferences
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#575260] font-medium">Status:</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${matchingInfo.bg} ${matchingInfo.text} ${matchingInfo.border}`}>
                      {matchingInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF2F5]/70 rounded-xl border border-[#EAD5DE] text-xs text-[#575260] space-y-1">
                  <p className="font-semibold text-[#6D1838]">
                    {matchingInfo.desc}
                  </p>
                  <p className="text-[11px] text-[#575260]">
                    Evaluation Hierarchy: 1st Choice → 2nd Choice → 3rd Choice. Study In China evaluates options based on availability, eligibility, and scholarship potential without requiring institution pre-selection.
                  </p>
                </div>

                {/* 3 Choices Priority Blocks */}
                <div className="space-y-3">
                  {/* 1st Choice */}
                  <div className="p-3.5 bg-neutral-50/80 rounded-xl border-2 border-[#6D1838]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#6D1838] text-white text-[10px] font-bold rounded uppercase">
                          1st Choice
                        </span>
                        <strong className="text-xs text-[#18151B]">Primary Preference</strong>
                      </div>
                      <h4 className="text-sm font-bold text-[#18151B]">
                        {firstChoice.program}
                      </h4>
                      <p className="text-xs text-[#575260]">
                        Field: <span className="font-medium text-[#18151B]">{firstChoice.fieldOfStudy}</span> · Degree: <span className="font-medium text-[#18151B]">{firstChoice.degreeLevel}</span> · Language: <span className="font-medium text-[#18151B]">{firstChoice.studyLanguage}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 bg-white text-[#6D1838] border border-[#6D1838]/30 rounded-lg text-xs font-bold shadow-2xs">
                        Highest Priority
                      </span>
                      <span className="block text-[10px] text-neutral-400 mt-0.5">{firstChoice.intake}</span>
                    </div>
                  </div>

                  {/* 2nd Choice */}
                  <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#6C3B9E] text-white text-[10px] font-bold rounded uppercase">
                          2nd Choice
                        </span>
                        <strong className="text-xs text-[#18151B]">Alternative Preference</strong>
                      </div>
                      <h4 className="text-sm font-bold text-[#18151B]">
                        {secondChoice.program}
                      </h4>
                      <p className="text-xs text-[#575260]">
                        Field: <span className="font-medium text-[#18151B]">{secondChoice.fieldOfStudy}</span> · Degree: <span className="font-medium text-[#18151B]">{secondChoice.degreeLevel}</span> · Language: <span className="font-medium text-[#18151B]">{secondChoice.studyLanguage}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 bg-white text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold">
                        Alternative Option
                      </span>
                      <span className="block text-[10px] text-neutral-400 mt-0.5">{secondChoice.intake}</span>
                    </div>
                  </div>

                  {/* 3rd Choice */}
                  <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-800 text-white text-[10px] font-bold rounded uppercase">
                          3rd Choice
                        </span>
                        <strong className="text-xs text-[#18151B]">Backup Preference</strong>
                      </div>
                      <h4 className="text-sm font-bold text-[#18151B]">
                        {thirdChoice.program}
                      </h4>
                      <p className="text-xs text-[#575260]">
                        Field: <span className="font-medium text-[#18151B]">{thirdChoice.fieldOfStudy}</span> · Degree: <span className="font-medium text-[#18151B]">{thirdChoice.degreeLevel}</span> · Language: <span className="font-medium text-[#18151B]">{thirdChoice.studyLanguage}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 bg-white text-neutral-600 border border-neutral-200 rounded-lg text-xs font-semibold">
                        Backup Safeguard
                      </span>
                      <span className="block text-[10px] text-neutral-400 mt-0.5">{thirdChoice.intake}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8-Stage Interactive Admissions & Visa Pipeline */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                  <div>
                    <h2 className="text-base font-bold text-[#18151B]">
                      8-Stage Admissions & Visa Pipeline
                    </h2>
                    <p className="text-xs text-[#575260]">
                      Track every milestone from deposit to your campus arrival in China.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#6D1838]">
                    {activeApp.timeline.filter(t => t.completed).length} of 8 Completed
                  </span>
                </div>

                {/* Timeline vertical layout */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {activeApp.timeline.map((step, idx) => {
                    return (
                      <div key={step.id || idx} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                            step.completed
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : step.current
                              ? 'bg-[#6D1838] text-white ring-4 ring-[#6D1838]/20 animate-pulse'
                              : 'bg-white border-2 border-neutral-300 text-neutral-400'
                          }`}
                        >
                          {step.completed ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        <div className="bg-neutral-50/70 hover:bg-neutral-50 p-4 rounded-xl border border-neutral-200 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h4 className="font-bold text-xs sm:text-sm text-[#18151B] flex items-center gap-2">
                              <span>{step.title}</span>
                              {step.current && (
                                <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-[#FAF2F5] text-[#6D1838] rounded-full border border-[#EAD5DE]">
                                  Current Stage
                                </span>
                              )}
                            </h4>
                            <span className="text-[11px] font-medium text-neutral-400">
                              {step.date}
                            </span>
                          </div>
                          <p className="text-xs text-[#575260]">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Advisor & Profile Summary */}
            <div className="space-y-6">
              {/* Assigned Advisor Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <AdvisorAvatar
                    src={activeApp.advisor.avatar}
                    name={activeApp.advisor.name}
                    className="w-14 h-14 rounded-2xl text-base border-2 border-[#FAF2F5] shadow-xs"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D1838] bg-[#FAF2F5] px-2 py-0.5 rounded">
                      Assigned Admissions Officer
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#18151B] mt-0.5">
                      {activeApp.advisor.name}
                    </h3>
                    <p className="text-xs text-[#575260]">{activeApp.advisor.title}</p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#575260]">
                    <span>Email:</span>
                    <a href={`mailto:${activeApp.advisor.email}`} className="font-medium text-[#18151B] hover:text-[#6D1838]">
                      {activeApp.advisor.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[#575260]">
                    <span>Direct WhatsApp:</span>
                    <span className="font-medium text-[#18151B]">{activeApp.advisor.whatsapp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#575260]">
                    <span>Working Hours:</span>
                    <span className="text-neutral-700">09:00 – 19:00 (GMT+8 Beijing)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={siteConfig.contact.whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-center rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="py-2.5 px-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-center rounded-xl text-xs font-semibold transition-colors"
                  >
                    In-App Chat
                  </button>
                </div>
              </div>

              {/* 3-Stage Payment Summary */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#18151B]">
                    Payment Status
                  </span>
                  <span className="text-xs font-bold text-[#6D1838]">
                    ${siteConfig.pricing.totalUSD.toLocaleString()} USD Total
                  </span>
                </div>

                {/* Stage 1: Initial Deposit */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block">Initial Deposit</span>
                    <span className="text-[11px] text-emerald-700">
                      {activeApp.payments.deposit.paid ? `Paid on ${activeApp.payments.deposit.date || new Date().toISOString().split('T')[0]}` : 'Pending'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-emerald-800">${siteConfig.pricing.depositUSD} USD</span>
                    <span className="block text-[10px] font-bold text-emerald-700">
                      {activeApp.payments.deposit.paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Stage 2: Admission Payment */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  activeApp.payments.admissionPayment.paid
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isAdmissionUnlocked
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-neutral-50 border-neutral-200 opacity-75'
                }`}>
                  <div>
                    <span className="font-bold text-[#18151B] block">Admission Payment</span>
                    <span className="text-[11px] text-[#575260]">
                      {activeApp.payments.admissionPayment.paid
                        ? `Paid on ${activeApp.payments.admissionPayment.date}`
                        : isAdmissionUnlocked
                        ? 'Payable now (Admission confirmed)'
                        : 'Locked until admission'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#18151B]">${siteConfig.pricing.admissionPaymentUSD} USD</span>
                    {activeApp.payments.admissionPayment.paid ? (
                      <span className="block text-[10px] font-bold text-emerald-700">✓ Paid</span>
                    ) : isAdmissionUnlocked ? (
                      <span className="block text-[10px] font-bold text-amber-700">Pending</span>
                    ) : (
                      <span className="block text-[10px] font-bold text-neutral-400">Locked</span>
                    )}
                  </div>
                </div>

                {!activeApp.payments.admissionPayment.paid && isAdmissionUnlocked && (
                  <button
                    onClick={() => setPayingStage('admissionPayment')}
                    className="w-full py-2 bg-[#6C3B9E] hover:bg-[#582e82] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Admission Payment (${siteConfig.pricing.admissionPaymentUSD} USD)</span>
                  </button>
                )}

                {/* Stage 3: Final Payment */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  activeApp.payments.finalPayment.paid
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isJWUnlocked
                    ? 'bg-emerald-50/30 border-emerald-300'
                    : 'bg-neutral-50 border-neutral-200 opacity-75'
                }`}>
                  <div>
                    <span className="font-bold text-[#18151B] block">Final Payment</span>
                    <span className="text-[11px] text-[#575260]">
                      {activeApp.payments.finalPayment.paid
                        ? `Paid on ${activeApp.payments.finalPayment.date}`
                        : isJWUnlocked
                        ? 'Payable now (JW202 issued)'
                        : 'Locked until JW202/JW201'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#18151B]">${siteConfig.pricing.finalPaymentUSD.toLocaleString()} USD</span>
                    {activeApp.payments.finalPayment.paid ? (
                      <span className="block text-[10px] font-bold text-emerald-700">✓ Paid</span>
                    ) : isJWUnlocked ? (
                      <span className="block text-[10px] font-bold text-amber-700">Pending</span>
                    ) : (
                      <span className="block text-[10px] font-bold text-neutral-400">Locked</span>
                    )}
                  </div>
                </div>

                {!activeApp.payments.finalPayment.paid && isJWUnlocked && (
                  <button
                    onClick={() => setPayingStage('finalPayment')}
                    className="w-full py-2 bg-[#6D1838] hover:bg-[#58122c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Final Payment (${siteConfig.pricing.finalPaymentUSD.toLocaleString()} USD)</span>
                  </button>
                )}

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#575260]">
                  <span>Total: <strong>${siteConfig.pricing.totalUSD.toLocaleString()} USD</strong></span>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-[#6D1838] font-bold hover:underline cursor-pointer"
                  >
                    View Invoices & Receipts →
                  </button>
                </div>
              </div>

              {/* Institution Deposit Required Notice Card in Overview (if required) */}
              {activeApp.institutionDeposit && activeApp.institutionDeposit.required && (
                <div className="bg-amber-50/70 rounded-2xl border border-amber-300 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-amber-800" />
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Institution Deposit Required
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                      Separate from service fees
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#18151B] block">Place Confirmation Deposit</span>
                      <span className="text-[11px] text-[#575260]">Deadline: {activeApp.institutionDeposit.deadline}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-base text-amber-900">${activeApp.institutionDeposit.amountUSD} USD</span>
                      <span className={`block text-[10px] font-bold ${
                        activeApp.institutionDeposit.status === 'paid' ? 'text-emerald-700' : 'text-amber-800'
                      }`}>
                        {activeApp.institutionDeposit.status === 'paid' ? '✓ Settled' : 'Pending Confirmation'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#575260] leading-relaxed">
                    Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees. Depending on the institution and program, it may be deducted from tuition or accommodation costs. The applicable amount and conditions are determined by the institution.
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="text-xs font-bold text-[#6D1838] hover:underline cursor-pointer"
                    >
                      View Instructions & Policy →
                    </button>
                    {activeApp.institutionDeposit.status !== 'paid' && (
                      <button
                        onClick={handleConfirmInstitutionDeposit}
                        className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Record Deposit Settled
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: DOCUMENT VAULT ================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-lg font-bold text-[#18151B]">
                    Student Document Vault
                  </h2>
                  <p className="text-xs text-[#575260] mt-0.5">
                    Official dossiers submitted for accredited degree admissions and embassy student visa vetting.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-medium">
                    {activeApp.documents.filter(d => d.status === 'verified').length} of {activeApp.documents.length} Verified
                  </span>
                </div>
              </div>

              {/* Document items list */}
              <div className="space-y-3">
                {activeApp.documents.map(doc => {
                  const isVerified = doc.status === 'verified';
                  const needsFix = doc.status === 'needs_resubmission';
                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isVerified
                          ? 'bg-white border-neutral-200 hover:border-neutral-300'
                          : needsFix
                          ? 'bg-amber-50/50 border-amber-300'
                          : 'bg-neutral-50/50 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isVerified ? 'bg-emerald-100 text-emerald-700' : needsFix ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-[#18151B]">
                              {doc.title}
                            </h4>
                            {doc.required && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                                Required
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : needsFix
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {isVerified ? '✓ Verified by Admissions' : needsFix ? 'Needs Attention' : doc.status === 'missing' || !doc.name ? 'Not uploaded' : 'Audit Pending'}
                            </span>
                          </div>

                          {doc.receivedAt && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Receipt acknowledged on {new Date(doc.receivedAt).toLocaleDateString()}
                            </p>
                          )}

                          <p className="text-xs text-[#575260] mt-0.5 break-all">
                            {doc.name || 'File not yet uploaded'} {doc.fileSize && `· ${doc.fileSize}`} {doc.uploadDate && `· Uploaded ${doc.uploadDate}`}
                          </p>

                          {doc.feedback && (
                            <div className="mt-2 p-2 bg-amber-100/70 border border-amber-300 rounded text-xs text-amber-900 font-medium">
                              <strong>Counselor Feedback:</strong> {doc.feedback}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {doc.storagePath && (
                          <button
                            type="button"
                            onClick={() => handleOpenOwnDocument(doc)}
                            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            View
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setUploadModalDoc(doc)}
                          className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{doc.name ? 'Replace File' : 'Upload'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Guidance Requirements Card */}
            <div className="p-5 bg-[#FAF7F9] border border-neutral-200 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-[#18151B] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#6D1838]" /> Official Documentation & Admissions Guidelines
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[#575260]">
                <li><strong>Passport:</strong> Scanned color copy of biological details page. Minimum 18 months validity required for X1 visa issuance.</li>
                <li><strong>Transcripts & Diplomas:</strong> Documents not in English or Chinese must be accompanied by certified, notarized English translations.</li>
                <li><strong>Foreigner Physical Examination:</strong> Standard PRC Ministry of Health form. Must have hospital stamps across applicant photo and blood lab records.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ADMISSION & VISA PACK ================= */}
        {activeTab === 'admission_visa' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Admission Letter Section */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D1838]">
                    Official Academic Credential
                  </span>
                  <h2 className="text-lg font-bold text-[#18151B]">
                    Admission Notice (录取通知书)
                  </h2>
                </div>
                {activeApp.admissionNotice ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    ✓ Official Offer Granted
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full">
                    Pending Official Issuance
                  </span>
                )}
              </div>

              {activeApp.admissionNotice ? (
                <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-[#FCFBF8] to-[#FFFDF9] border-2 border-amber-300/80 rounded-2xl shadow-sm space-y-5 relative">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                        录
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#18151B]">
                          Higher Education Admissions Directorate
                        </h3>
                        <p className="text-xs text-amber-900 font-medium">International Student Admissions Office</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-mono font-bold text-[#6D1838] block">{activeApp.admissionNotice.studentRegistrationNo}</span>
                      <span className="text-neutral-400">Date: {activeApp.admissionNotice.issueDate}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-neutral-800">
                    <p>
                      Dear <strong>{activeApp.personal.firstName} {activeApp.personal.lastName}</strong> (Passport: {activeApp.personal.nationality}),
                    </p>
                    <p>
                      We are pleased to inform you that upon evaluation by the International Student Academic Admissions Committee, you have been formally admitted for the <strong>{activeApp.admissionNotice.program}</strong> starting <strong>{activeApp.admissionNotice.intake}</strong>.
                    </p>
                    <p>
                      Please bring this original Admission Notice along with your Visa Application for Study in China (Form JW202/JW201) to the Embassy/Consulate General of the People's Republic of China in your home country to apply for your X1 Student Visa.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-amber-200 flex items-center justify-between">
                    <div className="text-xs text-[#575260]">
                      <span>Registration Code: </span>
                      <strong className="font-mono text-[#18151B]">{activeApp.admissionNotice.studentRegistrationNo}</strong>
                    </div>
                    <div className="w-20 h-20 rounded-full border-2 border-rose-600/70 text-rose-700 flex items-center justify-center text-[10px] font-bold text-center rotate-[-12deg] select-none">
                      [OFFICIAL<br />ADMISSIONS<br />SEAL]
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#575260] bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                  <Award className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="font-bold text-[#18151B]">Admission evaluation is currently underway.</p>
                  <p className="max-w-md mx-auto mt-1">
                    Once the admissions committee completes the credential review, your verified digital offer notice will be published directly here.
                  </p>
                </div>
              )}
            </div>

            {/* JW202 Government Visa Form Section */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D1838]">
                    Ministry of Education Government Form
                  </span>
                  <h2 className="text-lg font-bold text-[#18151B]">
                    JW202 / JW201 Visa Authorization Document (外国留学人员来华签证申请表)
                  </h2>
                </div>
                {activeApp.jw202Form ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    ✓ JW202 Form Ready
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full">
                    In Ministry Processing
                  </span>
                )}
              </div>

              {activeApp.jw202Form ? (
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#575260] block text-[11px]">Form Number:</span>
                      <strong className="font-mono text-[#6D1838] font-bold">{activeApp.jw202Form.formNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[#575260] block text-[11px]">Visa Category:</span>
                      <strong className="text-[#18151B]">X1 Visa (Study &gt; 180 Days)</strong>
                    </div>
                    <div>
                      <span className="text-[#575260] block text-[11px]">Validity:</span>
                      <strong className="text-[#18151B]">{activeApp.jw202Form.validUntil}</strong>
                    </div>
                    <div>
                      <span className="text-[#575260] block text-[11px]">Authorized Duration:</span>
                      <strong className="text-[#18151B]">{activeApp.jw202Form.authorizedDuration}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Electronic JW202 verification code is authenticated by the Ministry of Education of the PRC. Chinese embassies can scan this barcode directly during your visa interview.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#575260] bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="font-bold text-[#18151B]">JW202 government clearance in progress.</p>
                  <p className="max-w-md mx-auto mt-1">
                    Chinese municipal education commissions issue JW202 forms approximately 2 to 4 weeks after admission notices are stamped.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: PAYMENTS & INVOICES ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D1838]">
                    Official Billing Ledger
                  </span>
                  <h2 className="text-lg font-bold text-[#18151B]">
                    Payments, Receipts & Transparent Breakdown
                  </h2>
                  <p className="text-xs text-[#575260] mt-0.5">
                    Service fee breakdown: $515 initial deposit + $858 admission payment + $1,716 final payment = $3,089 USD total.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#575260] block">Total Service Fees:</span>
                  <span className="text-xl font-black text-[#18151B]">${siteConfig.pricing.totalUSD.toLocaleString()} USD</span>
                </div>
              </div>

              {/* Three-step payment status indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#EAD5DE] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#6D1838] uppercase block">Stage 1</span>
                  <h4 className="font-bold text-xs text-[#18151B]">Initial Deposit</h4>
                  <div className="text-base font-black text-[#6D1838] mt-0.5">${siteConfig.pricing.depositUSD} USD</div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-[#575260]">Application Stage</span>
                    <span className="font-bold text-emerald-700">
                      {activeApp.payments.deposit.paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E5D6F7] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#6C3B9E] uppercase block">Stage 2</span>
                  <h4 className="font-bold text-xs text-[#18151B]">Admission Payment</h4>
                  <div className="text-base font-black text-[#6C3B9E] mt-0.5">${siteConfig.pricing.admissionPaymentUSD} USD</div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-[#575260]">Post-Admission</span>
                    <span className={`font-bold ${
                      activeApp.payments.admissionPayment.paid
                        ? 'text-emerald-700'
                        : isAdmissionUnlocked
                        ? 'text-amber-800'
                        : 'text-neutral-400'
                    }`}>
                      {activeApp.payments.admissionPayment.paid
                        ? '✓ Paid'
                        : isAdmissionUnlocked
                        ? 'Pending'
                        : 'Locked until admission'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Stage 3</span>
                  <h4 className="font-bold text-xs text-[#18151B]">Final Payment</h4>
                  <div className="text-base font-black text-emerald-800 mt-0.5">${siteConfig.pricing.finalPaymentUSD.toLocaleString()} USD</div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-[#575260]">After JW202/JW201</span>
                    <span className={`font-bold ${
                      activeApp.payments.finalPayment.paid
                        ? 'text-emerald-700'
                        : isJWUnlocked
                        ? 'text-amber-800'
                        : 'text-neutral-400'
                    }`}>
                      {activeApp.payments.finalPayment.paid
                        ? '✓ Paid'
                        : isJWUnlocked
                        ? 'Pending'
                        : 'Locked until JW202/JW201'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-[#FAF7F9] text-[#575260] uppercase text-[10px] tracking-wider border-y border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Invoice / Receipt</th>
                      <th className="py-3 px-4">Stage & Description</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {/* Stage 1 Deposit */}
                    <tr>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#18151B]">
                        {activeApp.payments.deposit.receiptNumber || `REC-SIC-${new Date().getFullYear()}-001`}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-[#18151B] block">Stage 1: Initial Deposit</strong>
                        <span className="text-[11px] text-[#575260]">Credential evaluation, translation review, formal dossier preparation</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#18151B]">
                        ${siteConfig.pricing.depositUSD} USD
                      </td>
                      <td className="py-3.5 px-4 text-[#575260]">
                        {activeApp.payments.deposit.method || 'Credit Card'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          ✓ Paid ({activeApp.payments.deposit.date || new Date().toISOString().split('T')[0]})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => showToast('Receipt downloaded: REC-SIC-STAGE1.pdf')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#6D1838] hover:bg-[#FAF2F5] rounded border border-[#EAD5DE] transition-colors cursor-pointer"
                        >
                          Download Receipt
                        </button>
                      </td>
                    </tr>

                    {/* Stage 2 Admission Payment */}
                    <tr>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#18151B]">
                        {activeApp.payments.admissionPayment.paid
                          ? activeApp.payments.admissionPayment.receiptNumber || `REC-SIC-${new Date().getFullYear()}-ADM`
                          : 'INV-STAGE2-PENDING'}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-[#18151B] block">Stage 2: Admission Payment</strong>
                        <span className="text-[11px] text-[#575260]">
                          Due after official admission confirmation
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#18151B]">
                        ${siteConfig.pricing.admissionPaymentUSD} USD
                      </td>
                      <td className="py-3.5 px-4 text-[#575260]">
                        {activeApp.payments.admissionPayment.method || 'Card / Wire'}
                      </td>
                      <td className="py-3.5 px-4">
                        {activeApp.payments.admissionPayment.paid ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            ✓ Paid ({activeApp.payments.admissionPayment.date})
                          </span>
                        ) : isAdmissionUnlocked ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                            Pending
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full font-bold text-[10px]">
                            Locked until admission
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {activeApp.payments.admissionPayment.paid ? (
                          <button
                            onClick={() => showToast('Receipt downloaded: REC-SIC-STAGE2.pdf')}
                            className="px-2.5 py-1 text-xs font-semibold text-[#6D1838] hover:bg-[#FAF2F5] rounded border border-[#EAD5DE] transition-colors cursor-pointer"
                          >
                            Download Receipt
                          </button>
                        ) : isAdmissionUnlocked ? (
                          <button
                            onClick={() => setPayingStage('admissionPayment')}
                            className="px-3 py-1 text-xs font-bold text-white bg-[#6C3B9E] hover:bg-[#582e82] rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            Pay Stage 2 (${siteConfig.pricing.admissionPaymentUSD} USD)
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-medium">Locked</span>
                        )}
                      </td>
                    </tr>

                    {/* Stage 3 Final Payment */}
                    <tr>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#18151B]">
                        {activeApp.payments.finalPayment.paid
                          ? activeApp.payments.finalPayment.receiptNumber || `REC-SIC-${new Date().getFullYear()}-FINAL`
                          : 'INV-STAGE3-PENDING'}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-[#18151B] block">Stage 3: Final Payment</strong>
                        <span className="text-[11px] text-[#575260]">
                          Due after JW202/JW201 government visa authorization document is received
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#18151B]">
                        ${siteConfig.pricing.finalPaymentUSD.toLocaleString()} USD
                      </td>
                      <td className="py-3.5 px-4 text-[#575260]">
                        {activeApp.payments.finalPayment.method || 'Card / Wire'}
                      </td>
                      <td className="py-3.5 px-4">
                        {activeApp.payments.finalPayment.paid ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            ✓ Paid ({activeApp.payments.finalPayment.date})
                          </span>
                        ) : isJWUnlocked ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                            Pending
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full font-bold text-[10px]">
                            Locked until JW202/JW201
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {activeApp.payments.finalPayment.paid ? (
                          <button
                            onClick={() => showToast('Receipt downloaded: REC-SIC-STAGE3.pdf')}
                            className="px-2.5 py-1 text-xs font-semibold text-[#6D1838] hover:bg-[#FAF2F5] rounded border border-[#EAD5DE] transition-colors cursor-pointer"
                          >
                            Download Receipt
                          </button>
                        ) : isJWUnlocked ? (
                          <button
                            onClick={() => setPayingStage('finalPayment')}
                            className="px-3 py-1 text-xs font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            Pay Stage 3 (${siteConfig.pricing.finalPaymentUSD.toLocaleString()} USD)
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-medium">Locked</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= INSTITUTION DEPOSIT REQUIRED SECTION ================= */}
            <div className="bg-white rounded-2xl border border-amber-200/90 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#18151B]">
                        Institution Deposit Required
                      </h3>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                        Separate from Study In China service fees
                      </span>
                    </div>
                    <p className="text-xs text-[#575260]">
                      Notice and conditions regarding potential place confirmation deposits requested by host institutions.
                    </p>
                  </div>
                </div>

                {activeApp.institutionDeposit && activeApp.institutionDeposit.required && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                    activeApp.institutionDeposit.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {activeApp.institutionDeposit.status === 'paid' ? '✓ Institution Deposit Settled' : 'Action Required'}
                  </span>
                )}
              </div>

              {activeApp.institutionDeposit && activeApp.institutionDeposit.required ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-[#18151B] leading-relaxed">
                    <p className="font-medium">
                      "Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees. Depending on the institution and program, it may be deducted from tuition or accommodation costs. The applicable amount and conditions are determined by the institution."
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="text-[#575260] block text-[11px]">Deposit Amount (USD Only):</span>
                      <strong className="text-base font-black text-amber-900">${activeApp.institutionDeposit.amountUSD} USD</strong>
                      <span className="block text-[10px] text-[#575260] mt-0.5">Determined by host institution</span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="text-[#575260] block text-[11px]">Payment Deadline:</span>
                      <strong className="text-sm font-bold text-[#18151B]">{activeApp.institutionDeposit.deadline}</strong>
                      <span className="block text-[10px] text-amber-800 font-semibold mt-0.5">Strict faculty cutoff</span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="text-[#575260] block text-[11px]">Program Structure:</span>
                      <strong className="text-xs font-bold text-[#18151B]">{activeApp.institutionDeposit.programType}</strong>
                      <span className="block text-[10px] text-[#575260] mt-0.5">Determines deposit policy</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <strong className="text-xs font-bold text-[#18151B] block">Reason & Purpose:</strong>
                      <p className="text-[#575260] leading-relaxed">
                        {activeApp.institutionDeposit.reason}
                      </p>
                      <div className="pt-2 border-t border-neutral-200 space-y-1">
                        <strong className="text-[11px] font-bold text-[#18151B] block">Payment Instructions:</strong>
                        <p className="text-[#575260] font-mono text-[11px]">
                          {activeApp.institutionDeposit.paymentInstructions}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <strong className="text-xs font-bold text-[#18151B] block">Cost Deduction & Refund Conditions:</strong>
                      <ul className="space-y-1.5 text-[#575260]">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Tuition deduction:</strong> {activeApp.institutionDeposit.mayCreditTowardTuition ? 'The deposit may be deducted from tuition depending on the institution and program.' : 'Not credited to tuition for this program category.'}
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#6C3B9E] shrink-0 mt-0.5" />
                          <span>
                            <strong>Accommodation deduction:</strong> {activeApp.institutionDeposit.mayCreditTowardAccommodation ? 'The deposit may be deducted from accommodation depending on the institution and program.' : 'Not credited to accommodation.'}
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5 text-[11px] text-amber-900 pt-1">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Conditions:</strong> {activeApp.institutionDeposit.refundCancellationConditions}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100">
                    <button
                      onClick={() => showToast('Downloading official institution deposit notice (PDF)...')}
                      className="text-xs font-semibold text-[#6D1838] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Official Institution Notice & Payment Voucher</span>
                    </button>

                    {activeApp.institutionDeposit.status !== 'paid' ? (
                      <button
                        onClick={handleConfirmInstitutionDeposit}
                        className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        Record Institution Deposit as Settled
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Settled on {activeApp.institutionDeposit.paidDate} (Ref: {activeApp.institutionDeposit.receiptNumber})
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-[#575260] space-y-2">
                  <p className="font-semibold text-[#18151B]">
                    No Additional Institution Deposit Currently Required For Your Profile.
                  </p>
                  <p className="leading-relaxed">
                    Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees. Depending on the institution and program, it may be deducted from tuition or accommodation costs. The applicable amount and conditions are determined by the institution.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PRE-DEPARTURE & VISA GUIDE ================= */}
        {activeTab === 'predeparture' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D1838]">
                  Embassy Filing & Arrival Logistics
                </span>
                <h2 className="text-lg font-bold text-[#18151B]">
                  X1 Student Visa & China Arrival Checklist
                </h2>
                <p className="text-xs text-[#575260] mt-0.5">
                  Follow our step-by-step consular guidance to ensure seamless visa approval and smooth arrival in China.
                </p>
              </div>

              {/* Checklist blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Visa Interview Dossier */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#18151B] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#6D1838]" /> 1. Embassy X1 Visa Filing Packet
                  </h3>
                  <div className="space-y-2 text-xs">
                    {[
                      'Original Passport with minimum 18 months validity & 2 blank pages',
                      'Original Admission Notice (录取通知书) issued by host admissions directorate',
                      'Original Visa Application Form (JW202 / JW201) with government seal',
                      'Printed COVA Online Visa Application Form & confirmation appointment slip',
                      'Foreigner Physical Examination Record with blood lab report & chest X-ray',
                      'Recent passport photo (33mm x 48mm white background)',
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-2 text-[#575260] cursor-pointer hover:text-neutral-900">
                        <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 mt-0.5 accent-[#6D1838] rounded" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. China Living & Arrival Setup */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#18151B] flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#6D1838]" /> 2. China Arrival & Digital Setup
                  </h3>
                  <div className="space-y-2 text-xs">
                    {[
                      'Download Alipay app & link international Visa/Mastercard (TourCard)',
                      'Install reliable VPN prior to landing (e.g. Astrill / ExpressVPN)',
                      'Purchase Chinese international eSIM or prepare airport SIM kiosk pickup',
                      'Notify international orientation office of flight details for free airport liaison pickup',
                      'Exchange initial ¥1,500 – ¥2,000 RMB cash for emergency transit',
                      'Book dormitory room via international student housing portal',
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-2 text-[#575260] cursor-pointer hover:text-neutral-900">
                        <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4 mt-0.5 accent-[#6D1838] rounded" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: ADVISOR MESSAGES ================= */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs flex flex-col h-[560px] overflow-hidden animate-in fade-in duration-200">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 bg-[#FAF7F9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AdvisorAvatar
                  src={activeApp.advisor.avatar}
                  name={activeApp.advisor.name}
                  className="w-10 h-10 rounded-xl text-xs border border-neutral-200"
                />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#18151B]">
                    {activeApp.advisor.name}
                  </h3>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online · Senior Admissions Director
                  </p>
                </div>
              </div>

              <a
                href={siteConfig.contact.whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FCFBFD]">
              {activeApp.messages.map(msg => {
                const isStudent = msg.sender === 'student';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-neutral-400 mb-1 px-1">
                      {msg.senderName} · {msg.timestamp.split('T')[0]}
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isStudent
                          ? 'bg-[#6D1838] text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message or question for Elena..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 p-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#6D1838]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2.5 bg-[#6D1838] hover:bg-[#58122c] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: UPLOAD / REPLACE DOCUMENT ================= */}
      {uploadModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-[#18151B]">
                Upload {uploadModalDoc.title}
              </h3>
              <button
                onClick={closeUploadModal}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#575260]">
              {uploadModalDoc.description} (PDF or high-res JPG, max 10MB).
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {CLOUD ? (
                <>
                  <label className="block p-6 border-2 border-dashed border-neutral-300 hover:border-[#6D1838] bg-neutral-50 hover:bg-[#FAF2F5]/30 rounded-xl text-center cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#18151B] break-all">{uploadFile ? uploadFile.name : 'Tap to choose a file'}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{uploadFile ? formatBytes(uploadFile.size) : 'PDF, JPG, PNG or Word · max 10 MB'}</p>
                    <input
                      type="file"
                      accept={ACCEPTED_DOCUMENT_TYPES}
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0] || null;
                        const invalid = f ? validateDocumentFile(f) : null;
                        setUploadError(invalid);
                        setUploadFile(invalid ? null : f);
                      }}
                    />
                  </label>
                  {uploadError && <p role="alert" className="text-xs text-rose-700">{uploadError}</p>}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button type="button" onClick={closeUploadModal} className="px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-100">
                      Cancel
                    </button>
                    <button type="submit" disabled={uploading || !uploadFile} className="px-5 py-2.5 bg-[#6D1838] text-white rounded-xl text-sm font-bold hover:bg-[#58122c] disabled:opacity-50 shadow-xs">
                      {uploading ? 'Uploading…' : 'Upload document'}
                    </button>
                  </div>
                </>
              ) : (<>
              <div>
                <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
                  File Document Title / Custom Name
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${uploadModalDoc.type}_verified_scan.pdf`}
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                />
              </div>

              {/* Upload Dropzone Simulation */}
              <div
                onClick={() => setUploadFileName(`${uploadModalDoc.type}_official_certified_scan.pdf`)}
                className="p-6 border-2 border-dashed border-neutral-300 hover:border-[#6D1838] bg-neutral-50 hover:bg-[#FAF2F5]/30 rounded-xl text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="font-bold text-xs text-[#18151B]">Click to browse or drop file here</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Click to auto-attach verified certified scan</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6D1838] text-white rounded-xl text-xs font-bold hover:bg-[#58122c] shadow-xs"
                >
                  Save & Submit File
                </button>
              </div>
              </>)}
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROCESS STAGE / FINAL PAYMENT ================= */}
      {(payingStage !== null || isPayingFinalBalance) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D1838]">
                  {payingStage === 'admissionPayment'
                    ? 'Stage 2 Service Settlement · Admission Confirmed'
                    : 'Stage 3 Service Settlement · JW202/JW201 Issued'}
                </span>
                <h3 className="font-bold text-base text-[#18151B]">
                  {payingStage === 'admissionPayment'
                    ? `Pay Admission Payment ($${pricing.admissionPaymentUSD} USD)`
                    : `Pay Final Settlement ($${pricing.finalPaymentUSD.toLocaleString()} USD)`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setPayingStage(null);
                  setIsPayingFinalBalance(false);
                }}
                className="text-neutral-400 hover:text-neutral-700 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <strong className="block font-bold">
                {payingStage === 'admissionPayment'
                  ? '✓ Official Admission Offer Confirmed'
                  : '✓ Official Admission & JW202 Successfully Verified'}
              </strong>
              <p>
                {payingStage === 'admissionPayment'
                  ? 'Congratulations! As outlined in our 3-stage milestone structure, this payment confirms your admission and unlocks JW202/JW201 government visa processing.'
                  : 'Congratulations! As guaranteed in our 3-stage transparent pricing model, this final balance is only settled after your official admission notice and JW202 government visa document are granted.'}
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-200">
                <span className="text-[#575260]">Amount Due:</span>
                <span className="font-extrabold text-base text-[#6D1838]">
                  {payingStage === 'admissionPayment'
                    ? `$${pricing.admissionPaymentUSD}.00 USD`
                    : `$${pricing.finalPaymentUSD.toLocaleString()}.00 USD`}
                </span>
              </div>
              {CLOUD ? (
                <p className="text-xs text-[#575260] leading-relaxed">
                  Payments are arranged directly with your advisor (bank transfer, Alipay / WeChat Pay or mobile money). Tap the button below to request payment instructions on WhatsApp. Your dashboard is updated as soon as your payment is confirmed.
                </p>
              ) : (
                <div className="space-y-1 text-xs text-[#575260]">
                  <p><strong>Card:</strong> 4242 •••• •••• 4242 (Stripe Verified)</p>
                  <p><strong>Beneficiary:</strong> Study In China International Education Ltd.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPayingStage(null);
                  setIsPayingFinalBalance(false);
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessStagePayment}
                disabled={paymentProcessing}
                className="px-6 py-2.5 bg-[#6D1838] text-white rounded-xl text-xs font-bold hover:bg-[#58122c] shadow-md flex items-center gap-1.5"
              >
                {paymentProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {CLOUD ? 'Get payment instructions for' : 'Confirm & Pay'}{' '}
                      {payingStage === 'admissionPayment'
                        ? `$${pricing.admissionPaymentUSD} USD`
                        : `$${pricing.finalPaymentUSD.toLocaleString()} USD`}
                    </span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
