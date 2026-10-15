import React from 'react';
import { ArrowRight, BookOpen, GraduationCap, Microscope, Languages, Award } from 'lucide-react';
import { DegreeLevel } from '../types';

interface StudyOptionsProps {
  onSelectDegree: (degree: DegreeLevel) => void;
  onExplorePrograms: () => void;
}

export const StudyOptions: React.FC<StudyOptionsProps> = ({
  onSelectDegree,
  onExplorePrograms,
}) => {
  const options = [
    {
      title: "Bachelor's Degree",
      degree: 'Bachelor' as DegreeLevel,
      duration: '4 – 6 Years',
      icon: GraduationCap,
      description: 'Undergraduate degrees taught in English and Chinese across Computer Science, MBBS Medicine, International Business, and Engineering.',
      tags: ['High School Diploma', 'English & Chinese Tracks', 'WHO MBBS Listed'],
      image: '/images/student_culture_campus_1790254540697.jpg',
    },
    {
      title: "Master's Degree",
      degree: 'Master' as DegreeLevel,
      duration: '2 – 3 Years',
      icon: BookOpen,
      description: 'Specialized postgraduate programs in Artificial Intelligence, MBA, Applied Economics, and Global Governance with active industry links.',
      tags: ['Bachelor Degree Holders', 'Thesis & Coursework', 'Scholarship Eligible'],
      image: '/images/editorial_seminar_students_1790258417736.jpg',
    },
    {
      title: 'Ph.D. & Doctoral Studies',
      degree: 'PhD' as DegreeLevel,
      duration: '3 – 4 Years',
      icon: Microscope,
      description: 'Advanced doctoral research in world-class laboratories with CSC full scholarship eligibility, faculty stipends, and international publication tracks.',
      tags: ['Master Degree Holders', 'Full CSC Stipend Eligible', 'Advanced Lab Access'],
      image: '/images/campus_academics_lab_1790254527844.jpg',
    },
    {
      title: 'Chinese Language Immersion',
      degree: 'Non-Degree Language' as DegreeLevel,
      duration: '1 Semester – 1 Year',
      icon: Languages,
      description: 'Intensive Mandarin immersion courses from complete beginner to HSK 6 fluency. Ideal standalone cultural experience or academic pathway preparatory year.',
      tags: ['All Educational Backgrounds', 'Zero Prior Chinese Required', 'Regular Cultural Excursions'],
      image: '/images/china_arrival_cityscape_1790254554482.jpg',
    },
  ];

  return (
    <section className="py-24 sm:py-30 bg-white border-b border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
              <span className="editorial-label text-[#6D1838]">
                Academic Catalogue
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#18151B]">
              Find Your Study Path
            </h2>
            <p className="text-base text-[#575260] max-w-xl font-normal">
              Select the degree track that matches your educational background and future international career objectives.
            </p>
          </div>

          <button
            onClick={onExplorePrograms}
            className="group self-start md:self-auto px-5 py-2.5 text-xs font-semibold text-[#18151B] hover:text-[#6D1838] bg-white hover:bg-neutral-50 border border-neutral-300/80 rounded-lg transition-all shadow-xs flex items-center gap-2"
          >
            <span>How It Works</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {options.map((opt) => (
            <div
              key={opt.title}
              className="bg-white rounded-lg border border-neutral-200/80 overflow-hidden shadow-xs hover:border-[#6D1838]/40 transition-all duration-200 flex flex-col group"
            >
              {/* Image header */}
              <div className="relative h-44 overflow-hidden bg-neutral-900">
                <img
                  src={opt.image}
                  alt={opt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#18151B] tabular-nums">
                  {opt.duration}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-semibold tracking-tight text-white">
                    {opt.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs text-[#575260] leading-relaxed mb-3">
                    {opt.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-neutral-100">
                    {opt.tags.map((t, idx) => (
                      <div key={idx} className="text-[11px] text-[#575260] flex items-center gap-1.5 font-normal">
                        <span className="w-1 h-1 rounded-full bg-[#6C3B9E]" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectDegree(opt.degree)}
                  className="group/btn w-full py-2.5 px-3 text-xs font-semibold text-[#6D1838] hover:text-white bg-[#FAF2F5] hover:bg-[#6D1838] rounded-lg transition-colors border border-[#EAD5DE] hover:border-[#6D1838] flex items-center justify-center gap-1.5"
                >
                  <span>Explore {opt.degree} Programs</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Scholarship Highlight Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-lg bg-[#FAF7F9] border border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#6D1838] text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#18151B]">
                Looking for Government & Full-Tuition Scholarships?
              </h4>
              <p className="text-xs sm:text-sm text-[#575260] mt-0.5">
                We assist qualified applicants with Chinese Government Scholarship (CSC), provincial grants, and institutional tuition waivers.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectDegree('Master')}
            className="group shrink-0 px-5 py-2.5 text-xs font-semibold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Check Scholarship Eligibility</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

