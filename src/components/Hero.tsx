import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { siteConfig, pricing } from '../data/siteConfig';
import { getUpcomingIntakes } from '../utils/intakeUtils';

interface HeroProps {
  onStartApplication: () => void;
  onExplorePrograms?: () => void;
  onHowItWorks?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartApplication,
  onExplorePrograms,
  onHowItWorks,
}) => {
  const upcomingIntakes = getUpcomingIntakes();
  const intakesSummary = upcomingIntakes.map(i => i.label).join(' · ');

  const handleSecondaryAction = () => {
    if (onHowItWorks) {
      onHowItWorks();
    } else if (onExplorePrograms) {
      onExplorePrograms();
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section
      id="home"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#FCFAFC] border-b border-neutral-200/60 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Value Proposition & Actions */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Editorial Kicker */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
              <span className="editorial-label text-[#6D1838]">
                International Education Advisory
              </span>
              <span className="text-neutral-300">/</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FAF2F5] border border-[#EAD5DE] text-xs font-semibold text-[#6D1838]">
                <Calendar className="w-3 h-3" />
                <span>Upcoming Intakes: {intakesSummary}</span>
              </div>
            </div>

            {/* Controlled Line Break Editorial Display Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.035em] text-[#18151B] leading-[1.06]">
              Your Journey<br />
              to Study in China<br />
              <span className="text-[#6D1838]">Starts Here.</span>
            </h1>

            {/* Editorial Body Text */}
            <p className="text-base sm:text-lg text-[#575260] leading-relaxed max-w-xl font-normal">
              Direct admission pathways to accredited English-taught degree tracks across China. Complete support from field matching to JW202 visa clearance, with guaranteed pricing transparency.
            </p>

            {/* Trust Assurance Line */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-1 text-xs text-[#575260]">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6D1838]" />
                <span className="font-medium text-[#18151B]">Key National Faculties</span>
                <span className="text-neutral-400">Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6C3B9E]" />
                <span className="font-medium text-[#18151B]">Official JW202 / JW201</span>
                <span className="text-neutral-400">Visa Papers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-600" />
                <span className="font-medium text-[#18151B]">Zero Hidden Fees</span>
                <span className="text-neutral-400">Guaranteed</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartApplication}
                className="group px-7 py-3.5 text-sm font-semibold text-white bg-[#6D1838] hover:bg-[#58122c] active:bg-[#4A1028] rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2.5 whitespace-nowrap"
              >
                <span>Start Your Application</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={handleSecondaryAction}
                className="px-6 py-3.5 text-sm font-semibold text-[#18151B] bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300/80 rounded-lg transition-all duration-200 shadow-xs flex items-center justify-center gap-2"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Transparent Fee Footnote */}
            <div className="pt-2 border-t border-neutral-200/70 flex items-start gap-2.5 text-xs text-[#575260] max-w-lg">
              <ShieldCheck className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
              <p className="leading-normal">
                <strong className="text-[#18151B] font-semibold">Structured 3-Stage Milestone Pricing:</strong> ${pricing.totalUSD.toLocaleString()} total USD fee. Only ${pricing.depositUSD} initial deposit to begin file evaluation; ${pricing.admissionPaymentUSD} after admission is confirmed, and ${pricing.finalPaymentUSD.toLocaleString()} after the JW202/JW201 is received.
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-sm group">
              <img
                src="/images/hero_china_students_1790254510954.jpg"
                alt="International scholars studying in China"
                referrerPolicy="no-referrer"
                className="w-full h-[400px] sm:h-[480px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
              />
              
              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Bottom Editorial Caption */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <div className="flex items-center justify-between text-xs text-white/80 pb-1.5 border-b border-white/15 mb-2">
                  <span className="editorial-label text-white tracking-widest">
                    Academic Excellence
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/90">
                    <MapPin className="w-3 h-3 text-[#E5D6F7]" /> Beijing · Shanghai · Hangzhou
                  </span>
                </div>
                <p className="text-sm font-medium text-white leading-snug">
                  English-Taught Bachelor's, Master's, PhD & Language Programs
                </p>
                <div className="mt-2.5 flex items-center justify-between text-xs text-white/80">
                  <span>Accessible Tuition Structure</span>
                  <span className="font-semibold text-[#F3EEFA]">CSC Scholarships Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

