import React from 'react';
import { tr, useTr } from '../i18n/tr';
import { X, ShieldCheck, FileText, RefreshCw } from 'lucide-react';
import { pricing } from '../config/siteConfig';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: 'privacy' | 'terms' | 'refund' | null;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, policyType }) => {
  useTr();
  if (!isOpen || !policyType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-ink/[0.07]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-porcelain">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D1838]/10 flex items-center justify-center text-[#6D1838]">
              {policyType === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {policyType === 'terms' && <FileText className="w-5 h-5" />}
              {policyType === 'refund' && <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">
                {policyType === 'privacy' && tr("Privacy & Data Protection Policy")}
                {policyType === 'terms' && tr("Terms of Service & Application Protocol")}
                {policyType === 'refund' && tr("Fee Schedule & Refund Policy")}
              </h3>
              <p className="text-xs text-ink/65">{tr("Study In China Official Legal Information")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label={tr("Close modal")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-6 overflow-y-auto text-sm text-ink/65 leading-relaxed space-y-4">
          {policyType === 'privacy' && (
            <>
              <p>{tr("At Study In China, we respect and safeguard the personal and academic documentation of all prospective international students. This Privacy Policy details our handling of passport copies, academic transcripts, and personal contact channels.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("1. Collection of Application Records")}</h4>
              <p>{tr("We exclusively collect documents required by accredited higher education admissions directorates and municipal education bureaus in China. This encompasses your identification, academic qualifications, study plans, and health examinations.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("2. Secure Transmission to Admissions")}</h4>
              <p>{tr("Your documentation is submitted directly into accredited institutional portals and government immigration channels. We never sell, lease, or monetize applicant records to third-party marketing entities.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("3. Data Retention and Erasure")}</h4>
              <p>
                Upon enrollment and visa completion, students may request permanent archival or secure deletion of non-regulatory files by contacting privacy@studyinchina.com.
              </p>
            </>
          )}

          {policyType === 'terms' && (
            <>
              <p>{tr("By enrolling in the Study In China advisory pathway, you agree to these transparent engagement standards designed to ensure accurate submission and high admission success.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("1. Scope of Representation")}</h4>
              <p>{tr("Study In China acts as your professional international education advisor, guiding program selection, application dossier formulation, submission follow-up, admission notice collection, and JW202/JW201 government verification.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("2. Applicant Authenticity")}</h4>
              <p>{tr("The student affirms that all submitted academic transcripts, diplomas, and identity documents are authentic. Forged credentials result in immediate termination of support and reporting to educational and consular authorities.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("3. Consular and Visa Autonomy")}</h4>
              <p>{tr("While Study In China provides full document verification and interview coaching, final visa issuance remains the sovereign authority of the Chinese Embassy or Consulate.")}</p>
            </>
          )}

          {policyType === 'refund' && (
            <>
              <p className="font-medium text-ink">{tr("Our pricing model is built on mutual accountability and complete transparency. Total service fee: $")}{pricing.total.usd.toLocaleString()}{' '}{tr("USD.")}</p>
              <div className="p-4 bg-[#F8F5FD] border border-[#E5D6F7] rounded-xl my-2 text-xs space-y-3">
                <div className="flex justify-between font-semibold text-ink">
                  <span>{tr("1. Initial Deposit:")}</span>
                  <span>${pricing.initialDeposit.usd}{' '}{tr("USD")}</span>
                </div>
                <p className="text-ink/65">{tr("Paid before application/document processing begins. Covers dossier evaluation, program matching strategy, document formatting, and initiating official applications.")}</p>

                <div className="flex justify-between font-semibold text-ink pt-2 border-t border-purple-200">
                  <span>{tr("2. Admission Payment:")}</span>
                  <span>${pricing.admissionPayment.usd}{' '}{tr("USD")}</span>
                </div>
                <p className="text-ink/65">{tr("Paid after official admission is confirmed by the academic faculty.")}</p>

                <div className="flex justify-between font-semibold text-ink pt-2 border-t border-purple-200">
                  <span>{tr("3. Final Payment:")}</span>
                  <span>${pricing.finalPayment.usd.toLocaleString()}{' '}{tr("USD")}</span>
                </div>
                <p className="text-ink/65">{tr("Paid after the official JW202/JW201 government visa authorization document is received.")}</p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-ink space-y-1">
                <span className="font-bold text-amber-900 block">{tr("Separate Institution Deposit Clarification")}</span>
                <p className="text-ink/65">{tr("Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees. Depending on the institution and program, it may be deducted from tuition or accommodation costs. The applicable amount and conditions are determined by the institution.")}</p>
              </div>

              <h4 className="font-semibold text-ink text-base pt-2">{tr("Conditional Refund Protection")}</h4>
              <p>{tr("If an applicant meets the minimum academic admission requirements verified during our initial audit, yet fails to receive an official admission offer across all agreed academic program applications, the $")}{pricing.initialDeposit.usd}{' '}{tr("USD initial deposit is refunded in full.")}</p>
              <h4 className="font-semibold text-ink text-base pt-2">{tr("Non-Refundable Circumstances")}</h4>
              <p>{tr("Deposit is non-refundable if the applicant intentionally abandons their application, provides falsified academic records, or fails to furnish required health/police clearance documents requested by the admissions committee.")}</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-porcelain flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-full transition-colors shadow-sm"
          >{tr("I Understand")}</button>
        </div>
      </div>
    </div>
  );
};
