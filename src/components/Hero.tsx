import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { siteConfig, pricing } from '../data/siteConfig';
import { getUpcomingIntakes } from '../utils/intakeUtils';
import { useSiteContent } from '../context/SiteContentContext';

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
  const { content: siteContent } = useSiteContent();
  const slides = siteContent.hero.slides;
  const [activeSlide, setActiveSlide] = React.useState(0);
  const current = slides[Math.min(activeSlide, slides.length - 1)] || slides[0];

  React.useEffect(() => {
    if (slides.length < 2) return;
    const ms = Math.max(3, siteContent.hero.autoplaySeconds || 6) * 1000;
    const t = setInterval(() => setActiveSlide(i => (i + 1) % slides.length), ms);
    return () => clearInterval(t);
  }, [slides.length, siteContent.hero.autoplaySeconds]);
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
                {siteContent.hero.kicker}
              </span>
              <span className="text-neutral-300">/</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FAF2F5] border border-[#EAD5DE] text-xs font-semibold text-[#6D1838]">
                <Calendar className="w-3 h-3" />
                <span>Upcoming Intakes: {intakesSummary}</span>
              </div>
            </div>

            {/* Controlled Line Break Editorial Display Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.035em] text-[#18151B] leading-[1.06]">
              {siteContent.hero.titleLine1}<br />
              {siteContent.hero.titleLine2}<br />
              <span className="text-[#6D1838]">{siteContent.hero.titleHighlight}</span>
            </h1>

            {/* Editorial Body Text */}
            <p className="text-base sm:text-lg text-[#575260] leading-relaxed max-w-xl font-normal">
              {siteContent.hero.subtitle}
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
                <span>{siteContent.hero.primaryCta}</span>
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
            <div className="relative rounded-lg overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-sm group h-[340px] sm:h-[480px]">
              {slides.map((slide, i) => (
                <img
                  key={`${slide.image}-${i}`}
                  src={slide.image}
                  alt={slide.caption || 'International students in China'}
                  referrerPolicy="no-referrer"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}

              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Bottom Editorial Caption */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-white/80 pb-1.5 border-b border-white/15 mb-2">
                  <span className="editorial-label text-white tracking-widest">
                    {current.label}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/90 whitespace-nowrap">
                    <MapPin className="w-3 h-3 text-[#E5D6F7]" /> Beijing · Shanghai · Hangzhou
                  </span>
                </div>
                <p className="text-sm font-medium text-white leading-snug min-h-[2.5em]">
                  {current.caption}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-white/80">
                  <span>Accessible Tuition Structure</span>
                  {slides.length > 1 ? (
                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          aria-label={`Show image ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${i === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="font-semibold text-[#F3EEFA]">CSC Scholarships Available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

