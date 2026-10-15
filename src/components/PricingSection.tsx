import React from 'react';
import { Check, ShieldCheck, ArrowRight, Lock, HelpCircle, ArrowDown, Building, GraduationCap, Info } from 'lucide-react';
import { pricing, institutionDepositNotice } from '../config/siteConfig';

interface PricingSectionProps {
  onStartWithDeposit: () => void;
  onOpenRefundPolicy: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onStartWithDeposit,
  onOpenRefundPolicy,
}) => {
  const { initialDeposit, admissionPayment, finalPayment, total } = pricing;

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white via-[#FAF5F8] to-white border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
            <span>Fair & Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18151B]">
            Simple, Transparent Payment Plan
          </h2>
          <p className="mt-3 text-base text-[#575260] leading-relaxed">
            No hidden retainers, no tiered surprise fees, and no upfront full payment. Our service fee is structured across three milestone-backed stages—you only pay as each stage is achieved.
          </p>
        </div>

        {/* Pricing Card Showcase */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#EAD5DE] shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-[#6D1838] text-white p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
                Complete End-to-End Admissions & Visa Service
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Total Service Fees: ${total.usd.toLocaleString()} USD
              </h3>
              <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium">
                ${initialDeposit.usd} + ${admissionPayment.usd} + ${finalPayment.usd} = ${total.usd.toLocaleString()} USD
              </p>
            </div>

            <div className="shrink-0 text-center sm:text-right">
              <button
                onClick={onStartWithDeposit}
                className="px-8 py-3.5 bg-white text-[#6D1838] hover:bg-neutral-100 active:bg-neutral-200 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start With ${initialDeposit.usd} Deposit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-white/70 mt-1.5 font-medium">
                Initial deposit due before processing begins
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Visual Timeline Section */}
            <div className="mb-10 p-5 rounded-2xl bg-[#FAF7F9] border border-neutral-200/90">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#575260] mb-4 text-center">
                Three-Step Payment Timeline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                {/* Stage 1 */}
                <div className="p-4 rounded-xl bg-white border border-[#EAD5DE] text-center shadow-2xs">
                  <div className="text-[11px] font-bold text-[#6D1838] uppercase tracking-wide">
                    01 — APPLICATION
                  </div>
                  <div className="text-2xl font-black text-[#18151B] mt-1">
                    ${initialDeposit.usd} USD
                  </div>
                  <div className="text-xs font-bold text-[#6D1838] mt-0.5">
                    Initial Deposit
                  </div>
                  <div className="text-[11px] text-[#575260] mt-1">
                    Paid before application processing.
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center text-[#6D1838]">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="md:hidden flex justify-center text-[#6D1838]">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-xl bg-white border border-[#E5D6F7] text-center shadow-2xs">
                  <div className="text-[11px] font-bold text-[#6C3B9E] uppercase tracking-wide">
                    02 — ADMISSION
                  </div>
                  <div className="text-2xl font-black text-[#18151B] mt-1">
                    ${admissionPayment.usd} USD
                  </div>
                  <div className="text-xs font-bold text-[#6C3B9E] mt-0.5">
                    Admission Payment
                  </div>
                  <div className="text-[11px] text-[#575260] mt-1">
                    Paid after admission is confirmed.
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center text-[#6C3B9E]">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="md:hidden flex justify-center text-[#6C3B9E]">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-xl bg-white border border-emerald-200 text-center shadow-2xs">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    03 — JW202/JW201
                  </div>
                  <div className="text-2xl font-black text-[#18151B] mt-1">
                    ${finalPayment.usd} USD
                  </div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">
                    Final Payment
                  </div>
                  <div className="text-[11px] text-[#575260] mt-1">
                    Paid after the JW202/JW201 is received.
                  </div>
                </div>
              </div>

              {/* Total Banner Summary */}
              <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-[#575260] font-medium">
                  Payment plan: <strong>${initialDeposit.usd} + ${admissionPayment.usd} + ${finalPayment.usd}</strong>
                </span>
                <span className="font-extrabold text-sm text-[#18151B]">
                  TOTAL SERVICE FEES: ${total.usd.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Three Payment Cards / Steps */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#575260] mb-6 text-center">
              Detailed Three-Stage Breakdown
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 01: Initial Deposit */}
              <div className="p-6 rounded-2xl bg-[#FAF2F5] border border-[#EAD5DE] relative flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838] bg-white px-2 py-0.5 rounded-md border border-[#EAD5DE]">
                      {initialDeposit.step}
                    </span>
                    <span className="text-xs font-bold text-[#6D1838]">
                      Application Stage
                    </span>
                  </div>
                  <h5 className="text-lg font-bold text-[#18151B] mt-2 mb-1">
                    {initialDeposit.label}
                  </h5>
                  <div className="text-2xl font-extrabold text-[#6D1838] tabular-nums mb-2">
                    ${initialDeposit.usd} USD
                  </div>
                  <p className="text-xs text-[#575260] leading-relaxed mb-4">
                    {initialDeposit.timing}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#EAD5DE] text-[11px] font-semibold text-[#6D1838]">
                  ✓ Paid before application processing begins
                </div>
              </div>

              {/* Card 02: After Admission */}
              <div className="p-6 rounded-2xl bg-[#F8F5FD] border border-[#E5D6F7] relative flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6C3B9E] bg-white px-2 py-0.5 rounded-md border border-[#E5D6F7]">
                      {admissionPayment.step}
                    </span>
                    <span className="text-xs font-bold text-[#6C3B9E]">
                      Admission Stage
                    </span>
                  </div>
                  <h5 className="text-lg font-bold text-[#18151B] mt-2 mb-1">
                    {admissionPayment.label}
                  </h5>
                  <div className="text-2xl font-extrabold text-[#6C3B9E] tabular-nums mb-2">
                    ${admissionPayment.usd} USD
                  </div>
                  <p className="text-xs text-[#575260] leading-relaxed mb-4">
                    {admissionPayment.timing}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5D6F7] text-[11px] font-semibold text-[#6C3B9E]">
                  ✓ Paid after admission is confirmed
                </div>
              </div>

              {/* Card 03: After JW202/JW201 */}
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 relative flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {finalPayment.step}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      Visa Stage
                    </span>
                  </div>
                  <h5 className="text-lg font-bold text-[#18151B] mt-2 mb-1">
                    {finalPayment.label}
                  </h5>
                  <div className="text-2xl font-extrabold text-emerald-800 tabular-nums mb-2">
                    ${finalPayment.usd} USD
                  </div>
                  <p className="text-xs text-[#575260] leading-relaxed mb-4">
                    {finalPayment.timing}
                  </p>
                </div>
                <div className="pt-3 border-t border-emerald-200 text-[11px] font-semibold text-emerald-800">
                  ✓ Paid after the JW202/JW201 is received
                </div>
              </div>
            </div>

            {/* Total Summary Highlight */}
            <div className="p-4 rounded-2xl bg-white border-2 border-neutral-300 text-center shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between px-6 gap-3">
              <div className="text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#575260]">
                  Full Program Advisory & Visa Representation
                </span>
                <p className="text-xs text-[#575260]">
                  All three milestone stages combined ($515 + $858 + $1,716)
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-[#18151B]">
                  TOTAL SERVICE FEES: ${total.usd.toLocaleString()} USD
                </div>
              </div>
            </div>

            {/* Trust & Guarantee points */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#575260]">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Safe Staged Milestones:</strong> You never pay for unearned milestones. Each stage requires verified delivery.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
                <span>
                  <strong>Conditional Refund Protection:</strong> Initial deposit is fully protected if verified minimum criteria cannot secure admission.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#6C3B9E] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Hidden Retainers:</strong> Transparent USD fee structure with zero added markups.
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onOpenRefundPolicy}
                className="text-xs text-[#6D1838] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Read our full Refund Policy and Payment Terms
              </button>
            </div>
          </div>
        </div>

        {/* ================= SEPARATED INFORMATIONAL SECTION: ADDITIONAL INSTITUTION DEPOSIT ================= */}
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-3xl border border-amber-200/90 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-b border-amber-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-1">
                  <span>{institutionDepositNotice.badge}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18151B]">
                  {institutionDepositNotice.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#575260] mt-0.5">
                  "{institutionDepositNotice.subtitle}"
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-[#18151B] leading-relaxed">
              <p className="font-medium text-[#18151B]">
                "{institutionDepositNotice.statement}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Program Type variation */}
              <div className="p-5 rounded-2xl bg-[#FAF7F9] border border-neutral-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18151B]">
                  <GraduationCap className="w-4 h-4 text-[#6D1838]" />
                  <span>Program Type Variation</span>
                </div>
                <p className="text-xs text-[#575260] leading-relaxed">
                  The treatment of such deposits can vary depending on the program structure, including:
                </p>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs">
                    <strong className="text-[#18151B] block mb-0.5">Self-Support Programs:</strong>
                    <span className="text-[#575260]">
                      Some host institutions may request a place confirmation deposit prior to issuing official visa documentation. Where applicable, this deposit may be deducted from tuition or accommodation fees depending on the institution and program.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs">
                    <strong className="text-[#18151B] block mb-0.5">Partial Scholarship / Partial Support Programs:</strong>
                    <span className="text-[#575260]">
                      A confirmation deposit may be requested by certain faculties to retain scholarship quota allocation.
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#575260] italic">
                  Do not assume that the same payment rules apply to every program.
                </p>
              </div>

              {/* Deduction & Conditions notes */}
              <div className="p-5 rounded-2xl bg-[#FAF7F9] border border-neutral-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18151B] mb-2">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>Important Deduction & Policy Rules</span>
                  </div>
                  <p className="text-xs text-[#575260] leading-relaxed mb-3">
                    <strong>Separate from Study In China service fees:</strong> {institutionDepositNotice.deductionNote}
                  </p>
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1.5 text-xs text-[#575260]">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      Policy Reminder
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#575260]">
                      {institutionDepositNotice.disclaimer}
                    </p>
                    <p className="text-[11px] leading-relaxed text-[#575260]">
                      Study In China never guarantees admission, refund, seat reservation, or tuition credit unless explicitly confirmed by the institution.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-neutral-400 font-medium">
                  The applicable amount, purpose, deadline, refundability and deduction conditions are determined by the institution.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
