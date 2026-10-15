import React from 'react';
import { ArrowRight, Sparkles, Compass, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle, Calendar } from 'lucide-react';
import { getUpcomingIntakes } from '../utils/intakeUtils';

interface StudyPreferencesSectionProps {
  onStartApplication: () => void;
  onHowItWorks?: () => void;
}

export const StudyPreferencesSection: React.FC<StudyPreferencesSectionProps> = ({
  onStartApplication,
  onHowItWorks,
}) => {
  const upcomingIntakes = getUpcomingIntakes();

  const handleScrollToHowItWorks = () => {
    if (onHowItWorks) {
      onHowItWorks();
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const choices = [
    {
      step: '01',
      title: 'First Choice',
      role: 'Primary Preference',
      badge: 'Highest Priority',
      description: 'Your preferred study option. We prioritize evaluating matching programs and top scholarship allotments for this program first.',
      badgeColor: 'bg-[#6D1838] text-white',
    },
    {
      step: '02',
      title: 'Second Choice',
      role: 'Alternative Option',
      badge: 'Secondary Priority',
      description: 'Your alternative study path if your primary option is unavailable, quotas are filled, or a more favorable scholarship is secured here.',
      badgeColor: 'bg-[#6C3B9E] text-white',
    },
    {
      step: '03',
      title: 'Third Choice',
      role: 'Backup Option',
      badge: 'Contingency Priority',
      description: 'Your dependable academic backup to ensure you secure verified admission and visa eligibility for your targeted intake season.',
      badgeColor: 'bg-neutral-800 text-white',
    },
  ];

  return (
    <section id="study-preferences" className="py-20 sm:py-28 bg-[#FCFAFC] border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Editorial Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
              Preference-Based Application Model
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18151B] tracking-tight">
            Tell Us What You Want to Study
          </h2>

          <p className="text-base sm:text-lg text-[#575260] leading-relaxed">
            Choose up to three study preferences and let our team evaluate the opportunities that best match your academic profile and scholarship goals.
          </p>

          {/* Dynamic Upcoming Intakes */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#575260] flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#6D1838]" /> Upcoming Intakes:
            </span>
            {upcomingIntakes.map((intake) => (
              <span
                key={intake.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF2F5] text-[#6D1838] border border-[#EAD5DE]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
                {intake.label} ({intake.season})
              </span>
            ))}
          </div>
        </div>

        {/* 3 Choices Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {choices.map((choice, index) => (
            <div
              key={choice.step}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 shadow-xs relative flex flex-col justify-between transition-all hover:border-[#6D1838]/40 hover:shadow-md"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-2xl font-black text-[#6D1838]/80">
                      {choice.step}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-[#18151B]">{choice.title}</h3>
                      <span className="text-xs text-[#575260] font-medium">{choice.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${choice.badgeColor}`}>
                    {choice.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#575260] leading-relaxed mb-6">
                  {choice.description}
                </p>
              </div>

              {/* Priority Indicator */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-[#575260]">
                <span className="font-semibold text-[#18151B]">Evaluation Order:</span>
                <span className="font-mono font-bold text-[#6D1838]">
                  {index === 0 ? 'Evaluated 1st' : index === 1 ? 'Evaluated 2nd' : 'Evaluated 3rd'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* "How We Use Your Choices" Informational Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-100">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#6D1838]" />
                <h3 className="text-lg sm:text-xl font-bold text-[#18151B]">
                  How We Use Your Choices
                </h3>
              </div>
              <p className="text-sm sm:text-base text-[#575260] leading-relaxed">
                Your three choices help us evaluate different opportunities for your profile. If your first choice is unavailable, unsuitable, or does not provide a favorable scholarship opportunity, we can evaluate your second choice. If necessary, we can then consider your third choice.
              </p>
              <p className="text-sm font-semibold text-[#6D1838]">
                Our goal is to help you find the most suitable available study opportunity while maximizing your scholarship potential.
              </p>
            </div>

            {/* Transparent Evaluation Criteria Badges */}
            <div className="bg-[#FAF2F5] border border-[#EAD5DE] rounded-xl p-5 shrink-0 max-w-sm space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838] block">
                Evaluation Criteria
              </span>
              <ul className="text-xs text-[#575260] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
                  <span>Program availability & intake quotas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
                  <span>Applicant eligibility & academic background</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
                  <span>Scholarship eligibility & funding coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
                  <span>Language of instruction & profile alignment</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#575260]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Transparent and realistic admissions assessment — no institutional locking before profile review.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleScrollToHowItWorks}
                className="px-5 py-3 text-xs sm:text-sm font-bold text-[#18151B] bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={onStartApplication}
                className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Start Your Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
