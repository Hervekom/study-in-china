import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Plus,
  Check,
  Award,
  MapPin,
  DollarSign,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { Program } from '../types';
import { programsData } from '../data/programs';
import { favoritesStorage } from '../data/favoritesStorage';

interface ProgramComparisonProps {
  onBackToHome: () => void;
  onApplyProgram: (progTitle: string, degree?: string) => void;
}

export const ProgramComparison: React.FC<ProgramComparisonProps> = ({
  onBackToHome,
  onApplyProgram,
}) => {
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [addSelectorOpen, setAddSelectorOpen] = useState(false);

  useEffect(() => {
    setComparedIds(favoritesStorage.getComparedPrograms());

    const handleUpdate = () => {
      setComparedIds(favoritesStorage.getComparedPrograms());
    };
    window.addEventListener('chinastudy_comparison_updated', handleUpdate);
    return () => window.removeEventListener('chinastudy_comparison_updated', handleUpdate);
  }, []);

  const comparedPrograms = programsData.filter((p) => comparedIds.includes(p.id));

  const handleRemove = (id: string) => {
    favoritesStorage.removeFromProgramComparison(id);
  };

  const handleAdd = (id: string) => {
    favoritesStorage.addToProgramComparison(id);
    setAddSelectorOpen(false);
  };

  const handleClearAll = () => {
    favoritesStorage.clearProgramComparison();
  };

  const availableToAdd = programsData.filter((p) => !comparedIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-[#18151B]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#6D1838] text-white font-bold text-xs flex items-center justify-center">
                CS
              </span>
              <span className="font-extrabold text-sm sm:text-base text-[#18151B]">
                Program Comparison Matrix
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedPrograms.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-600 rounded-lg text-xs font-semibold transition-colors"
              >
                Clear Matrix
              </button>
            )}
            {comparedPrograms.length < 3 && availableToAdd.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setAddSelectorOpen(!addSelectorOpen)}
                  className="px-3 py-1.5 bg-[#6D1838] hover:bg-[#58122c] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Program ({comparedPrograms.length}/3)</span>
                </button>

                {addSelectorOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                      Select Program to Compare
                    </div>
                    {availableToAdd.map((prog) => (
                      <button
                        key={prog.id}
                        onClick={() => handleAdd(prog.id)}
                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#FAF2F5] transition-colors border-b border-neutral-50 last:border-0"
                      >
                        <p className="font-bold text-[#18151B] line-clamp-1">{prog.title}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {prog.degree} · {prog.field} · {prog.city}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
            Academic Decision Support
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18151B] mt-1">
            Compare Academic Programs Side-by-Side
          </h1>
          <p className="text-xs sm:text-sm text-[#575260] mt-1 max-w-2xl">
            Evaluate degree level, instruction language, tuition ranges, curriculum structure, and scholarship availability across accredited programs.
          </p>
        </div>

        {comparedPrograms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-base text-[#18151B]">No Programs in Comparison Matrix</h3>
            <p className="text-xs text-[#575260] max-w-md mx-auto">
              Select programs from our catalogue to compare their tuition, duration, and scholarship availability.
            </p>
            <button
              onClick={() => {
                favoritesStorage.addToProgramComparison('prog-cs-bachelor-01');
                favoritesStorage.addToProgramComparison('prog-ai-master-01');
                favoritesStorage.addToProgramComparison('prog-mba-01');
              }}
              className="px-5 py-2.5 bg-[#6D1838] text-white rounded-xl text-xs font-bold hover:bg-[#58122c] transition-colors shadow-xs"
            >
              Load 3 Featured Programs
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#FAF7F9]">
                    <th className="p-4 w-1/4 text-xs font-bold uppercase tracking-wider text-[#575260]">
                      Metric / Criteria
                    </th>
                    {comparedPrograms.map((prog) => (
                      <th key={prog.id} className="p-4 w-1/4 align-top">
                        <div className="relative p-3.5 bg-white border border-neutral-200 rounded-xl shadow-xs space-y-2">
                          <button
                            onClick={() => handleRemove(prog.id)}
                            className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-rose-600 rounded-md"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-[#FAF2F5] text-[#6D1838] border border-[#EAD5DE] rounded font-bold text-[10px]">
                              {prog.degree}
                            </span>
                            <span className="text-[10px] font-semibold text-[#6C3B9E] bg-[#F3EEFA] px-1.5 py-0.5 rounded">
                              {prog.language}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#18151B] leading-snug pr-4">
                            {prog.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#6D1838]" /> {prog.city} Academic Hub
                          </p>
                          <button
                            onClick={() => onApplyProgram(prog.title, prog.degree)}
                            className="w-full py-2 bg-[#6D1838] hover:bg-[#58122c] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Apply Now</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <th key={`empty-${i}`} className="p-4 w-1/4 align-middle text-center">
                        <div className="p-6 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center space-y-2">
                          <Plus className="w-6 h-6 text-neutral-300" />
                          <span className="text-xs text-neutral-400">Empty Comparison Slot</span>
                          {availableToAdd.length > 0 && (
                            <button
                              onClick={() => setAddSelectorOpen(true)}
                              className="text-xs font-semibold text-[#6D1838] hover:underline"
                            >
                              + Add Program
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/80">
                  {/* Field of Study */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Field of Study</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 font-semibold text-[#18151B]">
                        {prog.field}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-field-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>

                  {/* Study Duration */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Study Duration</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 text-neutral-800">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{prog.durationYears}</span>
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-dur-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>

                  {/* Annual Tuition (USD) */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Annual Tuition (USD)</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 text-neutral-800">
                        <div className="font-extrabold text-sm text-[#18151B]">
                          ${prog.tuitionPerYearUSD.toLocaleString()} USD
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          ≈ ¥{prog.tuitionPerYearRMB.toLocaleString()} RMB / yr
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-tui-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>

                  {/* Scholarship Eligibility */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Scholarship Opportunities</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 text-neutral-800">
                        {prog.scholarshipEligible ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 font-bold text-[#6C3B9E] text-xs">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> CSC / Grants Eligible
                            </span>
                            <p className="text-[11px] text-neutral-500">
                              {prog.scholarshipCoverage}
                            </p>
                          </div>
                        ) : (
                          <span className="text-neutral-400">Self-funded track</span>
                        )}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-sch-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>

                  {/* Intake & Deadline */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Intake & Application Deadline</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 text-neutral-800">
                        <div className="font-semibold text-[#18151B]">{prog.intakeSeason}</div>
                        <div className="text-[11px] text-neutral-500">Deadline: {prog.applicationDeadline}</div>
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-intake-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>

                  {/* Academic Requirements */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Key Entry Criteria</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 text-neutral-800 space-y-1">
                        {prog.entryRequirements.map((req, idx) => (
                          <div key={idx} className="text-[11px] text-neutral-600 flex items-start gap-1">
                            <span className="text-[#6D1838]">•</span>
                            <span>{req}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-req-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>

                  {/* Curriculum Overview */}
                  <tr>
                    <td className="p-4 font-bold text-neutral-600 bg-neutral-50/50">Academic Focus</td>
                    {comparedPrograms.map((prog) => (
                      <td key={prog.id} className="p-4 text-[11px] text-neutral-600 leading-relaxed">
                        {prog.overview}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - comparedPrograms.length) }).map((_, i) => (
                      <td key={`empty-over-${i}`} className="p-4 text-neutral-300">—</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Assurance */}
            <div className="p-4 bg-[#FAF7F9] border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#575260]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6D1838]" />
                <span>
                  <strong>Admissions Assurance:</strong> All programs are accredited by the Ministry of Education with full JW202 visa eligibility.
                </span>
              </div>
              <button
                onClick={onBackToHome}
                className="text-xs font-bold text-[#6D1838] hover:underline"
              >
                Return to Academic Catalogue →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
