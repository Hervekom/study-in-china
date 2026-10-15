export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD' | 'Non-Degree Language' | 'Diploma' | 'Associate';

export type LanguageOfInstruction = 'English' | 'Chinese' | 'Bilingual';

export interface Program {
  id: string;
  title: string;
  name?: string;
  institutionId?: string;
  city: string;
  degree: DegreeLevel;
  field: string;
  durationYears: string;
  duration?: string;
  language: LanguageOfInstruction;
  tuitionPerYearUSD: number;
  tuitionPerYearRMB: number;
  tuition?: string;
  intakeSeason: 'Autumn (September)' | 'Spring (March)';
  intake?: string;
  applicationDeadline: string;
  scholarshipEligible: boolean;
  scholarshipType?: 'Full Scholarship' | 'Partial Scholarship' | 'Tuition Waiver' | 'Self-Funded' | 'Scholarship Available';
  scholarshipCoverage: string;
  overview: string;
  description?: string;
  entryRequirements: string[];
  requirements?: string[];
  eligibility?: string[];
  requiredDocuments?: string[];
  documents?: string[];
  careerOpportunities?: string[];
  whatYoullStudy?: string[];
  status?: string;
}

export interface FAQItem {
  id: string;
  category: 'Pricing & Payments' | 'Admissions & Programs' | 'JW202 & Visa' | 'General & Requirements';
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: 'Study in China' | 'Degree Programs' | 'Scholarships' | 'Admissions' | 'Student Visa' | 'JW202' | 'Life in China' | 'International Students';
  excerpt: string;
  content: string[];
  author: string;
  publishedDate: string;
  readTimeMinutes: number;
  coverImage?: string;
}

export interface TrustMetrics {
  studentsGuided: number;
  partnerUniversities: number;
  academicPrograms: number;
  sourceCountries: number;
  visaSuccessRatePct: number;
}

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  nationality?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhotoUrl?: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  nationality: string;
  programName: string;
  quote: string;
  avatarUrl?: string;
  rating: number;
  year: number;
}

export type AppView = 'home' | 'apply' | 'dashboard' | 'admin' | 'compare' | 'login';

export type DocumentType =
  | 'passport'
  | 'transcript'
  | 'certificate'
  | 'photo'
  | 'english_test'
  | 'cv'
  | 'recommendation_1'
  | 'recommendation_2'
  | 'study_plan'
  | 'police_record'
  | 'physical_exam'
  | 'other';

export interface DocumentItem {
  id: string;
  type: DocumentType;
  title: string;
  description: string;
  required: boolean;
  name?: string;
  fileSize?: string;
  uploadDate?: string;
  status: 'missing' | 'pending' | 'verified' | 'needs_resubmission' | 'uploaded' | 'under_review' | 'approved' | 'correction_required';
  feedback?: string;
  fileUrl?: string;
  /** Path of the real file in Supabase Storage (bucket student-documents) */
  storagePath?: string;
  /** Acknowledgment of receipt sent by the admissions team */
  receivedAt?: string;
  receivedBy?: string;
}

// Direct alias for future backend contract
export type ApplicationDocument = DocumentItem;

export interface Admission {
  id: string;
  applicationId: string;
  programTitle: string;
  degree: DegreeLevel;
  intakeSeason: string;
  registrationNumber: string;
  issueDate: string;
  status: 'pending' | 'received' | 'confirmed';
  letterUrl?: string;
  officialNotes?: string;
}

export interface JWDocument {
  id: string;
  applicationId: string;
  documentType: 'JW202' | 'JW201';
  formNumber: string;
  visaType: 'X1' | 'X2';
  validUntil: string;
  issueDate: string;
  status: 'processing' | 'ready' | 'received';
  authorizedDuration: string;
  downloadUrl?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  applicationId: string;
  amount: number;
  amountXaf?: number;
  currency: string;
  paymentType: 'initial_deposit' | 'admission_payment' | 'final_payment';
  status: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  transactionReference: string;
  receiptNumber: string;
  paidAt?: string;
}

