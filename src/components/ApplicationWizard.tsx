import React, { useState, useEffect } from 'react';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  CreditCard,
  Building,
  HelpCircle,
  Eye,
  Trash2,
  Calendar,
  User,
  GraduationCap,
  Compass,
  FileCheck,
  Save,
  Clock,
  ExternalLink
} from 'lucide-react';
import { DegreeLevel, StudentApplication, DocumentItem, ProgramPreference } from '../types';
import { siteConfig } from '../data/siteConfig';
import { createNewApplication } from '../data/applicationStorage';
import { applicationService } from '../services/applicationService';
import { DEMO_MODE } from '../lib/supabase';
import { paymentService, OFFICIAL_PRICING } from '../services/paymentService';
import { notificationService } from '../services/notificationService';
import { getIntakeOptions, getDefaultIntake } from '../utils/intakeUtils';

interface ApplicationWizardProps {
  onBackToHome: () => void;
  onGoToDashboard: (appId?: string) => void;
  prefillUniversity?: string;
  prefillProgram?: string;
  prefillDegree?: DegreeLevel;
}

const DRAFT_STORAGE_KEY = 'chinastudy_wizard_draft_v1';

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  onBackToHome,
  onGoToDashboard,
  prefillUniversity = '',
  prefillProgram = '',
  prefillDegree,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [generatedAppId, setGeneratedAppId] = useState<string>('');

  // Step 1: Personal Info
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    country: '',
    dateOfBirth: '2004-06-15',
    gender: 'Male',
    nationality: '',
    currentCity: '',
    currentCountry: '',
    address: '',
  });

  // Step 2: Education
  const [education, setEducation] = useState({
    highestEducation: 'High School Diploma / Secondary School',
    schoolName: '',
    fieldOfStudy: '',
    graduationYear: '2023',
    gpaOrGrade: '',
    englishProficiency: 'Native / English-medium School',
    englishScore: '',
    chineseProficiency: 'None (Complete Beginner)',
    chineseScore: '',
  });

  // Step 3: 3-Choice Program Preferences (Dynamic Intakes)
  const defaultIntakeOption = getDefaultIntake();
  const availableIntakeOptions = getIntakeOptions();

  const [firstChoice, setFirstChoice] = useState<ProgramPreference>({
    priority: 1,
    fieldOfStudy: 'Computer Science & AI',
    program: prefillProgram || 'Computer Science and Technology',
    degreeLevel: (prefillDegree || 'Bachelor') as DegreeLevel,
    studyLanguage: 'English',
    intake: defaultIntakeOption,
  });

  const [secondChoice, setSecondChoice] = useState<ProgramPreference>({
    priority: 2,
    fieldOfStudy: 'Software Engineering & IT',
    program: 'Software Engineering & Information Systems',
    degreeLevel: (prefillDegree || 'Bachelor') as DegreeLevel,
    studyLanguage: 'English',
    intake: defaultIntakeOption,
  });

  const [thirdChoice, setThirdChoice] = useState<ProgramPreference>({
    priority: 3,
    fieldOfStudy: 'Engineering & Technology',
    program: 'Artificial Intelligence & Robotics Engineering',
    degreeLevel: (prefillDegree || 'Bachelor') as DegreeLevel,
    studyLanguage: 'English',
    intake: defaultIntakeOption,
  });

  const [preferences, setPreferences] = useState({
    targetDegree: (prefillDegree || 'Bachelor') as DegreeLevel,
    preferredField: 'Computer Science & AI',
    preferredCity: 'Any / Best Opportunity',
    specificProgram: prefillProgram || 'Computer Science and Technology',
    intakeSeason: defaultIntakeOption,
    fundingPreference: 'Full Chinese Government Scholarship (CSC) Preferred',
    additionalNotes: '',
  });

  // Step 4: Documents Upload State
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: string; url?: string }>>({
    passport: { name: 'Passport_Scan_Official.pdf', size: '1.8 MB' },
    transcript: { name: 'HighSchool_Official_Transcripts.pdf', size: '2.4 MB' },
    certificate: { name: 'Graduation_Diploma_Certified.pdf', size: '1.2 MB' },
    photo: { name: 'Applicant_Photo_WhiteBG.jpg', size: '540 KB' },
  });

  // Step 5: Review Checkbox
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  // Step 6: Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire' | 'alipay'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('');

  // Load draft on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.personal) setPersonal(d.personal);
        if (d.education) setEducation(d.education);
        if (d.firstChoice) setFirstChoice(d.firstChoice);
        if (d.secondChoice) setSecondChoice(d.secondChoice);
        if (d.thirdChoice) setThirdChoice(d.thirdChoice);
        if (d.preferences) {
          setPreferences({
            ...d.preferences,
            specificProgram: prefillProgram || d.preferences.specificProgram,
            targetDegree: prefillDegree || d.preferences.targetDegree,
          });
        }
        if (d.uploadedDocs) setUploadedDocs(d.uploadedDocs);
        if (d.currentStep && d.currentStep < 7) setCurrentStep(d.currentStep);
      } else {
        if (prefillProgram) {
          setFirstChoice(c => ({ ...c, program: prefillProgram }));
          setPreferences(p => ({ ...p, specificProgram: prefillProgram }));
        }
        if (prefillDegree) {
          setFirstChoice(c => ({ ...c, degreeLevel: prefillDegree }));
          setSecondChoice(c => ({ ...c, degreeLevel: prefillDegree }));
          setThirdChoice(c => ({ ...c, degreeLevel: prefillDegree }));
          setPreferences(p => ({ ...p, targetDegree: prefillDegree }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [prefillProgram, prefillDegree]);

  const handleSaveAndContinueLater = () => {
    try {
      const draft = {
        personal,
        education,
        firstChoice,
        secondChoice,
        thirdChoice,
        preferences,
        uploadedDocs,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setSaveToast('Progress saved! You can close this window and resume anytime.');
      setTimeout(() => setSaveToast(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Validation
  const validateCurrentStep = (stepNumber: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!personal.firstName.trim()) errs.firstName = 'First name is required';
      if (!personal.lastName.trim()) errs.lastName = 'Last name is required';
      if (!personal.email.trim() || !personal.email.includes('@')) errs.email = 'Valid email is required';
      if (!personal.whatsapp.trim()) errs.whatsapp = 'WhatsApp number with country code is required (e.g. +233...)';
      if (!personal.country.trim()) errs.country = 'Country of residence is required';
      if (!personal.nationality.trim()) errs.nationality = 'Passport nationality is required';
      if (!personal.currentCity.trim()) errs.currentCity = 'Current city is required';
      if (!personal.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    }

    if (stepNumber === 2) {
      if (!education.schoolName.trim()) errs.schoolName = 'Name of current or previous institution is required';
      if (!education.gpaOrGrade.trim()) errs.gpaOrGrade = 'Cumulative GPA or Grade average is required';
    }

    if (stepNumber === 3) {
      if (!firstChoice.fieldOfStudy.trim()) errs.firstChoiceField = 'Please select a field of study for your 1st choice';
      if (!firstChoice.program.trim()) errs.firstChoiceProgram = 'Please enter your desired program for your 1st choice';
      if (!secondChoice.fieldOfStudy.trim()) errs.secondChoiceField = 'Please select a field of study for your 2nd choice';
      if (!secondChoice.program.trim()) errs.secondChoiceProgram = 'Please enter your alternative program for your 2nd choice';
      if (!thirdChoice.fieldOfStudy.trim()) errs.thirdChoiceField = 'Please select a field of study for your 3rd choice';
      if (!thirdChoice.program.trim()) errs.thirdChoiceProgram = 'Please enter your backup program for your 3rd choice';
    }

    if (stepNumber === 4) {
      if (!uploadedDocs.passport) errs.passport = 'Passport scan is mandatory';
      if (!uploadedDocs.transcript) errs.transcript = 'Academic transcripts are mandatory';
      if (!uploadedDocs.certificate) errs.certificate = 'Graduation diploma or certificate is mandatory';
      if (!uploadedDocs.photo) errs.photo = 'Passport-size digital photo is mandatory';
    }

    if (stepNumber === 5) {
      if (!agreedToTerms) errs.terms = 'You must confirm the truthfulness of your submission to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(prev => Math.min(7, prev + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSimulateUpload = (key: string, customName?: string) => {
    const fileNames: Record<string, string> = {
      passport: 'International_Passport_Scan.pdf',
      transcript: 'Certified_Official_Transcripts.pdf',
      certificate: 'Graduation_Diploma_Original.pdf',
      photo: 'Applicant_Passport_Photo_WhiteBG.jpg',
      english_test: 'English_Proficiency_IELTS_Report.pdf',
      cv: 'Applicant_Academic_Curriculum_Vitae.pdf',
      recommendation_1: 'Professor_Recommendation_Letter_1.pdf',
      recommendation_2: 'Academic_Dean_Recommendation_Letter_2.pdf',
      study_plan: 'Statement_of_Purpose_China_StudyPlan.pdf',
      police_record: 'Police_Clearance_NonCriminal_Record.pdf',
      physical_exam: 'Foreigner_Physical_Exam_Stamped.pdf',
    };

    const fileName = customName || fileNames[key] || `${key}_document.pdf`;
    setUploadedDocs(prev => ({
      ...prev,
      [key]: {
        name: fileName,
        size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      },
    }));
  };

  const handleRemoveDoc = (key: string) => {
    setUploadedDocs(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleFillDemoValues = () => {
    setPersonal({
      firstName: 'David',
      lastName: 'Osei',
      email: 'david.osei@example.com',
      whatsapp: '+233 50 123 4567',
      country: 'Ghana',
      dateOfBirth: '2003-08-22',
      gender: 'Male',
      nationality: 'Ghanaian',
      currentCity: 'Kumasi',
      currentCountry: 'Ghana',
      address: 'Plot 12, Ridge Road, Kumasi',
    });
    setEducation({
      highestEducation: 'High School Diploma / Secondary Certificate',
      schoolName: 'Prempeh College',
      fieldOfStudy: 'General Science & Information Technology',
      graduationYear: '2023',
      gpaOrGrade: '87% Average / Grade 1 Distinction',
      englishProficiency: 'Native / English Medium of Instruction',
      englishScore: 'MOI Certified',
      chineseProficiency: 'None (Complete Beginner)',
      chineseScore: '',
    });
    setFirstChoice({
      priority: 1,
      fieldOfStudy: 'Computer Science & AI',
      program: 'B.Sc. Computer Science and Technology',
      degreeLevel: 'Bachelor',
      studyLanguage: 'English',
      intake: defaultIntakeOption,
    });
    setSecondChoice({
      priority: 2,
      fieldOfStudy: 'Software Engineering & IT',
      program: 'B.Eng. Software Engineering & Cloud Systems',
      degreeLevel: 'Bachelor',
      studyLanguage: 'English',
      intake: defaultIntakeOption,
    });
    setThirdChoice({
      priority: 3,
      fieldOfStudy: 'Engineering & Technology',
      program: 'B.Eng. Artificial Intelligence & Robotics',
      degreeLevel: 'Bachelor',
      studyLanguage: 'English',
      intake: defaultIntakeOption,
    });
    setPreferences({
      targetDegree: 'Bachelor',
      preferredField: 'Computer Science & AI',
      preferredCity: 'Hangzhou',
      specificProgram: 'B.Sc. Computer Science and Technology',
      intakeSeason: defaultIntakeOption,
      fundingPreference: 'Provincial Government Scholarship Preferred',
      additionalNotes: 'Keen to pursue robotics and artificial intelligence studies in China.',
    });
    setUploadedDocs({
      passport: { name: 'David_Osei_Passport_Scan.pdf', size: '1.9 MB' },
      transcript: { name: 'Prempeh_Official_Transcripts_Certified.pdf', size: '2.5 MB' },
      certificate: { name: 'WASSCE_Certificate_Original.pdf', size: '1.4 MB' },
      photo: { name: 'David_Osei_ID_Photo.jpg', size: '610 KB' },
      study_plan: { name: 'Academic_Study_Plan_CS.pdf', size: '520 KB' },
      recommendation_1: { name: 'Principal_Recommendation_Letter.pdf', size: '890 KB' },
    });
    setSaveToast('Loaded pre-filled student test dossier!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleProcessPaymentAndSubmit = () => {
    setIsProcessingPayment(true);
    setErrors({});

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);

      const generatedId = applicationService.generateApplicationNumber();
      setGeneratedAppId(generatedId);

      // Build full application structure
      const newApp: StudentApplication = {
        id: generatedId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'document_review',
        personal: { ...personal },
        education: { ...education },
        preferences: {
          ...preferences,
          targetDegree: (firstChoice.degreeLevel as DegreeLevel) || preferences.targetDegree,
          preferredField: firstChoice.fieldOfStudy || preferences.preferredField,
          specificProgram: firstChoice.program || preferences.specificProgram,
          intakeSeason: firstChoice.intake || preferences.intakeSeason,
          firstChoice: { ...firstChoice },
          secondChoice: { ...secondChoice },
          thirdChoice: { ...thirdChoice },
          matchingStatus: 'preferences_submitted',
        },
        documents: Object.entries(uploadedDocs).map(([key, doc]) => ({
          id: `doc-${Date.now()}-${key}`,
          type: key as any,
          title: key.replace('_', ' ').toUpperCase(),
          description: 'Uploaded applicant document',
          required: ['passport', 'transcript', 'certificate', 'photo'].includes(key),
          name: doc.name,
          fileSize: doc.size,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'pending',
        })),
        payments: {
          deposit: {
            paid: true,
            amount: 515,
            amountXaf: 300000,
            status: 'paid',
            date: new Date().toISOString().split('T')[0],
            method: paymentMethod === 'card' ? 'Credit Card (Instant)' : paymentMethod === 'wire' ? 'International SWIFT Wire' : 'Alipay / WeChat Pay',
            transactionId: `TXN-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
            receiptNumber: `REC-SIC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          },
          admissionPayment: {
            paid: false,
            amount: 858,
            amountXaf: 500000,
            status: 'locked',
          },
          finalPayment: {
            paid: false,
            amount: 1716,
            amountXaf: 1000000,
            status: 'locked',
          },
        },
        timeline: [
          {
            id: 'tl-1',
            title: 'Application Dossier Created & Initial Deposit ($515) Received',
            description: 'Stage 1 deposit confirmed ($515 USD). Assigned to Senior Counselor Elena Zhao.',
            date: new Date().toISOString().split('T')[0],
            completed: true,
          },
          {
            id: 'tl-2',
            title: 'Credentials & Transcripts Audit in Progress',
            description: 'Admissions team is reviewing your uploaded documents against academic standards.',
            date: 'In Progress',
            completed: false,
            current: true,
          },
          {
            id: 'tl-3',
            title: `Official Application Lodging: ${preferences.preferredField}`,
            description: 'Formal submission to accredited higher education admissions directorate.',
            date: 'Upcoming',
            completed: false,
          },
          {
            id: 'tl-4',
            title: 'Official Admission Notice Issuance',
            description: 'Securing formal offer letter from faculty. Unlocks Stage 2 payment ($858 USD).',
            date: 'Upcoming',
            completed: false,
          },
          {
            id: 'tl-5',
            title: 'Stage 2: Admission Payment ($858 USD)',
            description: 'Due after official academic admission is confirmed.',
            date: 'Pending Admission',
            completed: false,
          },
          {
            id: 'tl-6',
            title: 'JW202 / JW201 Electronic Visa Form',
            description: 'Government visa authorization code from Beijing Ministry of Education.',
            date: 'Upcoming',
            completed: false,
          },
          {
            id: 'tl-7',
            title: 'Stage 3: Final Payment ($1,716 USD)',
            description: 'Due after JW202/JW201 visa authorization is received.',
            date: 'Pending JW202',
            completed: false,
          },
          {
            id: 'tl-8',
            title: 'Student Visa (X1/X2) Filing & Campus Arrival',
            description: 'Consular visa appointment, pre-departure briefing, and campus arrival support.',
            date: 'Upcoming',
            completed: false,
          },
        ],
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'advisor',
            senderName: 'Elena Zhao (Senior Admissions Director)',
            content: `Welcome to Study In China, ${personal.firstName}! Your $515 initial deposit has been received and your application reference is ${generatedId}. We are auditing your documents for ${preferences.preferredField}.`,
            timestamp: new Date().toISOString(),
          },
        ],
        advisor: {
          name: 'Elena Zhao',
          title: 'Senior Director of International Admissions',
          email: 'elena.zhao@studyinchina.com',
          whatsapp: '+86 186 2100 8954',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        },
      };

      // Persist to store
      createNewApplication(newApp);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setCurrentStep(7);
    }, 1500);
  };

  const stepsList = [
    { num: 1, label: 'Personal Information', short: 'Personal' },
    { num: 2, label: 'Education History', short: 'Education' },
    { num: 3, label: 'Study Preferences', short: 'Preferences' },
    { num: 4, label: 'Document Uploads', short: 'Documents' },
    { num: 5, label: 'Review Application', short: 'Review' },
    { num: 6, label: 'Payment / Initial Deposit ($515)', short: 'Deposit' },
    { num: 7, label: 'Confirmation', short: 'Confirmed' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-[#18151B]">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBackToHome}
              aria-label="Back to website"
              className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 -ml-1 shrink-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="Return to website homepage"
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
                <span className="sm:hidden">Application</span>
                <span className="hidden sm:inline">{siteConfig.brandName} Application</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {currentStep < 7 && (
              <>
                {DEMO_MODE && (
                  <button
                    type="button"
                    onClick={handleFillDemoValues}
                    aria-label="Auto-fill demo data"
                    className="h-9 px-2.5 bg-[#FAF2F5] hover:bg-[#F3EEFA] text-[#6D1838] border border-[#EAD5DE] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Fill form with sample applicant data for testing"
                  >
                    <Sparkles className="w-4 h-4 text-[#6D1838]" />
                    <span className="hidden md:inline">Auto-fill Demo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveAndContinueLater}
                  aria-label="Save and continue later"
                  className="h-9 px-2.5 sm:px-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save & Continue Later</span>
                </button>
              </>
            )}
            <button
              onClick={() => onGoToDashboard()}
              className="h-9 px-3 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">Student Portal</span>
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 pt-1">
          <div className="flex items-center justify-between text-xs font-medium text-[#575260] mb-2">
            <span className="font-bold text-[#6D1838] truncate pr-2">
              Step {currentStep} of 7: {stepsList[currentStep - 1].label}
            </span>
            <span className="text-neutral-500 font-medium whitespace-nowrap">
              {Math.round((currentStep / 7) * 100)}%<span className="hidden sm:inline"> Complete</span>
            </span>
          </div>

          {/* Stepper Dots & Line */}
          <div className="relative">
            <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-neutral-200">
              <div
                style={{ width: `${(currentStep / 7) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#6D1838] transition-all duration-300"
              />
            </div>

            {/* Step markers */}
            <div className="flex justify-between mt-2 overflow-x-auto no-scrollbar">
              {stepsList.map(s => {
                const isPassed = s.num < currentStep;
                const isCurrent = s.num === currentStep;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num);
                    }}
                    disabled={s.num > currentStep}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-colors px-1 whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#6D1838]'
                        : isPassed
                        ? 'text-emerald-700 hover:text-emerald-800 cursor-pointer'
                        : 'text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#6D1838] text-white font-bold'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-2.5 h-2.5" /> : s.num}
                    </span>
                    <span className="hidden md:inline">{s.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveToast && (
        <aside aria-label="Notification" className="fixed top-20 right-4 z-50 bg-[#18151B] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </aside>
      )}

      {/* Main Wizard Form Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                  Applicant Identity & Legal Profile
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#18151B] mt-1">
                  Personal Information
                </h2>
                <p className="text-xs sm:text-sm text-[#575260] mt-1">
                  Ensure all details match your valid international passport exactly as they appear on the information page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    First / Given Name (as in passport) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David Alexander"
                    value={personal.firstName}
                    onChange={e => setPersonal({ ...personal, firstName: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.firstName ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Last / Family Name (as in passport) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Osei"
                    value={personal.lastName}
                    onChange={e => setPersonal({ ...personal, lastName: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.lastName ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={personal.email}
                    onChange={e => setPersonal({ ...personal, email: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Your official admission offer and embassy notifications will be sent here.
                  </p>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    WhatsApp Number (with Country Code) *
                  </label>
                  <input
                    type="text"
                    placeholder="+233 50 123 4567"
                    value={personal.whatsapp}
                    onChange={e => setPersonal({ ...personal, whatsapp: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.whatsapp ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.whatsapp && <p className="text-xs text-rose-500 mt-1">{errors.whatsapp}</p>}
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Your senior advisor communicates real-time updates via WhatsApp.
                  </p>
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Passport Nationality / Citizenship *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ghanaian, Brazilian, German, Nigerian"
                    value={personal.nationality}
                    onChange={e => setPersonal({ ...personal, nationality: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.nationality ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.nationality && <p className="text-xs text-rose-500 mt-1">{errors.nationality}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={personal.dateOfBirth}
                    onChange={e => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.dateOfBirth ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-rose-500 mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPersonal({ ...personal, gender: g })}
                        className={`py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                          personal.gender === g
                            ? 'bg-[#6D1838] text-white border-[#6D1838] shadow-sm'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country of Residence */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Current Country of Residence *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ghana, UAE, UK, South Africa"
                    value={personal.country}
                    onChange={e => setPersonal({ ...personal, country: e.target.value, currentCountry: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.country ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.country && <p className="text-xs text-rose-500 mt-1">{errors.country}</p>}
                </div>

                {/* Current City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Current City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Accra, São Paulo, Munich"
                    value={personal.currentCity}
                    onChange={e => setPersonal({ ...personal, currentCity: e.target.value })}
                    className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                      errors.currentCity ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.currentCity && <p className="text-xs text-rose-500 mt-1">{errors.currentCity}</p>}
                </div>

                {/* Address (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Mailing Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Building, Apt number"
                    value={personal.address}
                    onChange={e => setPersonal({ ...personal, address: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: EDUCATION BACKGROUND ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                  Academic Record & Language
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#18151B] mt-1">
                  Education Background
                </h2>
                <p className="text-xs sm:text-sm text-[#575260] mt-1">
                  Tell us about your highest educational attainment and academic performance to evaluate admission eligibility.
                </p>
              </div>

              <div className="space-y-4">
                {/* Highest Education */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Highest Education Completed or Currently Pursuing *
                  </label>
                  <select
                    value={education.highestEducation}
                    onChange={e => setEducation({ ...education, highestEducation: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  >
                    <option value="High School Diploma / Secondary School">High School Diploma / Upper Secondary (A-Levels, IB, WASSCE, Abitur)</option>
                    <option value="Associate Degree / Diploma">2-Year Associate Degree / Polytechnic Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree / Undergraduate (Completed or Final Year)</option>
                    <option value="Master's Degree">Master's Degree / Postgraduate</option>
                    <option value="Other">Other Certificate / Foundation Program</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Institution Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      School / Institution Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prempeh College or St. Andrews Secondary"
                      value={education.schoolName}
                      onChange={e => setEducation({ ...education, schoolName: e.target.value })}
                      className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                        errors.schoolName ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                      }`}
                    />
                    {errors.schoolName && <p className="text-xs text-rose-500 mt-1">{errors.schoolName}</p>}
                  </div>

                  {/* Field of Study */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      Field of Study / Secondary Track
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. General Science, Commerce, Computer Science"
                      value={education.fieldOfStudy}
                      onChange={e => setEducation({ ...education, fieldOfStudy: e.target.value })}
                      className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      Year of Graduation / Expected Completion
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2023 or 2025"
                      value={education.graduationYear}
                      onChange={e => setEducation({ ...education, graduationYear: e.target.value })}
                      className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                    />
                  </div>

                  {/* GPA or Grade Average */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      Cumulative GPA or Percentage Average *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3.6 / 4.0 GPA or 85% or 8 As"
                      value={education.gpaOrGrade}
                      onChange={e => setEducation({ ...education, gpaOrGrade: e.target.value })}
                      className={`w-full p-3 text-sm rounded-xl border bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 transition-all ${
                        errors.gpaOrGrade ? 'border-rose-500 bg-rose-50/30' : 'border-neutral-200 focus:border-[#6D1838]'
                      }`}
                    />
                    {errors.gpaOrGrade && <p className="text-xs text-rose-500 mt-1">{errors.gpaOrGrade}</p>}
                  </div>
                </div>

                {/* Language Proficiency */}
                <div className="pt-2 border-t border-neutral-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18151B] mb-3">
                    Language Readiness
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        English Proficiency
                      </label>
                      <select
                        value={education.englishProficiency}
                        onChange={e => setEducation({ ...education, englishProficiency: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                      >
                        <option value="Native / English-medium School">Native Speaker / Prior Medium of Instruction was English</option>
                        <option value="IELTS Academic">IELTS Academic</option>
                        <option value="TOEFL iBT">TOEFL iBT</option>
                        <option value="Duolingo English Test">Duolingo English Test</option>
                        <option value="Medium of Instruction (MOI) Certificate">Medium of Instruction (MOI) Certificate from School</option>
                        <option value="None / Basic">Basic / Non-native without standardized test</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Chinese (Mandarin) Proficiency
                      </label>
                      <select
                        value={education.chineseProficiency}
                        onChange={e => setEducation({ ...education, chineseProficiency: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                      >
                        <option value="None (Complete Beginner)">None (Complete Beginner - English-taught programs only)</option>
                        <option value="HSK 1 - Basic greetings">HSK 1 - Basic greetings & everyday vocabulary</option>
                        <option value="HSK 2 - Elementary">HSK 2 - Elementary conversation</option>
                        <option value="HSK 3 - Intermediate">HSK 3 - Intermediate conversational</option>
                        <option value="HSK 4 - Certified (Degree Entry)">HSK 4 - Certified (Minimum for Chinese-taught Bachelor)</option>
                        <option value="HSK 5 / HSK 6 - Advanced">HSK 5 / HSK 6 - Fluent / Professional</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-[#FAF7F9] border border-neutral-200 rounded-xl text-xs text-[#575260] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
                    <span>
                      <strong>Good news:</strong> Numerous Bachelor and Master degree tracks in China are taught entirely in English. No prior Chinese is required for English-medium tracks!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: YOUR PROGRAM PREFERENCES ================= */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Header */}
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                  Three-Tier Study Opportunity System
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#18151B] mt-1">
                  Your Program Preferences
                </h2>
                <p className="text-xs sm:text-sm text-[#575260] mt-1 max-w-3xl leading-relaxed">
                  Tell us what you would like to study. You can select up to three program preferences. We will evaluate your choices against available opportunities and identify the most suitable option for your profile and scholarship objectives.
                </p>
              </div>

              {/* Priority Flow Indicator */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#575260] mb-2">
                  Evaluation Priority Hierarchy
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border-2 border-[#6D1838] shadow-xs">
                    <span className="font-mono text-xs font-black text-[#6D1838]">01 — First Choice</span>
                    <strong className="block text-xs text-[#18151B] font-bold mt-0.5">Highest Priority</strong>
                    <span className="text-[11px] text-[#575260]">Evaluated first for target quotas & scholarships</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-300">
                    <span className="font-mono text-xs font-black text-[#6C3B9E]">02 — Second Choice</span>
                    <strong className="block text-xs text-[#18151B] font-bold mt-0.5">Alternative Option</strong>
                    <span className="text-[11px] text-[#575260]">Evaluated if primary option is unavailable or unsuitable</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200">
                    <span className="font-mono text-xs font-black text-neutral-600">03 — Third Choice</span>
                    <strong className="block text-xs text-[#18151B] font-bold mt-0.5">Backup Option</strong>
                    <span className="text-[11px] text-[#575260]">Contingency safeguard to ensure enrollment</span>
                  </div>
                </div>
              </div>

              {/* 3 Preference Cards */}
              <div className="space-y-6">
                {/* 1st Choice Card */}
                <div className="bg-white rounded-2xl border-2 border-[#6D1838]/60 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#6D1838] text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                        1st Choice
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#18151B]">Primary Preference</h3>
                    </div>
                    <span className="text-xs text-[#575260] italic">
                      Your preferred study option.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field of Study */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Field of Study *
                      </label>
                      <select
                        value={firstChoice.fieldOfStudy}
                        onChange={e => setFirstChoice({ ...firstChoice, fieldOfStudy: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                      >
                        <option value="Computer Science & AI">Computer Science, Software Engineering & AI</option>
                        <option value="Software Engineering & IT">Software Engineering, Cloud & Big Data</option>
                        <option value="International Business, Finance & Economics">International Business, Finance & Economics (IBBA)</option>
                        <option value="Clinical Medicine (MBBS) & Dentistry">Clinical Medicine (MBBS) & Dentistry</option>
                        <option value="Mechanical & Automotive Engineering">Mechanical, Mechatronics & Automotive Engineering</option>
                        <option value="Civil & Environmental Engineering">Civil & Environmental Engineering</option>
                        <option value="Electrical Engineering & Telecommunications">Electrical Engineering & Telecommunications</option>
                        <option value="Chinese Language & Cultural Studies">Chinese Language & Cultural Studies (Language Immersion)</option>
                        <option value="Architecture & Urban Planning">Architecture & Urban Planning</option>
                        <option value="International Relations & Diplomacy">International Relations, Public Policy & Diplomacy</option>
                        <option value="Biotechnology & Pharmaceutical Sciences">Biotechnology & Pharmaceutical Sciences</option>
                        <option value="Digital Media, Arts & Communication">Digital Media, Arts & Communication</option>
                        <option value="Other / Customized Field">Other / Interdisciplinary Study</option>
                      </select>
                      {errors.firstChoiceField && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">{errors.firstChoiceField}</p>
                      )}
                    </div>

                    {/* Desired Program */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Desired Program *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.Sc. Computer Science and Technology"
                        value={firstChoice.program}
                        onChange={e => setFirstChoice({ ...firstChoice, program: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                      />
                      {errors.firstChoiceProgram && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">{errors.firstChoiceProgram}</p>
                      )}
                    </div>

                    {/* Degree Level */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Degree Level *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Bachelor', 'Master', 'PhD', 'Non-Degree Language'] as DegreeLevel[]).map(deg => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => setFirstChoice({ ...firstChoice, degreeLevel: deg })}
                            className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                              firstChoice.degreeLevel === deg
                                ? 'bg-[#6D1838] text-white border-[#6D1838] shadow-xs'
                                : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {deg === 'Non-Degree Language' ? 'Language' : deg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Study Language & Intake */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                          Study Language
                        </label>
                        <select
                          value={firstChoice.studyLanguage}
                          onChange={e => setFirstChoice({ ...firstChoice, studyLanguage: e.target.value })}
                          className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#6D1838]"
                        >
                          <option value="English">English</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Bilingual">Bilingual</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                          Preferred Intake
                        </label>
                        <select
                          value={firstChoice.intake}
                          onChange={e => setFirstChoice({ ...firstChoice, intake: e.target.value })}
                          className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#6D1838]"
                        >
                          {availableIntakeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.season} ({opt.shortLabel})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2nd Choice Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#6C3B9E] text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                        2nd Choice
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#18151B]">Alternative Option</h3>
                    </div>
                    <span className="text-xs text-[#575260] italic">
                      Your alternative option if your first choice is not available or suitable.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field of Study */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Field of Study
                      </label>
                      <select
                        value={secondChoice.fieldOfStudy}
                        onChange={e => setSecondChoice({ ...secondChoice, fieldOfStudy: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C3B9E]/20 focus:border-[#6C3B9E]"
                      >
                        <option value="Software Engineering & IT">Software Engineering, Cloud & Big Data</option>
                        <option value="Computer Science & AI">Computer Science, Software Engineering & AI</option>
                        <option value="International Business, Finance & Economics">International Business, Finance & Economics (IBBA)</option>
                        <option value="Clinical Medicine (MBBS) & Dentistry">Clinical Medicine (MBBS) & Dentistry</option>
                        <option value="Mechanical & Automotive Engineering">Mechanical, Mechatronics & Automotive Engineering</option>
                        <option value="Civil & Environmental Engineering">Civil & Environmental Engineering</option>
                        <option value="Electrical Engineering & Telecommunications">Electrical Engineering & Telecommunications</option>
                        <option value="Chinese Language & Cultural Studies">Chinese Language & Cultural Studies (Language Immersion)</option>
                        <option value="Architecture & Urban Planning">Architecture & Urban Planning</option>
                        <option value="International Relations & Diplomacy">International Relations, Public Policy & Diplomacy</option>
                        <option value="Biotechnology & Pharmaceutical Sciences">Biotechnology & Pharmaceutical Sciences</option>
                        <option value="Digital Media, Arts & Communication">Digital Media, Arts & Communication</option>
                        <option value="Other / Customized Field">Other / Interdisciplinary Study</option>
                      </select>
                    </div>

                    {/* Desired Program */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Desired Program
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.Eng. Software Engineering & Information Systems"
                        value={secondChoice.program}
                        onChange={e => setSecondChoice({ ...secondChoice, program: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C3B9E]/20 focus:border-[#6C3B9E]"
                      />
                    </div>

                    {/* Degree Level */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Degree Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Bachelor', 'Master', 'PhD', 'Non-Degree Language'] as DegreeLevel[]).map(deg => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => setSecondChoice({ ...secondChoice, degreeLevel: deg })}
                            className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                              secondChoice.degreeLevel === deg
                                ? 'bg-[#6C3B9E] text-white border-[#6C3B9E] shadow-xs'
                                : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {deg === 'Non-Degree Language' ? 'Language' : deg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Study Language & Intake */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                          Study Language
                        </label>
                        <select
                          value={secondChoice.studyLanguage}
                          onChange={e => setSecondChoice({ ...secondChoice, studyLanguage: e.target.value })}
                          className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#6C3B9E]"
                        >
                          <option value="English">English</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Bilingual">Bilingual</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                          Preferred Intake
                        </label>
                        <select
                          value={secondChoice.intake}
                          onChange={e => setSecondChoice({ ...secondChoice, intake: e.target.value })}
                          className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#6C3B9E]"
                        >
                          {availableIntakeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.season} ({opt.shortLabel})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3rd Choice Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-neutral-800 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                        3rd Choice
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#18151B]">Backup Option</h3>
                    </div>
                    <span className="text-xs text-[#575260] italic">
                      Your backup option if your first two choices cannot be secured.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field of Study */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Field of Study
                      </label>
                      <select
                        value={thirdChoice.fieldOfStudy}
                        onChange={e => setThirdChoice({ ...thirdChoice, fieldOfStudy: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400/20 focus:border-neutral-500"
                      >
                        <option value="Engineering & Technology">Engineering, Robotics & Advanced Materials</option>
                        <option value="Computer Science & AI">Computer Science, Software Engineering & AI</option>
                        <option value="Software Engineering & IT">Software Engineering, Cloud & Big Data</option>
                        <option value="International Business, Finance & Economics">International Business, Finance & Economics (IBBA)</option>
                        <option value="Clinical Medicine (MBBS) & Dentistry">Clinical Medicine (MBBS) & Dentistry</option>
                        <option value="Electrical Engineering & Telecommunications">Electrical Engineering & Telecommunications</option>
                        <option value="Chinese Language & Cultural Studies">Chinese Language & Cultural Studies (Language Immersion)</option>
                        <option value="Architecture & Urban Planning">Architecture & Urban Planning</option>
                        <option value="International Relations & Diplomacy">International Relations, Public Policy & Diplomacy</option>
                        <option value="Biotechnology & Pharmaceutical Sciences">Biotechnology & Pharmaceutical Sciences</option>
                        <option value="Digital Media, Arts & Communication">Digital Media, Arts & Communication</option>
                        <option value="Other / Customized Field">Other / Interdisciplinary Study</option>
                      </select>
                    </div>

                    {/* Desired Program */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Desired Program
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.Eng. Electrical Engineering or Chinese Language"
                        value={thirdChoice.program}
                        onChange={e => setThirdChoice({ ...thirdChoice, program: e.target.value })}
                        className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400/20 focus:border-neutral-500"
                      />
                    </div>

                    {/* Degree Level */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Degree Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Bachelor', 'Master', 'PhD', 'Non-Degree Language'] as DegreeLevel[]).map(deg => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => setThirdChoice({ ...thirdChoice, degreeLevel: deg })}
                            className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                              thirdChoice.degreeLevel === deg
                                ? 'bg-neutral-800 text-white border-neutral-800 shadow-xs'
                                : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {deg === 'Non-Degree Language' ? 'Language' : deg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Study Language & Intake */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                          Study Language
                        </label>
                        <select
                          value={thirdChoice.studyLanguage}
                          onChange={e => setThirdChoice({ ...thirdChoice, studyLanguage: e.target.value })}
                          className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-500"
                        >
                          <option value="English">English</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Bilingual">Bilingual</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                          Preferred Intake
                        </label>
                        <select
                          value={thirdChoice.intake}
                          onChange={e => setThirdChoice({ ...thirdChoice, intake: e.target.value })}
                          className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-500"
                        >
                          {availableIntakeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.season} ({opt.shortLabel})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Section: "How We Use Your Choices" */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF2F5] border border-[#EAD5DE] space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#6D1838]" />
                  <h3 className="font-bold text-sm sm:text-base text-[#18151B]">
                    How We Use Your Choices
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#575260] leading-relaxed">
                  Your three choices help us evaluate different opportunities for your profile. If your first choice is unavailable, unsuitable, or does not provide a favorable scholarship opportunity, we can evaluate your second choice. If necessary, we can then consider your third choice.
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#6D1838] leading-relaxed">
                  Our goal is to help you find the most suitable available study opportunity while maximizing your scholarship potential.
                </p>
                <div className="pt-2 border-t border-[#EAD5DE]/70 flex items-start gap-2 text-xs text-[#575260]">
                  <HelpCircle className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
                  <p>
                    Evaluations are grounded in genuine academic criteria: program availability, applicant eligibility, academic profile, admission requirements, intake quotas, and scholarship funding allocations. We do not make misleading guarantees of automated placement.
                  </p>
                </div>
              </div>

              {/* Funding & Additional Notes */}
              <div className="space-y-4 pt-2 border-t border-neutral-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Scholarship & Funding Goal
                  </label>
                  <select
                    value={preferences.fundingPreference}
                    onChange={e => setPreferences({ ...preferences, fundingPreference: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  >
                    <option value="Full Chinese Government Scholarship (CSC) Preferred">Full CSC Scholarship Preferred (Tuition + Free Dorm + Monthly Stipend)</option>
                    <option value="Provincial Government or Institutional Merit Scholarship">Provincial / Institutional Merit Scholarship (Tuition Waiver / Partial Grant)</option>
                    <option value="Self-Funded / Open to Scholarships">Self-Funded (Priority on program quality, scholarships evaluated as a plus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Special Requests or Questions for Your Admissions Committee
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about specific curriculum interests, city climates you prefer, or budget parameters..."
                    value={preferences.additionalNotes}
                    onChange={e => setPreferences({ ...preferences, additionalNotes: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: DOCUMENT UPLOADS ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                      Credential Audit & Verification
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#18151B] mt-1">
                      Upload Required Documents
                    </h2>
                    <p className="text-xs sm:text-sm text-[#575260] mt-1">
                      Upload clean scanned PDF or JPG copies. Max 10MB per document.
                    </p>
                  </div>
                  {DEMO_MODE && <button
                    type="button"
                    onClick={handleFillDemoValues}
                    className="self-start sm:self-center px-3 py-1.5 bg-[#FAF2F5] hover:bg-[#F3EEFA] text-[#6D1838] border border-[#EAD5DE] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Scans
                  </button>}
                </div>
              </div>

              {/* Validation errors summary if mandatory docs missing */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Missing Required Documents:</span>
                    <p>Please upload the 4 mandatory files (Passport, Transcripts, Certificate, Photo) to proceed.</p>
                  </div>
                </div>
              )}

              {/* Mandatory Checklist Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18151B]">
                    1. Mandatory Core Documents (Required for All Applicants)
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {['passport', 'transcript', 'certificate', 'photo'].filter(k => uploadedDocs[k]).length}/4 Uploaded
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Passport */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    uploadedDocs.passport ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#18151B]">International Passport</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Required</span>
                        </div>
                        <p className="text-[11px] text-[#575260] mt-0.5">Bio page with at least 18 months validity remaining.</p>
                      </div>
                      {uploadedDocs.passport ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Upload className="w-5 h-5 text-neutral-400 shrink-0" />
                      )}
                    </div>

                    {uploadedDocs.passport ? (
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate max-w-[200px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{uploadedDocs.passport.name}</span>
                          <span className="text-neutral-400 text-[10px]">({uploadedDocs.passport.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc('passport')}
                          className="text-neutral-400 hover:text-rose-600 p-1"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2 border-t border-neutral-200/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('passport')}
                          className="w-full py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> Select Passport Scan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Transcripts */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    uploadedDocs.transcript ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#18151B]">Academic Transcripts</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Required</span>
                        </div>
                        <p className="text-[11px] text-[#575260] mt-0.5">Official secondary or collegiate semester mark sheets.</p>
                      </div>
                      {uploadedDocs.transcript ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Upload className="w-5 h-5 text-neutral-400 shrink-0" />
                      )}
                    </div>

                    {uploadedDocs.transcript ? (
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate max-w-[200px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{uploadedDocs.transcript.name}</span>
                          <span className="text-neutral-400 text-[10px]">({uploadedDocs.transcript.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc('transcript')}
                          className="text-neutral-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2 border-t border-neutral-200/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('transcript')}
                          className="w-full py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> Select Transcripts
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Graduation Certificate */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    uploadedDocs.certificate ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#18151B]">Graduation Diploma / Certificate</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Required</span>
                        </div>
                        <p className="text-[11px] text-[#575260] mt-0.5">Or pre-graduation letter if you graduate this summer.</p>
                      </div>
                      {uploadedDocs.certificate ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Upload className="w-5 h-5 text-neutral-400 shrink-0" />
                      )}
                    </div>

                    {uploadedDocs.certificate ? (
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate max-w-[200px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{uploadedDocs.certificate.name}</span>
                          <span className="text-neutral-400 text-[10px]">({uploadedDocs.certificate.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc('certificate')}
                          className="text-neutral-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2 border-t border-neutral-200/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('certificate')}
                          className="w-full py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> Select Diploma / Certificate
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ID Photo */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    uploadedDocs.photo ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#18151B]">Passport-Size Digital ID Photo</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Required</span>
                        </div>
                        <p className="text-[11px] text-[#575260] mt-0.5">White background, formal attire, recent color photo.</p>
                      </div>
                      {uploadedDocs.photo ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Upload className="w-5 h-5 text-neutral-400 shrink-0" />
                      )}
                    </div>

                    {uploadedDocs.photo ? (
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate max-w-[200px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{uploadedDocs.photo.name}</span>
                          <span className="text-neutral-400 text-[10px]">({uploadedDocs.photo.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc('photo')}
                          className="text-neutral-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2 border-t border-neutral-200/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('photo')}
                          className="w-full py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> Select Photo File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional / Recommended Supplementary Documents */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18151B]">
                    2. Recommended Supplementary Documents (Boosts Admission & Scholarship)
                  </h3>
                  <span className="text-[11px] text-neutral-400">Can also be uploaded later in Dashboard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'study_plan', label: 'Study Plan / Statement of Purpose', desc: '500+ words' },
                    { key: 'recommendation_1', label: 'Recommendation Letter 1', desc: 'From teacher or dean' },
                    { key: 'english_test', label: 'English Test (IELTS/TOEFL/MOI)', desc: 'Optional if native' },
                  ].map(doc => {
                    const isUploaded = Boolean(uploadedDocs[doc.key]);
                    return (
                      <div key={doc.key} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
                        <p className="font-bold text-[#18151B]">{doc.label}</p>
                        <p className="text-[11px] text-[#575260] mb-2">{doc.desc}</p>
                        {isUploaded ? (
                          <div className="flex items-center justify-between text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded">
                            <span className="truncate text-[11px]">{uploadedDocs[doc.key].name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.key)}
                              className="text-neutral-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSimulateUpload(doc.key)}
                            className="w-full py-1.5 bg-white border border-neutral-300 rounded text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1 text-[11px] font-medium"
                          >
                            <Upload className="w-3 h-3" /> Upload File
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: REVIEW APPLICATION ================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                  Quality Audit & Final Check
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#18151B] mt-1">
                  Review Your Application
                </h2>
                <p className="text-xs sm:text-sm text-[#575260] mt-1">
                  Double check your dossier details. You can click 'Edit' on any section to make quick adjustments.
                </p>
              </div>

              {/* Card 1: Personal Info */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6D1838]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#18151B] uppercase tracking-wider">
                      Personal Information
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-[#6D1838] hover:underline"
                  >
                    Edit Step 1
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[#575260] block text-[11px]">Full Name:</span>
                    <strong className="text-[#18151B]">{personal.firstName} {personal.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Email:</span>
                    <strong className="text-[#18151B]">{personal.email}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">WhatsApp:</span>
                    <strong className="text-[#18151B]">{personal.whatsapp}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Nationality:</span>
                    <strong className="text-[#18151B]">{personal.nationality}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Date of Birth:</span>
                    <strong className="text-[#18151B]">{personal.dateOfBirth} ({personal.gender})</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Location:</span>
                    <strong className="text-[#18151B]">{personal.currentCity}, {personal.currentCountry}</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Education */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#6D1838]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#18151B] uppercase tracking-wider">
                      Academic Background
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-[#6D1838] hover:underline"
                  >
                    Edit Step 2
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[#575260] block text-[11px]">Education Level:</span>
                    <strong className="text-[#18151B]">{education.highestEducation}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Institution:</span>
                    <strong className="text-[#18151B]">{education.schoolName || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">GPA / Grade Average:</span>
                    <strong className="text-[#18151B]">{education.gpaOrGrade}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">English Level:</span>
                    <strong className="text-[#18151B]">{education.englishProficiency}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Chinese Level:</span>
                    <strong className="text-[#18151B]">{education.chineseProficiency}</strong>
                  </div>
                  <div>
                    <span className="text-[#575260] block text-[11px]">Graduation Year:</span>
                    <strong className="text-[#18151B]">{education.graduationYear}</strong>
                  </div>
                </div>
              </div>

              {/* Card 3: Your Program Preferences (3 Choices) */}
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#6D1838]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#18151B] uppercase tracking-wider">
                      Your Program Preferences
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#575260] font-medium">3-Choice Preference Hierarchy</span>
                </div>

                <div className="space-y-3">
                  {/* 1st Choice Review */}
                  <div className="p-3.5 bg-white rounded-xl border-2 border-[#6D1838]/60 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#6D1838] text-white text-[10px] font-bold rounded uppercase">
                          1st Choice
                        </span>
                        <strong className="text-xs text-[#18151B]">Primary Preference</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-bold text-[#6D1838] hover:underline"
                      >
                        Edit 1st Choice
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div>
                        <span className="text-[#575260] block text-[10px]">Field:</span>
                        <strong className="text-[#18151B] font-semibold">{firstChoice.fieldOfStudy}</strong>
                      </div>
                      <div className="sm:col-span-1">
                        <span className="text-[#575260] block text-[10px]">Program:</span>
                        <strong className="text-[#6D1838] font-bold">{firstChoice.program}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Degree:</span>
                        <strong className="text-[#18151B]">{firstChoice.degreeLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Language:</span>
                        <strong className="text-[#18151B]">{firstChoice.studyLanguage}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Intake:</span>
                        <strong className="text-[#18151B]">{firstChoice.intake}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2nd Choice Review */}
                  <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#6C3B9E] text-white text-[10px] font-bold rounded uppercase">
                          2nd Choice
                        </span>
                        <strong className="text-xs text-[#18151B]">Alternative Option</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-bold text-[#6C3B9E] hover:underline"
                      >
                        Edit 2nd Choice
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div>
                        <span className="text-[#575260] block text-[10px]">Field:</span>
                        <strong className="text-[#18151B] font-semibold">{secondChoice.fieldOfStudy}</strong>
                      </div>
                      <div className="sm:col-span-1">
                        <span className="text-[#575260] block text-[10px]">Program:</span>
                        <strong className="text-[#18151B] font-semibold">{secondChoice.program}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Degree:</span>
                        <strong className="text-[#18151B]">{secondChoice.degreeLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Language:</span>
                        <strong className="text-[#18151B]">{secondChoice.studyLanguage}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Intake:</span>
                        <strong className="text-[#18151B]">{secondChoice.intake}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 3rd Choice Review */}
                  <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-800 text-white text-[10px] font-bold rounded uppercase">
                          3rd Choice
                        </span>
                        <strong className="text-xs text-[#18151B]">Backup Option</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-bold text-neutral-700 hover:underline"
                      >
                        Edit 3rd Choice
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div>
                        <span className="text-[#575260] block text-[10px]">Field:</span>
                        <strong className="text-[#18151B] font-semibold">{thirdChoice.fieldOfStudy}</strong>
                      </div>
                      <div className="sm:col-span-1">
                        <span className="text-[#575260] block text-[10px]">Program:</span>
                        <strong className="text-[#18151B] font-semibold">{thirdChoice.program}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Degree:</span>
                        <strong className="text-[#18151B]">{thirdChoice.degreeLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Language:</span>
                        <strong className="text-[#18151B]">{thirdChoice.studyLanguage}</strong>
                      </div>
                      <div>
                        <span className="text-[#575260] block text-[10px]">Intake:</span>
                        <strong className="text-[#18151B]">{thirdChoice.intake}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Documents Uploaded */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#18151B] uppercase tracking-wider">
                      Attached Documents ({Object.keys(uploadedDocs).length} files)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-bold text-[#6D1838] hover:underline"
                  >
                    Edit Step 4
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(uploadedDocs).map(([k, d]) => (
                    <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {k.replace('_', ' ').toUpperCase()}: {d.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 bg-[#FAF7F9] cursor-pointer hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#6D1838] rounded"
                  />
                  <div className="text-xs text-[#575260]">
                    <span className="font-bold text-[#18151B]">
                      Applicant Declaration & Consent *
                    </span>
                    <p className="mt-0.5">
                      I certify that all academic records, transcripts, and personal information submitted in this application are authentic. I authorize {siteConfig.brandName} to act as my designated admissions representative for degree program admissions and visa documentation in the People's Republic of China.
                    </p>
                  </div>
                </label>
                {errors.terms && <p className="text-xs text-rose-500 mt-1">{errors.terms}</p>}
              </div>
            </div>
          )}

          {/* ================= STEP 6: PAYMENT / DEPOSIT ================= */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                  Transparent 3-Stage Payment Plan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#18151B] mt-1">
                  Initial Deposit ($515 USD)
                </h2>
                <p className="text-xs sm:text-sm text-[#575260] mt-1">
                  You only pay the initial $515 USD deposit today before application processing begins. Later payments unlock strictly upon verified results.
                </p>
              </div>

              {/* Transparent Split Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF2F5] via-white to-[#F8F5FD] border border-[#EAD5DE] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EAD5DE] gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                      Total Comprehensive Service Fee
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#18151B]">
                      ${siteConfig.pricing.totalUSD.toLocaleString()} USD
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-white text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 shadow-xs self-start sm:self-auto">
                    $515 + $858 + $1,716 = $3,089 USD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {/* Stage 1: Active Now */}
                  <div className="p-4 bg-white rounded-xl border-2 border-[#6D1838] shadow-xs relative">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-[#6D1838] text-white text-[10px] font-bold rounded-full uppercase">
                      Payable Now
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#18151B]">
                        01 — APPLICATION
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-[#6D1838] mb-1">
                      ${siteConfig.pricing.depositUSD} USD
                    </div>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      Paid before application processing begins. Covers credential audit, study program matching strategy, document formatting, and initiating official degree applications.
                    </p>
                  </div>

                  {/* Stage 2: Post Admission */}
                  <div className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#575260]">
                        02 — ADMISSION
                      </span>
                    </div>
                    <div className="text-lg font-bold text-neutral-700 mb-1">
                      ${siteConfig.pricing.admissionPaymentUSD} USD
                    </div>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      <strong>$0 due today.</strong> Paid after admission is confirmed.
                    </p>
                  </div>

                  {/* Stage 3: After JW202 */}
                  <div className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#575260]">
                        03 — JW202/JW201
                      </span>
                    </div>
                    <div className="text-lg font-bold text-neutral-700 mb-1">
                      ${siteConfig.pricing.finalPaymentUSD.toLocaleString()} USD
                    </div>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      <strong>$0 due today.</strong> Paid after the JW202/JW201 is received.
                    </p>
                  </div>
                </div>

                {/* Important Notice on Possible Institution Deposit */}
                <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-[#18151B] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                    <span>Note: Possible Institution Deposit (Separate from Service Fees)</span>
                  </div>
                  <p className="text-[#575260] leading-relaxed">
                    Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees. Depending on the institution and program, it may be deducted from tuition or accommodation costs. The applicable amount and conditions are determined by the institution.
                  </p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575260]">
                  Select Payment Method for ${siteConfig.pricing.depositUSD} USD Initial Deposit
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-xl border text-center font-semibold text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#6D1838] bg-[#FAF2F5] text-[#6D1838] shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3.5 rounded-xl border text-center font-semibold text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'wire'
                        ? 'border-[#6D1838] bg-[#FAF2F5] text-[#6D1838] shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    <span>SWIFT Bank Wire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('alipay')}
                    className={`p-3.5 rounded-xl border text-center font-semibold text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'alipay'
                        ? 'border-[#6D1838] bg-[#FAF2F5] text-[#6D1838] shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Alipay / WeChat Pay</span>
                  </button>
                </div>

                {/* Card Fields Simulation */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#575260] mb-1">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit Encrypted Secure Checkout
                      </span>
                      <span>Verified Payment Gateway</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#575260] mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. David Alexander Osei"
                        value={cardName || `${personal.firstName} ${personal.lastName}`}
                        onChange={e => setCardName(e.target.value)}
                        className="w-full p-2.5 text-xs sm:text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#6D1838]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#575260] mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full p-2.5 pl-9 text-xs sm:text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#6D1838]"
                        />
                        <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#575260] mb-1">Expires (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 text-xs sm:text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#6D1838]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#575260] mb-1">CVC / Security Code</label>
                        <input
                          type="text"
                          placeholder="CVC"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full p-2.5 text-xs sm:text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#6D1838]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Wire Transfer Details */}
                {paymentMethod === 'wire' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs">
                    <p className="font-bold text-[#18151B]">International Wire Transfer Instructions (SWIFT):</p>
                    <div className="p-3 bg-white border border-neutral-200 rounded-lg space-y-1 font-mono text-[11px]">
                      <p><strong>Bank:</strong> Bank of China (Hong Kong / Beijing)</p>
                      <p><strong>Beneficiary:</strong> Study In China International Education Ltd.</p>
                      <p><strong>SWIFT / BIC:</strong> BKCHCNBJ998</p>
                      <p><strong>Amount:</strong> $515 USD</p>
                      <p><strong>Account (USD):</strong> 8019-2049-5510-9921</p>
                      <p><strong>Reference:</strong> DEP-{personal.firstName.toUpperCase() || 'STUDENT'}-{new Date().getFullYear()}</p>
                    </div>
                    <p className="text-[11px] text-[#575260]">
                      * If paying via wire, submit now and our billing desk will confirm receipt within 24 hours.
                    </p>
                  </div>
                )}

                {/* Alipay / WeChat Pay */}
                {paymentMethod === 'alipay' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center space-y-2 text-xs">
                    <p className="font-bold text-[#18151B]">Instant Alipay & WeChat Pay QR Code</p>
                    <p className="text-[#575260] text-[11px]">
                      Amount: $515 USD equivalent. Scan with Alipay or WeChat app.
                    </p>
                    <div className="w-32 h-32 bg-white border-2 border-neutral-300 mx-auto rounded-xl flex items-center justify-center p-2 shadow-xs">
                      <div className="text-center font-mono text-[10px] text-neutral-400">
                        [Alipay / WeChat Pay QR Simulator]
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust guarantee badge */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Transparent Guarantee:</span>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Your $515 initial deposit triggers formal dossier review and submission. In the rare event that admission cannot be secured for a verified qualifying profile, our conditional refund terms apply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 7: CONFIRMATION & ONBOARDING ================= */}
          {currentStep === 7 && (
            <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-[#FAF2F5] text-[#6D1838] rounded-full text-xs font-bold border border-[#EAD5DE] mb-2 uppercase tracking-wider">
                  Dossier Initiated & $515 Deposit Confirmed
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18151B]">
                  Welcome to Study In China, {personal.firstName}!
                </h2>
                <p className="text-xs sm:text-sm text-[#575260] max-w-lg mx-auto mt-2">
                  Your formal international application file has been registered. Our admissions board is now auditing your credentials.
                </p>

                {/* Application Ref Badge */}
                <div className="mt-4 inline-flex flex-col items-center p-4 bg-neutral-50 border border-neutral-300 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Your Official Application Reference ID
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#18151B] mt-0.5">
                    {generatedAppId || `CSC-${new Date().getFullYear()}-78210`}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ Stage 1 Initial Deposit ($515 USD) Paid
                  </span>
                </div>
              </div>

              {/* Next Steps Roadmap */}
              <div className="max-w-xl mx-auto p-4 bg-[#FAF7F9] border border-neutral-200 rounded-2xl text-left space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#18151B]">
                  What Happens Next (Admissions Roadmap)
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-[#18151B]">Admissions Director Outreach:</strong>
                      <p className="text-[#575260] text-[11px]">
                        Elena Zhao will contact your WhatsApp ({personal.whatsapp}) within 12 hours with your credential audit report and tailored program recommendations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-[#18151B]">Official Application Lodging:</strong>
                      <p className="text-[#575260] text-[11px]">
                        Your finalized dossier will be lodged in the official admissions portal for {preferences.preferredField}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-[#18151B]">Admission & Milestone Payments:</strong>
                      <p className="text-[#575260] text-[11px]">
                        After admission is confirmed, Stage 2 ($858 USD) is due. Once your JW202/JW201 government visa authorization is received, Stage 3 ($1,716 USD) is due to release the original consular packet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onGoToDashboard(generatedAppId)}
                  className="w-full sm:w-auto px-7 py-3 bg-[#6D1838] hover:bg-[#58122c] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Go to My Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/8618621008954?text=Hello%20Study%20In%20China%2C%20my%20application%20reference%20is%20${generatedAppId}.%20My%20name%20is%20${encodeURIComponent(personal.firstName + ' ' + personal.lastName)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Chat With Elena on WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-5 py-3 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          {currentStep <= 6 && (
            <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl transition-colors hover:bg-neutral-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="text-xs text-neutral-500 hover:text-neutral-800 font-medium"
                >
                  Cancel & Exit
                </button>
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl transition-all shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProcessPaymentAndSubmit}
                  disabled={isProcessingPayment}
                  className="flex items-center gap-2 px-7 py-3 text-xs sm:text-sm font-bold text-white bg-[#6D1838] hover:bg-[#58122c] disabled:opacity-50 rounded-xl transition-all shadow-md"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing $515 Secure Deposit...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay $515 Deposit & Submit Application</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
