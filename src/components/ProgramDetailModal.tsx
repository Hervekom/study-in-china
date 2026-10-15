import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  DollarSign, 
  Award, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Briefcase, 
  FileText, 
  HelpCircle,
  ArrowRight,
  Globe2,
  GraduationCap
} from 'lucide-react';
import { Program } from '../types';
import { pricing } from '../config/siteConfig';

interface ProgramDetailModalProps {
  program: Program | null;
  onClose: () => void;
  onApply: (programTitle: string, degree?: string) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'requirements' | 'tuition' | 'careers' | 'faq'>('overview');

  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Header */}
        <div className="p-6 sm:p-7 border-b border-neutral-100 bg-gradient-to-r from-[#FAF2F5] via-[#F8F5FD] to-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#575260] mb-2.5">
            <span className="font-bold text-[#6D1838] bg-[#FAF2F5] px-2.5 py-0.5 rounded-md border border-[#EAD5DE]">
              {program.degree} Degree
            </span>
            <span className="text-neutral-300">·</span>
            <span className="font-semibold text-neutral-700">{program.field}</span>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1 font-medium text-[#6C3B9E]">
              <Globe2 className="w-3.5 h-3.5" /> {program.language}-Taught Curriculum
            </span>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1 text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-[#6D1838]" /> {program.city} Academic Hub
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18151B] tracking-tight pr-8 leading-tight">
            {program.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#575260] mt-2 max-w-2xl leading-relaxed">
            Accredited full-time degree track recognized by the Ministry of Education. Offered across premier host faculties in China with English-medium coursework.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-neutral-200 bg-neutral-50/80 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#6D1838] text-[#6D1838]'
                : 'border-transparent text-[#575260] hover:text-[#18151B]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'border-[#6D1838] text-[#6D1838]'
                : 'border-transparent text-[#575260] hover:text-[#18151B]'
            }`}
          >
            Program Structure
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'border-[#6D1838] text-[#6D1838]'
                : 'border-transparent text-[#575260] hover:text-[#18151B]'
            }`}
          >
            Entry Requirements
          </button>
          <button
            onClick={() => setActiveTab('tuition')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tuition'
                ? 'border-[#6D1838] text-[#6D1838]'
                : 'border-transparent text-[#575260] hover:text-[#18151B]'
            }`}
          >
            Tuition & Scholarships
          </button>
          <button
            onClick={() => setActiveTab('careers')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'careers'
                ? 'border-[#6D1838] text-[#6D1838]'
                : 'border-transparent text-[#575260] hover:text-[#18151B]'
            }`}
          >
            Career Opportunities
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-[#6D1838] text-[#6D1838]'
                : 'border-transparent text-[#575260] hover:text-[#18151B]'
            }`}
          >
            FAQ
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-[#18151B]">
          {/* Key Facts Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs">
            <div>
              <p className="text-[#575260] mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" /> Study Duration
              </p>
              <p className="font-bold text-[#18151B]">{program.durationYears}</p>
            </div>
            <div>
              <p className="text-[#575260] mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" /> Intake & Deadline
              </p>
              <p className="font-bold text-[#18151B]">{program.intakeSeason}</p>
              <span className="text-[10px] text-neutral-400">Deadline: {program.applicationDeadline}</span>
            </div>
            <div>
              <p className="text-[#575260] mb-0.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Est. Annual Tuition
              </p>
              <p className="font-bold text-[#18151B]">
                ${program.tuitionPerYearUSD.toLocaleString()} USD / yr
              </p>
              <span className="text-[10px] text-neutral-400">≈ ¥{program.tuitionPerYearRMB.toLocaleString()} RMB</span>
            </div>
            <div>
              <p className="text-[#575260] mb-0.5 flex items-center gap-1">
                <Award className="w-3 h-3 text-[#6C3B9E]" /> Scholarship Status
              </p>
              <p className="font-bold text-[#6C3B9E]">
                {program.scholarshipEligible ? 'Eligible for CSC' : 'Self-Funded'}
              </p>
              <span className="text-[10px] text-neutral-400">Tuition Waiver Options</span>
            </div>
          </div>

          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Academic Overview
                </h3>
                <p className="text-sm text-[#575260] leading-relaxed">
                  {program.overview}
                </p>
              </div>

              {program.scholarshipEligible && (
                <div className="p-4 rounded-xl bg-[#F8F5FD] border border-[#E5D6F7]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6C3B9E] mb-1">
                    <Award className="w-4 h-4" /> Scholarship Opportunities
                  </div>
                  <p className="text-xs font-semibold text-[#18151B] mb-1">
                    {program.scholarshipCoverage}
                  </p>
                  <p className="text-xs text-[#575260] leading-relaxed">
                    Qualified applicants can apply for Chinese Government Scholarship (CSC), provincial municipal grants, and institutional merit fellowships covering full or partial tuition fees.
                  </p>
                </div>
              )}

              {/* Study Options Note */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18151B] mb-1">
                  General Study Options in China
                </h4>
                <p className="text-xs text-[#575260] leading-relaxed">
                  This program is offered across key academic hubs in China (such as Beijing, Shanghai, and Hangzhou). When applying, you can specify your city or environmental preference, or allow our admissions advisory committee to recommend the optimal match based on your academic GPA and scholarship eligibility.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Program Structure */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-1">
                What You'll Study & Curriculum Modules
              </h3>
              <p className="text-xs text-[#575260]">
                Standardized curriculum designed to meet international accreditation standards while incorporating technological advancements and regional industry cases.
              </p>

              {program.whatYoullStudy && program.whatYoullStudy.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {program.whatYoullStudy.map((subject, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-[#18151B]">{subject}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <h4 className="text-xs font-bold text-[#18151B] mb-1">Core Theoretical Foundation</h4>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      Rigorous grounding in analytical principles, systems architecture, and specialized domain methodologies.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <h4 className="text-xs font-bold text-[#18151B] mb-1">Applied Laboratory & Studio Work</h4>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      Hands-on practical training in state-of-the-art computing clusters or clinical/industrial environments.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <h4 className="text-xs font-bold text-[#18151B] mb-1">Chinese Language & Culture Module</h4>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      Introductory Mandarin and cultural orientation included in the first year to assist with daily living.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <h4 className="text-xs font-bold text-[#18151B] mb-1">Capstone Thesis / Final Project</h4>
                    <p className="text-xs text-[#575260] leading-relaxed">
                      Independent faculty-supervised research thesis or graduation project defending before an international panel.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Entry Requirements */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
                  Academic & Admission Requirements
                </h3>
                <div className="space-y-2">
                  {program.entryRequirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[#18151B] p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <CheckCircle2 className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18151B] mb-2">
                  Standard Application Documents Required
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-[#575260]">
                  {(program.requiredDocuments && program.requiredDocuments.length > 0
                    ? program.requiredDocuments
                    : [
                        'Valid International Passport (18+ mo)',
                        'Official Transcripts & Diploma',
                        'Study Plan / Statement of Purpose',
                        'Foreigner Physical Examination Form',
                        'Non-Criminal Record Certificate',
                        'English Proficiency Certificate (if applicable)'
                      ]
                  ).map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                      <FileText className="w-3.5 h-3.5 text-[#6D1838] shrink-0" />
                      <span className="font-medium text-[#18151B]">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Tuition & Scholarships */}
          {activeTab === 'tuition' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-1">
                Tuition Structure & Living Costs
              </h3>
              
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="font-semibold text-[#18151B]">Estimated Tuition (Annual)</span>
                  <span className="font-bold text-[#6D1838]">${program.tuitionPerYearUSD.toLocaleString()} USD (≈ ¥{program.tuitionPerYearRMB.toLocaleString()} RMB)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="font-semibold text-[#18151B]">Campus International Student Dormitory</span>
                  <span className="font-medium text-[#18151B]">$120 – $300 USD / month</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="font-semibold text-[#18151B]">Estimated Food & Living Expenses</span>
                  <span className="font-medium text-[#18151B]">$250 – $400 USD / month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#18151B]">Comprehensive Health Insurance in China</span>
                  <span className="font-medium text-[#18151B]">800 RMB / year (approx. $115 USD)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF2F5] border border-[#EAD5DE] text-xs">
                <h4 className="font-bold text-[#6D1838] mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Full & Partial Scholarship Opportunities
                </h4>
                <p className="text-[#575260] leading-relaxed">
                  Students applying through our service receive full guidance to apply for Chinese Government Scholarships (CSC), provincial municipal awards, and faculty tuition waivers. Full scholarships provide 100% tuition waivers, free housing, and monthly living stipends.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Career Opportunities */}
          {activeTab === 'careers' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-1">
                Career Trajectories & Industry Pathways
              </h3>
              <p className="text-xs text-[#575260] leading-relaxed">
                Graduates holding accredited degrees in {program.field} benefit from high global mobility, familiarity with the Asia-Pacific economy, and international enterprise networks.
              </p>

              {program.careerOpportunities && program.careerOpportunities.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {program.careerOpportunities.map((career, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs flex items-start gap-2.5">
                      <Briefcase className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-[#18151B]">{career}</h4>
                        <p className="text-[11px] text-[#575260] mt-0.5">High industry demand & global mobility</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs">
                    <h4 className="font-bold text-[#18151B] mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#6D1838]" /> Global Corporate Careers
                    </h4>
                    <p className="text-[#575260]">
                      High recruitment interest from international multinationals operating across East Asia, Europe, Africa, and Latin America.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs">
                    <h4 className="font-bold text-[#18151B] mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#6C3B9E]" /> Postgraduate & Research Pathways
                    </h4>
                    <p className="text-[#575260]">
                      Direct academic recognition for master's and doctoral admissions in leading institutions globally.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
                Frequently Asked Questions About This Program
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="font-bold text-[#18151B] mb-1">Is this program taught completely in English?</p>
                  <p className="text-[#575260]">Yes. All core lectures, textbooks, laboratory sessions, and thesis submissions are conducted entirely in English.</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="font-bold text-[#18151B]">Do I need to decide on a specific campus right now?</p>
                  <p className="text-[#575260]">No. You apply with your chosen program and degree. Our admissions team will review your transcripts and present the best matching accredited study options.</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="font-bold text-[#18151B]">When will I receive my JW202 visa document?</p>
                  <p className="text-[#575260]">Once your admission notice is confirmed by the faculty, the provincial education bureau generates your digital JW202 visa document within 2 to 3 weeks.</p>
                </div>
              </div>
            </div>
          )}

          {/* Guaranteed Transparency Box */}
          <div className="flex items-start gap-2.5 text-xs text-[#575260] bg-[#FAF2F5] p-3.5 rounded-xl border border-[#EAD5DE]">
            <ShieldCheck className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Simple, Transparent Payment Plan:</strong> Total service fee is ${pricing.total.usd.toLocaleString()} USD. You start with only ${pricing.initialDeposit.usd} USD initial deposit; subsequent payments are made only after admission (${pricing.admissionPayment.usd} USD) and after your JW202 visa document is issued (${pricing.finalPayment.usd} USD). Where applicable, any separate institution deposit requested by the school to confirm a place is separate from Study In China service fees.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-[#FAF7F9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#575260]">
            Application Deadline: <strong className="text-[#18151B]">{program.applicationDeadline}</strong>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApply(program.title, program.degree);
                onClose();
              }}
              className="w-1/2 sm:w-auto px-6 py-2 text-xs font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Apply for This Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
