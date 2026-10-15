import React from 'react';
import { Clock, Calendar, DollarSign, Award, ArrowRight, BookOpen, MapPin, CheckCircle } from 'lucide-react';
import { Program } from '../types';

interface ProgramCardProps {
  program: Program;
  onSelect: (program: Program) => void;
  onApply: (programTitle: string, degree?: string) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onSelect,
  onApply,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-[#6D1838]/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between text-xs text-[#575260] mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6D1838] bg-[#FAF2F5] px-2.5 py-0.5 rounded-md border border-[#EAD5DE]">
              {program.degree}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="font-medium text-neutral-600 truncate max-w-[140px]">
              {program.field}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#6C3B9E] bg-[#F3EEFA] px-2.5 py-0.5 rounded-md border border-[#E5D6F7]">
            {program.language}-Taught
          </span>
        </div>

        {/* Program Title */}
        <h3
          onClick={() => onSelect(program)}
          className="text-lg font-bold text-[#18151B] group-hover:text-[#6D1838] transition-colors cursor-pointer leading-snug mb-2"
        >
          {program.title}
        </h3>

        {/* Intake & Application Window */}
        <div className="flex items-center gap-1.5 text-xs text-[#575260] mb-3">
          <Calendar className="w-3.5 h-3.5 text-[#6D1838] shrink-0" />
          <span className="font-medium text-[#18151B]">
            {program.intakeSeason}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-500 text-[11px]">
            Deadline: {program.applicationDeadline}
          </span>
        </div>

        {/* Overview */}
        <p className="text-xs text-[#575260] line-clamp-2 leading-relaxed mb-4">
          {program.overview}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs mb-4">
          <div>
            <span className="text-[11px] text-[#575260] flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400" /> Duration
            </span>
            <p className="font-bold text-[#18151B] mt-0.5">{program.durationYears}</p>
          </div>
          <div>
            <span className="text-[11px] text-[#575260] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" /> Est. Tuition / Yr
            </span>
            <p className="font-bold text-[#18151B] mt-0.5">
              ${program.tuitionPerYearUSD.toLocaleString()} USD
            </p>
          </div>
        </div>

        {/* Scholarship Indicator */}
        {program.scholarshipEligible && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#6C3B9E] font-medium bg-[#F8F5FD] px-3 py-2 rounded-lg border border-[#E5D6F7] mb-3">
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{program.scholarshipCoverage}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
        <button
          onClick={() => onSelect(program)}
          className="flex-1 py-2.5 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors text-center"
        >
          View Program →
        </button>
        <button
          onClick={() => onApply(program.title, program.degree)}
          className="py-2.5 px-4 text-xs font-bold text-white bg-[#6D1838] hover:bg-[#58122c] rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>Apply</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