export type ApplicationStatus =
  | 'deposit_pending'
  | 'deposit_paid'
  | 'document_review'
  | 'university_submitted'
  | 'interview_evaluation'
  | 'admission_granted'
  | 'admission_payment_pending'
  | 'jw202_issued'
  | 'final_payment_pending'
  | 'visa_preparation'
  | 'pre_departure';

export interface PaymentDetails {
  paid: boolean;
  amount: number;
  amountXaf?: number;
  status?: 'pending' | 'paid' | 'locked';
  date?: string;
  method?: string;
  transactionId?: string;
  receiptNumber?: string;
}

export interface PaymentRecord {
  deposit: PaymentDetails;
  admissionPayment: PaymentDetails;
  finalPayment: PaymentDetails;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current?: boolean;
}

export interface AdvisorMessage {
  id: string;
  sender: 'advisor' | 'student';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  country: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  currentCity: string;
  currentCountry: string;
  address?: string;
}

export interface EducationInfo {
  highestEducation: string;
  schoolName: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpaOrGrade: string;
  englishProficiency: string;
  englishScore?: string;
  chineseProficiency: string;
  chineseScore?: string;
}

export interface ProgramPreference {
  priority: 1 | 2 | 3;
  fieldOfStudy: string;
  program: string;
  degreeLevel: DegreeLevel | string;
  studyLanguage: string;
  intake: string;
}

export interface ApplicantPreferences {
  firstChoice: ProgramPreference;
  secondChoice: ProgramPreference;
  thirdChoice: ProgramPreference;
}

export type PreferenceMatchingStatus =
  | 'preferences_submitted'
  | 'under_review'
  | 'matching_in_progress'
  | 'opportunity_identified'
  | 'application_preparation'
  | 'admission_process'
  | 'admission_confirmed';

export interface StudyPreferences {
  targetDegree: DegreeLevel;
  preferredField: string;
  preferredCity?: string;
  specificProgram?: string;
  intakeSeason: string;
  fundingPreference: string;
  additionalNotes?: string;
  firstChoice?: ProgramPreference;
  secondChoice?: ProgramPreference;
  thirdChoice?: ProgramPreference;
  matchingStatus?: PreferenceMatchingStatus;
  matchingNotes?: string;
}

export interface InstitutionDepositInfo {
  required: boolean;
  status: 'pending' | 'paid' | 'not_required';
  amountUSD: number;
  deadline: string;
  reason: string;
  paymentInstructions: string;
  mayCreditTowardTuition: boolean;
  mayCreditTowardAccommodation: boolean;
  refundCancellationConditions: string;
  programType: 'Self-Support Program' | 'Partial Scholarship / Partial Support Program';
  supportingNoticeUrl?: string;
  paidDate?: string;
  receiptNumber?: string;
}

export interface StudentApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  personal: PersonalInfo;
  education: EducationInfo;
  preferences: StudyPreferences;
  documents: DocumentItem[];
  payments: PaymentRecord;
  timeline: TimelineEvent[];
  messages: AdvisorMessage[];
  advisor: {
    name: string;
    title: string;
    email: string;
    whatsapp: string;
    avatar: string;
  };
  institutionDeposit?: InstitutionDepositInfo;
  admissionNotice?: {
    program: string;
    intake: string;
    issueDate: string;
    studentRegistrationNo: string;
    officialStampUrl?: string;
  };
  jw202Form?: {
    formNumber: string;
    formType: 'JW202' | 'JW201';
    visaType: 'X1' | 'X2';
    validUntil: string;
    issueDate: string;
    authorizedDuration: string;
  };
  adminNotes?: string;
}

export interface ApplicationFormData {
  selectedDegree: DegreeLevel;
  preferredField: string;
  preferredCity?: string;
  specificProgram?: string;
  fullName: string;
  email: string;
  whatsapp: string;
  nationality: string;
  birthYear: string;
  highestEducation: string;
  currentGpaOrGrade: string;
  languageProficiency: string;
  hasPassport: 'Yes' | 'In Process' | 'Not Yet';
  hasAcademicTranscripts: boolean;
  hasGraduationCertificate: boolean;
  hasEnglishProficiencyTest: boolean;
  notes?: string;
}
