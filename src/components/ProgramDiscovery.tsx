import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Sparkles, X, RotateCcw, BookOpen, Compass, Clock } from 'lucide-react';
import { programsData } from '../data/programs';
import { Program, DegreeLevel, LanguageOfInstruction } from '../types';
import { ProgramCard } from './ProgramCard';

const SESSION_STORAGE_KEY = 'chinastudy_recent_searches_session';
const MAX_RECENT_SEARCHES = 5;

// Load session-based recent searches safely
const getInitialRecentSearches = (): string[] => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, MAX_RECENT_SEARCHES);
        }
      }
    }
  } catch {
    // Graceful fallback if storage access is restricted
  }
  return [];
};

interface ProgramDiscoveryProps {
  onSelectProgram: (prog: Program) => void;
  onApplyProgram: (progTitle: string, degree?: string) => void;
  preselectedField?: string;
}

export const ProgramDiscovery: React.FC<ProgramDiscoveryProps> = ({
  onSelectProgram,
  onApplyProgram,
  preselectedField,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDegree, setSelectedDegree] = useState<string>('All');
  const [selectedField, setSelectedField] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [scholarshipOnly, setScholarshipOnly] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getInitialRecentSearches);

  // Sync external preselectedField if passed
  useEffect(() => {
    if (preselectedField && preselectedField !== 'All') {
      setSelectedField(preselectedField);
    }
  }, [preselectedField]);

  // Save term to recent searches session list
  const recordRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;

    setRecentSearches((prev) => {
      // Deduplicate case-insensitively while preserving newest casing
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {
        // Ignore storage exceptions
      }
      return updated;
    });
  }, []);

  // Remove a single term from recent searches
  const handleRemoveRecentSearch = (termToRemove: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {
        // Ignore storage exceptions
      }
      return updated;
    });
  };

  // Clear all recent searches from current session
  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage exceptions
    }
  };

  // Apply a recent search term
  const handleApplyRecentSearch = (term: string) => {
    setSearchQuery(term);
    recordRecentSearch(term);
  };

  // Debounced recording when user enters a query
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;

    const timer = setTimeout(() => {
      recordRecentSearch(query);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery, recordRecentSearch]);

  // Available unique fields from data
  const fields = useMemo(() => {
    const unique = Array.from(new Set(programsData.map((p) => p.field)));
    return ['All', ...unique];
  }, []);

  const filteredPrograms = useMemo(() => {
    return programsData.filter((prog) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        prog.title.toLowerCase().includes(query) ||
        prog.field.toLowerCase().includes(query) ||
        prog.city.toLowerCase().includes(query) ||
        prog.overview.toLowerCase().includes(query);

      const matchesDegree =
        selectedDegree === 'All' || prog.degree === selectedDegree;

      const matchesField =
        selectedField === 'All' ||
        prog.field.toLowerCase().includes(selectedField.toLowerCase()) ||
        selectedField.toLowerCase().includes(prog.field.toLowerCase());

      const matchesLanguage =
        selectedLanguage === 'All' || prog.language === selectedLanguage;

      const matchesScholarship = !scholarshipOnly || prog.scholarshipEligible;

      return (
        matchesSearch &&
        matchesDegree &&
        matchesField &&
        matchesLanguage &&
        matchesScholarship
      );
    });
  }, [searchQuery, selectedDegree, selectedField, selectedLanguage, scholarshipOnly]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDegree('All');
    setSelectedField('All');
    setSelectedLanguage('All');
    setScholarshipOnly(false);
  };

  return (
    <section id="programs" className="py-24 sm:py-32 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D1838]" />
            <span className="editorial-label text-[#6D1838]">
              Academic Catalogue
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#18151B]">
            Explore Programs
          </h2>
          <p className="text-base sm:text-lg text-[#575260] leading-relaxed max-w-2xl mx-auto font-normal">
            Discover accredited English-taught degree tracks across China. Review tuition, duration, entry criteria, and scholarship eligibility.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 bg-[#FAF7F9] rounded-2xl border border-neutral-200/90 mb-12 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Computer Science, AI, MBBS, MBA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    recordRecentSearch(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Degree Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
              >
                <option value="All">All Degrees</option>
                <option value="Bachelor">Bachelor's</option>
                <option value="Master">Master's</option>
                <option value="PhD">Ph.D. / Doctoral</option>
                <option value="Non-Degree Language">Language Immersion</option>
              </select>
            </div>

            {/* Field Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
              >
                <option value="All">All Fields of Study</option>
                {fields.filter(f => f !== 'All').map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838]"
              >
                <option value="All">All Languages</option>
                <option value="English">English-Taught</option>
                <option value="Chinese">Chinese-Taught</option>
              </select>
            </div>

            {/* Scholarship toggle */}
            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => setScholarshipOnly(!scholarshipOnly)}
                title="Filter scholarship eligible programs"
                className={`w-full py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                  scholarshipOnly
                    ? 'bg-[#6C3B9E] text-white border-[#6C3B9E]'
                    : 'bg-white text-[#18151B] border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSC</span>
              </button>
            </div>
          </div>

          {/* Recent Searches (Tracks and displays user's last 5 program searches within current session) */}
          {recentSearches.length > 0 && (
            <div className="pt-3 border-t border-neutral-200/80 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#575260] mr-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#6D1838]" />
                <span>Recent Searches:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {recentSearches.map((term) => {
                  const isSelected = searchQuery.trim().toLowerCase() === term.toLowerCase();
                  return (
                    <div
                      key={term}
                      className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs transition-colors border ${
                        isSelected
                          ? 'bg-[#6D1838] text-white border-[#6D1838] shadow-2xs font-semibold'
                          : 'bg-white text-[#18151B] border-neutral-200 hover:border-[#6D1838]/40 hover:bg-neutral-50 font-medium'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyRecentSearch(term)}
                        className="hover:underline focus:outline-none cursor-pointer"
                        title={`Search again for "${term}"`}
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRecentSearch(term);
                        }}
                        className={`p-0.5 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-white/80 hover:text-white hover:bg-white/20'
                            : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                        }`}
                        title={`Remove "${term}" from recent searches`}
                        aria-label={`Remove "${term}" from recent searches`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleClearRecentSearches}
                className="text-[11px] text-neutral-400 hover:text-[#6D1838] transition-colors font-medium shrink-0 ml-auto cursor-pointer"
                title="Clear recent searches from session"
              >
                Clear history
              </button>
            </div>
          )}

          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#575260] pt-1 gap-2">
            <div className="flex items-center gap-2">
              <span>Showing <strong>{filteredPrograms.length}</strong> academic programs</span>
              {(searchQuery || selectedDegree !== 'All' || selectedField !== 'All' || selectedLanguage !== 'All' || scholarshipOnly) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#6D1838] hover:underline flex items-center gap-1 font-semibold ml-2"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Filters
                </button>
              )}
            </div>
            <span className="text-neutral-400">
              Upcoming application intakes active
            </span>
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((prog) => (
              <ProgramCard
                key={prog.id}
                program={prog}
                onSelect={onSelectProgram}
                onApply={(title, degree) => onApplyProgram(title, degree)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#FAF7F9] rounded-2xl border border-neutral-200">
            <p className="text-base font-semibold text-[#18151B]">No programs match your current filter</p>
            <p className="text-xs text-[#575260] mt-1 mb-4">Try clearing one or more filters to view more programs.</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 text-xs font-semibold bg-[#6D1838] text-white rounded-xl shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
