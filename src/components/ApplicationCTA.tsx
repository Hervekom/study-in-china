import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { siteConfig, pricing } from '../data/siteConfig';
import { getUpcomingIntakes } from '../utils/intakeUtils';

interface ApplicationCTAProps {
  onStartApplication: () => void;
  variant?: 'bordeaux' | 'subtle';
  headline?: string;
  subtext?: string;
}

export const ApplicationCTA: React.FC<ApplicationCTAProps> = ({
  onStartApplication,
  variant = 'bordeaux',
  headline = 'Ready to Start Your China Journey?',
  subtext = 'Take the first step toward studying in China with program-first admissions guidance and verified JW202 visa support.',
}) => {
  const upcomingIntakes = getUpcomingIntakes();
  const intakesSummary = upcomingIntakes.map(i => i.label).join(' & ');
  if (variant === 'subtle') {
    return (
      <section className="py-16 bg-[#FAF7F9] border-y border-neutral-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#6D1838]">
            Admissions Intake Open
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18151B]">
            {headline}
          </h2>
          <p className="text-sm text-[#575260] max-w-2xl mx-auto leading-relaxed">
            {subtext}
          </p>
          <div className="pt-2">
            <button
              onClick={onStartApplication}
              className="px-8 py-3.5 bg-[#6D1838] hover:bg-[#58122c] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mx-auto"
            >
              <span>Start Your Application (${pricing.depositUSD} Deposit)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#6D1838] text-white overflow-hidden shadow-2xl p-8 sm:p-14">
          {/* Subtle geometric pattern glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#6C3B9E]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#4A1028]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Upcoming Academic Intakes: {intakesSummary}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {headline}
            </h2>

            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
              {subtext}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-white/90 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Transparent ${pricing.totalUSD.toLocaleString()} Total Pricing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Initial Deposit Only ${pricing.depositUSD} USD
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                JW202 / JW201 Visa Form Support
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onStartApplication}
                className="px-8 py-4 bg-white text-[#6D1838] hover:bg-neutral-100 active:bg-neutral-200 text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Start Your Application Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={siteConfig.contact.whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-[#6D1838]/80 hover:bg-[#6D1838] border border-white/30 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Ask a Question on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
