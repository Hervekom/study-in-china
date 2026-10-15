import React from 'react';
import { Target, Compass, Users, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-[#FAF7F9] border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
            <span>About {siteConfig.brandName}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18151B]">
            Empowering International Students in China
          </h2>
          <p className="mt-3 text-base text-[#575260] leading-relaxed">
            We are dedicated education consultants committed to making higher education in China accessible, straightforward, and secure through honest guidance and fixed, transparent fees.
          </p>
        </div>

        {/* 2-Column Story: Who We Are & Our Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF2F5] border border-[#EAD5DE] flex items-center justify-center text-[#6D1838]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#18151B]">Who We Are</h3>
            <p className="text-sm text-[#575260] leading-relaxed">
              {siteConfig.brandName} was established by experienced international alumni and higher education advisors based in China. Having experienced the complexities of foreign admission portals, JW202 government documentation, and embassy interviews ourselves, we created a streamlined pathway for international applicants worldwide.
            </p>
            <p className="text-sm text-[#575260] leading-relaxed">
              We bridge the communication gap between overseas applicants and institutional admissions boards, ensuring dossiers are accurate, compliant, and submitted ahead of competitive deadlines.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F8F5FD] border border-[#E5D6F7] flex items-center justify-center text-[#6C3B9E]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#18151B]">Our Mission</h3>
            <p className="text-sm text-[#575260] leading-relaxed">
              Our mission is to eliminate predatory education agency practices by instituting complete pricing transparency and academic integrity. We believe qualified students from any country deserve access to accredited degree curricula without hidden retainers or confusing fee tiers.
            </p>
            <p className="text-sm text-[#575260] leading-relaxed">
              Every applicant receives equal dedication, comprehensive credential evaluations, and hands-on guidance from initial program discovery until day one on campus.
            </p>
          </div>
        </div>

        {/* Why Choose Us: 4 Core Pillars */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#18151B]">
              Why Students Trust {siteConfig.brandName}
            </h3>
            <p className="text-xs sm:text-sm text-[#575260] mt-1">
              Guiding principles behind our dedicated admissions and visa support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 text-left space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#6D1838]" />
              <h4 className="font-bold text-base text-[#18151B]">Milestone Billing</h4>
              <p className="text-xs text-[#575260] leading-relaxed">
                You only pay the $1,716 USD final milestone after official admission and JW202/JW201 government forms are formally delivered.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 text-left space-y-2">
              <Users className="w-8 h-8 text-[#6C3B9E]" />
              <h4 className="font-bold text-base text-[#18151B]">Direct Institutional Liaison</h4>
              <p className="text-xs text-[#575260] leading-relaxed">
                Direct contacts with international colleges across Beijing, Shanghai, Hangzhou, and Wuhan expedite document inquiries and interview scheduling.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 text-left space-y-2">
              <Award className="w-8 h-8 text-amber-600" />
              <h4 className="font-bold text-base text-[#18151B]">Scholarship Strategy</h4>
              <p className="text-xs text-[#575260] leading-relaxed">
                In-depth familiarity with CSC Type A, Type B, and provincial grant selection metrics to maximize your funding eligibility.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 text-left space-y-2">
              <HeartHandshake className="w-8 h-8 text-emerald-600" />
              <h4 className="font-bold text-base text-[#18151B]">Arrival Onboarding</h4>
              <p className="text-xs text-[#575260] leading-relaxed">
                Assistance doesn't end at visa issuance; we support your mobile SIM card, Alipay setup, dormitory check-in, and local registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
