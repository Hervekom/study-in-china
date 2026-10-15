import React from 'react';
import { 
  CheckCircle2, 
  Search, 
  FileUp, 
  FileCheck, 
  Send, 
  Award, 
  Stamp, 
  PlaneTakeoff, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { pricing } from '../config/siteConfig';

interface HowItWorksProps {
  onStartApplication: () => void;
}

export const HowItWorksTimeline: React.FC<HowItWorksProps> = ({ onStartApplication }) => {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Study Preferences',
      icon: Search,
      category: 'Stage 1: Selection',
      description: 'Choose your preferred upcoming intake and specify your study preferences. Our team evaluates available opportunities to match your profile and scholarship objectives.',
      detail: 'Our advisors verify your academic qualification match to avoid rejection.',
    },
    {
      num: '02',
      title: 'Submit Your Documents',
      icon: FileUp,
      category: 'Stage 1: Selection',
      description: 'Submit your passport copy, high school or previous academic transcripts, graduation certificates, and study intentions through our secure student portal.',
      detail: 'Clear digital scans are sufficient; we provide document formatting templates.',
    },
    {
      num: '03',
      title: 'Application Review & Deposit',
      icon: FileCheck,
      category: 'Stage 2: Processing',
      description: `Our senior admissions team evaluates your dossier, formats personal statements, checks translations, and confirms your initial $${pricing.depositUSD} USD deposit.`,
      detail: 'Initial deposit starts official institutional submission and docket tracking.',
    },
    {
      num: '04',
      title: 'Official Application Lodging',
      icon: Send,
      category: 'Stage 2: Processing',
      description: 'We submit your formal application directly into the official international admissions portals and follow up with faculties weekly.',
      detail: 'Direct institutional communication ensures your file is prioritized.',
    },
    {
      num: '05',
      title: 'Receive Admission',
      icon: Award,
      category: 'Stage 3: Success',
      description: `The admissions committee issues your official Admission Notice granting acceptance into your degree program. Unlocks Stage 2 admission payment ($${pricing.admissionPaymentUSD} USD).`,
      detail: 'Admission payment is due only after official admission is confirmed.',
    },
    {
      num: '06',
      title: 'Receive JW202 / JW201 Form',
      icon: Stamp,
      category: 'Stage 3: Success',
      description: `The provincial education bureau and Ministry of Foreign Affairs generate your official digital JW202/JW201 government visa authorization form.`,
      detail: `You pay the final $${pricing.finalPaymentUSD.toLocaleString()} USD payment ONLY after the JW202/JW201 is received.`,
    },
    {
      num: '07',
      title: 'Student Visa (X1 / X2)',
      icon: ShieldCheck,
      category: 'Stage 4: Departure',
      description: 'We guide you through the Chinese Visa Application Service Center (CVASC) paperwork, appointment scheduling, and physical exam compliance.',
      detail: 'Step-by-step consular guidance ensures zero embassy delays.',
    },
    {
      num: '08',
      title: 'Prepare for China Arrival',
      icon: PlaneTakeoff,
      category: 'Stage 4: Departure',
      description: 'Pre-departure briefing, campus dormitory booking assistance, Alipay/WeChat Pay setup guidance, airport arrival instructions, and campus registration support.',
      detail: 'Arrive in China confident, prepared, and welcomed by international orientation staff.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
            <span>Structured Admissions Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18151B]">
            From Application to China — We Guide You Every Step
          </h2>
          <p className="mt-3 text-base text-[#575260] leading-relaxed">
            Our end-to-end milestone roadmap guarantees structured clarity, transparent payments, and dedicated guidance until you step onto campus.
          </p>
        </div>

        {/* Timeline Grid (2 columns on tablet/desktop with sequential flow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const IconComp = step.icon;
            const isMilestonePayment = index === 5; // JW202 milestone
            return (
              <div
                key={step.num}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative ${
                  isMilestonePayment
                    ? 'bg-gradient-to-b from-[#FAF2F5] to-white border-[#6D1838]/40 shadow-sm'
                    : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-[#6D1838] tabular-nums">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-[#18151B] group-hover:text-[#6D1838] group-hover:border-[#6D1838]/30 transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#18151B] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#575260] leading-relaxed mb-3">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-[#18151B] font-medium flex items-start gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isMilestonePayment ? 'text-[#6D1838]' : 'text-emerald-600'}`} />
                  <span>{step.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Milestone Callout banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#FAF7F9] border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D1838] text-white flex items-center justify-center font-bold text-sm shrink-0">
              $
            </div>
            <div className="text-xs sm:text-sm text-[#18151B]">
              <strong>Transparent 3-Stage Payment:</strong> You pay <strong>${pricing.depositUSD} USD</strong> initial deposit at Step 03 before processing begins, <strong>${pricing.admissionPaymentUSD} USD</strong> at Step 05 after admission, and <strong>${pricing.finalPaymentUSD.toLocaleString()} USD</strong> at Step 06 after the JW202/JW201 is received (Total: <strong>${pricing.totalUSD.toLocaleString()} USD</strong>).
            </div>
          </div>

          <button
            onClick={onStartApplication}
            className="shrink-0 px-6 py-2.5 text-xs font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Start Step 01 Today</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
