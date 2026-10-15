import React from 'react';
import { ShieldCheck, FileCheck, Landmark, HeartHandshake } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const pillars = [
    {
      icon: Landmark,
      title: 'Accredited Academic Faculties',
      description: 'Direct admissions pathways across key accredited national higher education faculties in China.',
    },
    {
      icon: FileCheck,
      title: 'Official JW202 / JW201 Clearance',
      description: 'Authorized government visa documentation processed through official provincial education bureaus.',
    },
    {
      icon: ShieldCheck,
      title: 'Milestone Fee Protection',
      description: 'Transparent 3-stage payment plan. Initial deposit only; remaining fees due as milestones are delivered.',
    },
    {
      icon: HeartHandshake,
      title: 'End-to-End Candidate Care',
      description: 'From dossier formulation and scholarship strategy to consular preparation and campus arrival onboarding.',
    },
  ];

  return (
    <section className="py-12 sm:py-14 bg-white border-b border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-neutral-200/80">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="lg:px-8 first:lg:pl-0 last:lg:pr-0 flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF2F5] border border-[#EAD5DE] flex items-center justify-center text-[#6D1838] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#18151B] tracking-tight">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs text-[#575260] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
