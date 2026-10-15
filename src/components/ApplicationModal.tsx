import React, { useState } from 'react';
import { X, Check, ArrowRight, ArrowLeft, ShieldCheck, FileCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { DegreeLevel, ApplicationFormData } from '../types';
import { siteConfig } from '../data/siteConfig';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillProgram?: string;
  prefillDegree?: DegreeLevel;
}

const INITIAL_FORM: ApplicationFormData = {
  selectedDegree: 'Bachelor',
  preferredField: 'Computer Science & AI',
  preferredCity: 'Beijing',
  specificProgram: '',
  fullName: '',
  email: '',
  whatsapp: '',
  nationality: '',
  birthYear: '2004',
  highestEducation: 'High School Diploma',
  currentGpaOrGrade: '3.4 GPA',
  languageProficiency: 'English Fluent / IELTS 6.5',
  hasPassport: 'Yes',
  hasAcademicTranscripts: true,
  hasGraduationCertificate: true,
  hasEnglishProficiencyTest: false,
  notes: '',
};

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  prefillProgram = '',
  prefillDegree,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<ApplicationFormData>(() => ({
    ...INITIAL_FORM,
    specificProgram: prefillProgram || '',
    selectedDegree: prefillDegree || 'Bachelor',
  }));
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync prefill when modal reopens with specific choices
  React.useEffect(() => {
    if (isOpen) {
      if (prefillProgram) setFormData(prev => ({ ...prev, specificProgram: prefillProgram }));
      if (prefillDegree) setFormData(prev => ({ ...prev, selectedDegree: prefillDegree }));
    }
  }, [isOpen, prefillProgram, prefillDegree]);

  if (!isOpen) return null;

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 2) {
      if (!formData.fullName.trim()) errs.fullName = 'Please enter your full legal name';
      if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email address is required';
      if (!formData.whatsapp.trim()) errs.whatsapp = 'WhatsApp number with country code is required';
      if (!formData.nationality.trim()) errs.nationality = 'Please enter your citizenship/nationality';
    }

    if (currentStep === 3) {
      if (!formData.highestEducation.trim()) errs.highestEducation = 'Highest education completed is required';
      if (!formData.currentGpaOrGrade.trim()) errs.currentGpaOrGrade = 'Estimated GPA or average percentage is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    // Generate reference code
    const generatedRef = `CSC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedId(generatedRef);
    setStep(6); // Success state
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSubmittedId(null);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress Steps */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-[#FAF7F9] relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#6D1838]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
              {siteConfig.brandName} Admissions
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#18151B]">
            Start Your Application
          </h2>

          {/* Progress bar */}
          {step <= 5 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-medium text-[#575260] mb-1.5">
                <span>Step {step} of 5: {
                  step === 1 ? 'Study Path & Field' :
                  step === 2 ? 'Personal Details' :
                  step === 3 ? 'Academic Background' :
                  step === 4 ? 'Document Readiness' :
                  'Transparent Review & Deposit'
                }</span>
                <span className="font-semibold text-[#6D1838]">{step * 20}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#6D1838] transition-all duration-300 rounded-full"
                  style={{ width: `${step * 20}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-5 text-sm text-[#18151B]">
          {/* STEP 1: Study Path & Preference */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                  Target Degree Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Bachelor', 'Master', 'PhD', 'Non-Degree Language'] as DegreeLevel[]).map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedDegree: deg })}
                      className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        formData.selectedDegree === deg
                          ? 'bg-[#6D1838] text-white border-[#6D1838] shadow-sm'
                          : 'bg-neutral-50 text-[#18151B] border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {deg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                  Intended Field of Study
                </label>
                <select
                  value={formData.preferredField}
                  onChange={(e) => setFormData({ ...formData, preferredField: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                >
                  <option value="Computer Science & AI">Computer Science & Artificial Intelligence</option>
                  <option value="Medicine & Healthcare">Medicine (MBBS) & Healthcare</option>
                  <option value="Business & Management">Business Administration, Finance & Economics</option>
                  <option value="Engineering & Technology">Civil, Mechanical & Electrical Engineering</option>
                  <option value="Architecture & Design">Architecture & Urban Planning</option>
                  <option value="Chinese Language & Culture">Chinese Language Immersion</option>
                  <option value="Social Sciences & Humanities">International Relations & Diplomacy</option>
                  <option value="Other / Undecided">Other / Need Academic Advice</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Preferred Study Hub City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Beijing, Shanghai, Hangzhou, or Any"
                    value={formData.preferredCity}
                    onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value })}
                    className="w-full p-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Target Program Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Sc. Computer Science"
                    value={formData.specificProgram}
                    onChange={(e) => setFormData({ ...formData, specificProgram: e.target.value })}
                    className="w-full p-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF2F5] border border-[#EAD5DE] rounded-xl text-xs text-[#575260]">
                💡 <strong>Tip:</strong> You don't need to specify an institution now. Our advisors will evaluate your transcripts and match you with suitable accredited study options in China.
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                  Full Name (as written in passport) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alexander John Smith"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full p-3 text-xs sm:text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                    errors.fullName ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full p-3 text-xs sm:text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                      errors.email ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    WhatsApp Number (with country code) *
                  </label>
                  <input
                    type="text"
                    placeholder="+1 555 123 4567"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className={`w-full p-3 text-xs sm:text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                      errors.whatsapp ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.whatsapp && <p className="text-xs text-rose-500 mt-1">{errors.whatsapp}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Passport Nationality / Citizenship *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. South Africa, Brazil, Germany"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className={`w-full p-3 text-xs sm:text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                      errors.nationality ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.nationality && <p className="text-xs text-rose-500 mt-1">{errors.nationality}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Year of Birth
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2003"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className="w-full p-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Background */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                  Current or Highest Education Completed *
                </label>
                <input
                  type="text"
                  placeholder="e.g. High School Diploma, A-Levels, B.Sc. in Physics"
                  value={formData.highestEducation}
                  onChange={(e) => setFormData({ ...formData, highestEducation: e.target.value })}
                  className={`w-full p-3 text-xs sm:text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                    errors.highestEducation ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                  }`}
                />
                {errors.highestEducation && <p className="text-xs text-rose-500 mt-1">{errors.highestEducation}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    Cumulative GPA or Percentage *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.4/4.0 or 85%"
                    value={formData.currentGpaOrGrade}
                    onChange={(e) => setFormData({ ...formData, currentGpaOrGrade: e.target.value })}
                    className={`w-full p-3 text-xs sm:text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                      errors.currentGpaOrGrade ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                    }`}
                  />
                  {errors.currentGpaOrGrade && <p className="text-xs text-rose-500 mt-1">{errors.currentGpaOrGrade}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                    English Proficiency (if non-native)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IELTS 6.5, TOEFL 90, Medium of Instruction letter"
                    value={formData.languageProficiency}
                    onChange={(e) => setFormData({ ...formData, languageProficiency: e.target.value })}
                    className="w-full p-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                  Academic Interests or Specific Questions for Advisor
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your career goals, scholarship interests, or specific city preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Document Readiness Checklist */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF7F9] border border-neutral-200 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18151B] mb-1 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#6D1838]" /> Document Readiness Self-Check
                </h4>
                <p className="text-xs text-[#575260]">
                  Indicate which documents you currently have available. If some are still being prepared, our advisors will provide formatting templates and guidance.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-[#18151B]">Valid International Passport</p>
                    <p className="text-xs text-[#575260]">At least 18 months validity recommended</p>
                  </div>
                  <select
                    value={formData.hasPassport}
                    onChange={(e) => setFormData({ ...formData, hasPassport: e.target.value as any })}
                    className="text-xs p-2 bg-white border border-neutral-300 rounded-lg"
                  >
                    <option value="Yes">Ready (Valid)</option>
                    <option value="In Process">In Renewal / Application</option>
                    <option value="Not Yet">Not Yet Issued</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer hover:bg-neutral-100/60">
                  <input
                    type="checkbox"
                    checked={formData.hasAcademicTranscripts}
                    onChange={(e) => setFormData({ ...formData, hasAcademicTranscripts: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#6D1838] rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-[#18151B]">Academic Transcripts & Marksheets</p>
                    <p className="text-xs text-[#575260]">Copies of secondary school or post-secondary semester records</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer hover:bg-neutral-100/60">
                  <input
                    type="checkbox"
                    checked={formData.hasGraduationCertificate}
                    onChange={(e) => setFormData({ ...formData, hasGraduationCertificate: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#6D1838] rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-[#18151B]">Diploma or Provisional Graduation Certificate</p>
                    <p className="text-xs text-[#575260]">Or pre-graduation expected certificate issued by your school</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer hover:bg-neutral-100/60">
                  <input
                    type="checkbox"
                    checked={formData.hasEnglishProficiencyTest}
                    onChange={(e) => setFormData({ ...formData, hasEnglishProficiencyTest: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#6D1838] rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-[#18151B]">English Proficiency Test (IELTS / TOEFL / Duolingo / MOI)</p>
                    <p className="text-xs text-[#575260]">Optional if your prior medium of instruction was English</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Pricing Breakdown & Confirmation */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF2F5] to-[#F8F5FD] border border-[#EAD5DE]">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#EAD5DE]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
                    Official Fee Transparency
                  </span>
                  <span className="text-xs font-bold text-[#18151B]">
                    Total Service Fees: ${siteConfig.pricing.totalUSD.toLocaleString()} USD
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 px-3 bg-white/80 rounded-lg border border-[#EAD5DE]/60">
                    <div>
                      <span className="font-bold text-[#18151B]">1. Initial Deposit:</span>
                      <p className="text-[#575260] text-[11px]">Due before application/document processing begins</p>
                    </div>
                    <span className="font-bold text-base text-[#6D1838]">${siteConfig.pricing.depositUSD} USD</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 px-3 bg-white/80 rounded-lg border border-[#E5D6F7]/60">
                    <div>
                      <span className="font-bold text-[#18151B]">2. Admission Payment:</span>
                      <p className="text-[#575260] text-[11px]">Due once official admission offer is confirmed</p>
                    </div>
                    <span className="font-bold text-base text-[#6C3B9E]">${siteConfig.pricing.admissionPaymentUSD} USD</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 px-3 bg-white/80 rounded-lg border border-emerald-200/60">
                    <div>
                      <span className="font-bold text-[#18151B]">3. Final Payment:</span>
                      <p className="text-[#575260] text-[11px]">Due after government JW202/JW201 visa document is received</p>
                    </div>
                    <span className="font-bold text-base text-emerald-800">${siteConfig.pricing.finalPaymentUSD} USD</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-center text-xs text-[#575260]">
                  <span className="font-semibold text-[#18151B]">${siteConfig.pricing.depositUSD}</span> (Deposit) + <span className="font-semibold text-[#18151B]">${siteConfig.pricing.admissionPaymentUSD}</span> (Admission) + <span className="font-semibold text-[#18151B]">${siteConfig.pricing.finalPaymentUSD}</span> (JW202) = <span className="font-bold text-[#6D1838]">${siteConfig.pricing.totalUSD.toLocaleString()} USD Total</span>
                </div>

                <div className="mt-2.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#575260]">
                  <span className="font-bold text-amber-900 block">Note on Possible Institution Deposit:</span>
                  Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees.
                </div>
              </div>

              {/* Summary of applicant */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5">
                <p className="font-bold text-[#18151B] text-xs uppercase tracking-wider mb-1">Dossier Summary</p>
                <p><strong>Applicant:</strong> {formData.fullName} ({formData.nationality})</p>
                <p><strong>Contact:</strong> {formData.email} · {formData.whatsapp}</p>
                <p><strong>Selected Target:</strong> {formData.selectedDegree} in {formData.preferredField}</p>
                {formData.preferredCity && <p><strong>Preferred Hub:</strong> {formData.preferredCity}</p>}
                {formData.specificProgram && <p><strong>Target Program:</strong> {formData.specificProgram}</p>}
              </div>

              <div className="flex items-start gap-2 text-xs text-[#575260]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  By clicking Submit Application, your profile will be registered and our senior admissions director will reach out via WhatsApp and Email within 12 hours with your application checklist and deposit processing details.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Success confirmation */}
          {step === 6 && submittedId && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-[#FAF2F5] text-[#6D1838] rounded-full text-xs font-bold border border-[#EAD5DE] mb-2">
                  Application Dossier Initiated
                </span>
                <h3 className="text-xl font-bold text-[#18151B]">
                  Welcome to Study In China, {formData.fullName.split(' ')[0]}!
                </h3>
                <p className="text-xs sm:text-sm text-[#575260] max-w-md mx-auto mt-1">
                  Your admissions file has been registered under reference number:
                </p>
                <div className="mt-2 inline-block px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-base font-bold text-[#18151B]">
                  {submittedId}
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-left max-w-lg mx-auto space-y-2">
                <p className="font-bold text-[#18151B]">Next Steps in Your Journey:</p>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Your admissions counselor will connect with you via WhatsApp ({formData.whatsapp}) to verify your degree choice and review your transcripts.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Pay the $515 USD initial deposit via secure bank transfer or card to begin official application submission.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Pay Stage 2 ($858 USD) after admission is confirmed, and Stage 3 ($1,716 USD) only after your JW202/JW201 government document is received.</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/8618621008954?text=Hello%20Study%20In%20China%2C%20my%20application%20reference%20is%20${submittedId}.%20My%20name%20is%20${encodeURIComponent(formData.fullName)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Chat With Advisor on WhatsApp Now</span>
                </a>
                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {step <= 5 && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-[#FAF7F9] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <span className="text-xs text-[#575260]">Transparent 3-Stage Payment Plan</span>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl transition-colors shadow-sm"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl transition-colors shadow-md"
              >
                Submit Application ($515 Deposit) <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
