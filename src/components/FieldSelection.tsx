import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface FieldSelectionProps {
  onSelectField: (field: string) => void;
}

interface FieldItem {
  number: string;
  id: string;
  name: string;
  category: string;
  tagline: string;
  popularSpecialties: string[];
  degrees: string[];
  image: string;
}

export const FieldSelection: React.FC<FieldSelectionProps> = ({ onSelectField }) => {
  const [hoveredFieldId, setHoveredFieldId] = useState<string>('cs-it');

  const fields: FieldItem[] = [
    {
      number: '01',
      id: 'cs-it',
      name: 'Computer Science & IT',
      category: 'Technology & Computing',
      tagline: 'Artificial Intelligence, Software Engineering, Big Data & Cybersecurity',
      popularSpecialties: ['Artificial Intelligence', 'Data Science', 'Software Systems', 'Cybersecurity'],
      degrees: ['Bachelor', 'Master', 'PhD'],
      image: '/images/campus_academics_lab_1790254527844.jpg',
    },
    {
      number: '02',
      id: 'business-econ',
      name: 'Business & Economics',
      category: 'Commerce & Strategy',
      tagline: 'International Business, Finance, MBA, Supply Chain & E-Commerce',
      popularSpecialties: ['International Trade', 'Applied Finance', 'Global MBA', 'Digital Economy'],
      degrees: ['Bachelor', 'Master', 'PhD'],
      image: '/images/editorial_seminar_students_1790258417736.jpg',
    },
    {
      number: '03',
      id: 'engineering',
      name: 'Engineering & Technology',
      category: 'Applied Sciences',
      tagline: 'Civil, Mechanical, Electrical, Robotics & Advanced Materials',
      popularSpecialties: ['Smart Manufacturing', 'Civil Infrastructure', 'Mechatronics', 'Nanotechnology'],
      degrees: ['Bachelor', 'Master', 'PhD'],
      image: '/images/hero_china_students_1790254510954.jpg',
    },
    {
      number: '04',
      id: 'medicine-health',
      name: 'Medicine & Health Sciences',
      category: 'Clinical & Biomedical',
      tagline: 'English-medium MBBS, Clinical Medicine, Pharmacology & Public Health',
      popularSpecialties: ['MBBS (Clinical Medicine)', 'Pharmacology', 'Biomedical Science', 'Global Public Health'],
      degrees: ['Bachelor', 'Master', 'PhD'],
      image: '/images/student_culture_campus_1790254540697.jpg',
    },
    {
      number: '05',
      id: 'architecture-design',
      name: 'Architecture & Design',
      category: 'Built Environment',
      tagline: 'Urban Planning, Sustainable Architecture, Industrial & Digital Design',
      popularSpecialties: ['Urban Regenerative Design', 'Landscape Architecture', 'Computational Design', 'Interior Architecture'],
      degrees: ['Bachelor', 'Master'],
      image: '/images/editorial_campus_quad_1790258428891.jpg',
    },
    {
      number: '06',
      id: 'law-social',
      name: 'Law & Social Sciences',
      category: 'Governance & Global Affairs',
      tagline: 'International Relations, Diplomacy, Comparative Law & Public Policy',
      popularSpecialties: ['Global Diplomacy', 'International Trade Law', 'China Studies', 'Public Governance'],
      degrees: ['Bachelor', 'Master', 'PhD'],
      image: '/images/china_arrival_cityscape_1790254554482.jpg',
    },
    {
      number: '07',
      id: 'languages-humanities',
      name: 'Languages & Humanities',
      category: 'Culture & Linguistics',
      tagline: 'Intensive Chinese Language (HSK 1-6), Translation & Cultural Studies',
      popularSpecialties: ['Mandarin Immersion', 'Business Chinese', 'Applied Linguistics', 'Intercultural Communication'],
      degrees: ['Non-Degree Language', 'Bachelor', 'Master'],
      image: '/images/student_culture_campus_1790254540697.jpg',
    },
    {
      number: '08',
      id: 'other-fields',
      name: 'Natural Sciences & Environment',
      category: 'Research Disciplines',
      tagline: 'Renewable Energy, Environmental Science, Mathematics & Physics',
      popularSpecialties: ['Green Energy Technology', 'Marine Science', 'Applied Mathematics', 'Atmospheric Physics'],
      degrees: ['Bachelor', 'Master', 'PhD'],
      image: '/images/campus_academics_lab_1790254527844.jpg',
    },
  ];

  const activeField = fields.find((f) => f.id === hoveredFieldId) || fields[0];

  return (
    <section id="fields" className="py-24 sm:py-32 bg-[#FAF7F9] border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
              <span className="editorial-label text-[#6D1838]">
                Academic Field Exploration
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#18151B] leading-[1.08]">
              What Do You Want<br />
              to Study?
            </h2>
            <p className="text-base sm:text-lg text-[#575260] font-normal leading-relaxed pt-1">
              Select your discipline first. Our advisory team will guide you through English-taught degree curricula, scholarship opportunities, and admission requirements.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto text-xs text-[#575260] bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#6D1838]" />
            <span>
              <strong>Program-First Approach:</strong> Discover degree options matching your career goals. We handle the appropriate institution matching and application processing.
            </span>
          </div>
        </div>

        {/* Editorial Field Rows & Interactive Showcase */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Numbered Editorial Field List */}
          <div className="lg:col-span-7 divide-y divide-neutral-200/80 border-y border-neutral-200/80">
            {fields.map((field) => {
              const isHovered = field.id === hoveredFieldId;
              return (
                <div
                  key={field.id}
                  onMouseEnter={() => setHoveredFieldId(field.id)}
                  onClick={() => onSelectField(field.name)}
                  className={`group py-5 sm:py-6 px-3 sm:px-4 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${
                    isHovered
                      ? 'bg-white rounded-xl shadow-xs border-l-4 border-l-[#6D1838]'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                    <span
                      className={`text-sm sm:text-base font-mono font-bold transition-colors tabular-nums mt-0.5 sm:mt-0 ${
                        isHovered ? 'text-[#6D1838]' : 'text-neutral-400'
                      }`}
                    >
                      {field.number}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                            isHovered ? 'text-[#6D1838]' : 'text-[#18151B]'
                          }`}
                        >
                          {field.name}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-[#575260] font-normal truncate max-w-md mt-0.5">
                        {field.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isHovered
                          ? 'bg-[#6D1838] text-white translate-x-1 shadow-2xs'
                          : 'bg-neutral-100 text-neutral-400 group-hover:text-neutral-700'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Preview Card with Visual Reveal */}
          <div className="lg:col-span-5 sticky top-28 hidden lg:block">
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-md overflow-hidden transition-all duration-300">
              {/* Image Preview */}
              <div className="relative h-60 overflow-hidden bg-neutral-900">
                <img
                  src={activeField.image}
                  alt={activeField.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#6D1838] tracking-wider uppercase">
                    {activeField.category}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-mono text-white/80 mb-0.5">
                    Field {activeField.number} · {activeField.category}
                  </div>
                  <h4 className="text-xl font-bold tracking-tight text-white leading-snug">
                    {activeField.name}
                  </h4>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5">
                <div>
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Popular Degree Specializations
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {activeField.popularSpecialties.map((spec, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-xs font-medium text-[#18151B] flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6D1838] shrink-0" />
                        <span className="truncate">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-[#575260]">
                  <div>
                    <span className="block text-[11px] text-neutral-400">Available Degrees</span>
                    <strong className="text-[#18151B]">{activeField.degrees.join(' · ')}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-neutral-400">Language Mediums</span>
                    <strong className="text-[#6D1838]">English & Chinese</strong>
                  </div>
                </div>

                <button
                  onClick={() => onSelectField(activeField.name)}
                  className="w-full py-3 px-4 bg-[#6D1838] hover:bg-[#58122c] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group"
                >
                  <span>Explore {activeField.name} Programs</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
