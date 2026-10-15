import { Program } from '../types';
import { programsData } from '../data/programs';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ProgramFilter {
  search?: string;
  degree?: string;
  field?: string;
  language?: string;
  maxTuitionUSD?: number;
  scholarshipOnly?: boolean;
}

// Local mock store for programs
let mockProgramsStore: Program[] = [...programsData];

export const programService = {
  async getAll(filter?: ProgramFilter): Promise<Program[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('programs').select('*');
        if (filter?.degree && filter.degree !== 'All Degrees') {
          query = query.eq('degree', filter.degree);
        }
        if (filter?.language && filter.language !== 'All Languages') {
          query = query.eq('language', filter.language);
        }
        if (filter?.scholarshipOnly) {
          query = query.eq('scholarship_available', true);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list: Program[] = data.map((row: any) => ({
            id: row.id,
            city: row.city || 'Beijing',
            title: row.name,
            degree: (row.degree as any) || 'Bachelor',
            field: row.field || 'Computer Science',
            language: (row.language as any) || 'English',
            durationYears: row.duration || '4 Years',
            tuitionPerYearUSD: Number(row.tuition) || 3500,
            tuitionPerYearRMB: Math.round((Number(row.tuition) || 3500) * 7.2),
            intakeSeason: (row.intake_season?.includes('March') ? 'Spring (March)' : 'Autumn (September)') as any,
            applicationDeadline: row.application_deadline || 'June 15, 2026',
            scholarshipEligible: Boolean(row.scholarship_available),
            scholarshipCoverage: row.scholarship_coverage || 'Full Tuition & Accommodation',
            overview: row.description || 'Comprehensive academic degree curriculum accredited by the Ministry of Education of China.',
            entryRequirements: row.requirements || ['High school diploma or bachelor degree', 'Transcript of records'],
          }));

          if (filter?.search) {
            const q = filter.search.toLowerCase();
            list = list.filter(
              p =>
                p.title.toLowerCase().includes(q) ||
                p.field.toLowerCase().includes(q) ||
                p.overview.toLowerCase().includes(q)
            );
          }
          return list;
        }
      } catch (e) {
        console.warn('Supabase programs query error, using local data:', e);
      }
    }

    await new Promise(r => setTimeout(r, 100));
    let results = [...mockProgramsStore];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.field.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q)
      );
    }

    if (filter?.degree && filter.degree !== 'All Degrees') {
      results = results.filter(p => p.degree === filter.degree);
    }

    if (filter?.field && filter.field !== 'All Fields') {
      results = results.filter(p => p.field.toLowerCase().includes(filter.field?.toLowerCase() || ''));
    }

    if (filter?.language && filter.language !== 'All Languages') {
      results = results.filter(p => p.language === filter.language);
    }

    if (filter?.scholarshipOnly) {
      results = results.filter(p => p.scholarshipEligible);
    }

    return results;
  },

  async getById(id: string): Promise<Program | null> {
    const list = await this.getAll();
    return list.find(p => p.id === id) || null;
  },

  async create(prog: Omit<Program, 'id'> & { id?: string }): Promise<Program> {
    const newProg: Program = {
      ...prog,
      id: prog.id || `prog-${Date.now()}`,
    };
    mockProgramsStore = [newProg, ...mockProgramsStore];
    return newProg;
  },

  async update(id: string, updates: Partial<Program>): Promise<Program | null> {
    const idx = mockProgramsStore.findIndex(p => p.id === id);
    if (idx === -1) return null;
    mockProgramsStore[idx] = { ...mockProgramsStore[idx], ...updates };
    return mockProgramsStore[idx];
  },

  async delete(id: string): Promise<boolean> {
    const initialLen = mockProgramsStore.length;
    mockProgramsStore = mockProgramsStore.filter(p => p.id !== id);
    return mockProgramsStore.length < initialLen;
  },
};
