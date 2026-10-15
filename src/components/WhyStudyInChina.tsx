import React from 'react';
import { ArrowRight } from 'lucide-react';

export const WhyStudyInChina: React.FC = () => {
  const pillars = [
    {
      index: '01',
      title: 'World-Class Academic Excellence',
      description: 'Study at globally accredited higher education institutions — pioneering research, AI, engineering, medicine, and international trade.',
    },
    {
      index: '02',
      title: 'Accessible Tuition Structure',
      description: 'Higher education tuition structured to represent exceptional value compared to Western institutions without compromise on academic rigor or research quality.',
    },
    {
      index: '03',
      title: 'Comprehensive Scholarships',
      description: 'Extensive Chinese Government (CSC), municipal, and institutional scholarships provide full tuition waivers, free campus housing, and monthly living stipends.',
    },
    {
      index: '04',
      title: 'Modern Campuses & Facilities',
      description: 'Supercomputing clusters, advanced biomedical laboratories, high-speed rail connections, smart libraries, and modern international student residences.',
    },
    {
      index: '05',
      title: 'Diverse Global Student Cohort',
      description: 'An international student community representing diverse global backgrounds studies across accredited English-taught degree tracks, creating lifelong global networks.',
    },
    {
      index: '06',
      title: 'Unmatched Career Trajectory',
      description: 'Direct exposure to the world\'s second-largest economy, Mandarin language fluency, and privileged access to global multinational firms across Asia.',
    },
  ];

  return (
    <section id="study-in-china" className="relative py-24 sm:py-32 bg-[#FCFAFC] border-b border-neutral-200/70">
      <div id="why-china" className="absolute -top-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16 sm:mb-20">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
              <span className="editorial-label text-[#6D1838]">
                Academic Distinction & Global Reach
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#18151B] leading-[1.12]">
              Why Study in China?
            </h2>
            <p className="text-base sm:text-lg text-[#575260] leading-relaxed max-w-2xl font-normal pt-1">
              China combines academic prestige, accelerated technological innovation, and world-class research infrastructure with tuition and living costs accessible to international scholars.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right hidden lg:block">
            <span className="text-xs font-medium text-neutral-400">
              Key Academic Advantages
            </span>
          </div>
        </div>

        {/* Visual & Editorial Feature Composition */}
        <div className="grid lg:grid-cols-12 gap-10 items-start mb-14">
          {/* Featured Large Architectural Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-xs">
              <img
                src="/images/editorial_campus_quad_1790258428891.jpg"
                alt="Contemporary campus quadrangle and architectural library"
                referrerPolicy="no-referrer"
                className="w-full h-[460px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="editorial-label text-white/90 mb-1">Campus Life & Architecture</div>
                <p className="text-sm font-medium text-white leading-snug">
                  Historic campuses blended with state-of-the-art technological facilities.
                </p>
              </div>
            </div>
          </div>

          {/* Pillars List */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.index}
                className="pt-4 border-t border-neutral-200/80 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6D1838] tracking-wider tabular-nums">
                    {pillar.index}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    Core Advantage
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#18151B] group-hover:text-[#6D1838] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#575260] leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

