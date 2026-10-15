import { StudentApplication, ApplicationStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getStoredApplications,
  saveApplications,
  updateApplicationStatus as updateLocalAppStatus,
} from '../data/applicationStorage';

export function calculateApplicationProgress(status: ApplicationStatus, currentStep = 1): number {
  switch (status) {
    case 'deposit_paid':
      return 25;
    case 'document_review':
      return 40;
    case 'university_submitted':
      return 55;
    case 'interview_evaluation':
      return 65;
    case 'admission_granted':
      return 75;
    case 'jw202_issued':
      return 85;
    case 'final_payment_pending':
      return 88;
    case 'visa_preparation':
      return 95;
    case 'pre_departure':
      return 100;
    default:
      return Math.min(100, Math.max(10, currentStep * 14));
  }
}

/**
 * Calculates dynamic field and document completeness (0 - 100%)
 */
export function calculateApplicationCompleteness(app: Partial<StudentApplication>): number {
  let totalPoints = 0;
  let earnedPoints = 0;

  // 1. Personal fields (40 pts)
  const personalFields = ['firstName', 'lastName', 'email', 'whatsapp', 'nationality', 'country', 'currentCity', 'dateOfBirth'];
  personalFields.forEach(f => {
    totalPoints += 5;
    if (app.personal && (app.personal as any)[f]) earnedPoints += 5;
  });

  // 2. Education fields (30 pts)
  const eduFields = ['highestEducation', 'schoolName', 'gpaOrGrade', 'englishProficiency', 'chineseProficiency'];
  eduFields.forEach(f => {
    totalPoints += 6;
    if (app.education && (app.education as any)[f]) earnedPoints += 6;
  });

  // 3. Documents (30 pts)
  const mandatoryDocs = ['passport', 'transcript', 'certificate', 'photo'];
  mandatoryDocs.forEach(d => {
    totalPoints += 7.5;
    const hasDoc = app.documents?.some(doc => doc.type === d && doc.name);
    if (hasDoc) earnedPoints += 7.5;
  });

  return Math.min(100, Math.round((earnedPoints / totalPoints) * 100));
}

export const applicationService = {
  /**
   * Generates dynamic application reference number: CSC-2026-XXXXXX
   */
  generateApplicationNumber(): string {
    const year = new Date().getFullYear();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    return `CSC-${year}-${randomCode}`;
  },

  /**
   * Retrieve all applications
   */
  async getStudentApplications(studentId?: string): Promise<StudentApplication[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('applications').select('*').order('created_at', { ascending: false });
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const localApps = getStoredApplications();
          // Sync any newly found applications or status updates with local representations
          data.forEach((row: any) => {
            const matchLocal = localApps.find(l => l.id === row.id || l.id === row.application_number);
            if (matchLocal && row.status) {
              matchLocal.status = row.status as ApplicationStatus;
            }
          });
        }
      } catch (e) {
        console.warn('Supabase getStudentApplications error, using local storage state:', e);
      }
    }

    await new Promise(r => setTimeout(r, 80));
    return getStoredApplications();
  },

  /**
   * Retrieve single application by ID
   */
  async getApplicationById(idOrAppNum: string): Promise<StudentApplication | null> {
    await new Promise(r => setTimeout(r, 60));
    const apps = getStoredApplications();
    return apps.find(a => a.id === idOrAppNum) || null;
  },

  /**
   * Save or update an application
   */
  async saveApplication(app: StudentApplication): Promise<{ success: boolean; data?: StudentApplication }> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('applications').upsert({
          id: app.id,
          application_number: app.id,
          degree: app.preferences?.targetDegree || 'Bachelor',
          field: app.preferences?.preferredField || 'Computer Science',
          preferred_city: app.preferences?.preferredCity || 'Beijing',
          target_university_name: '',
          target_program_name: app.preferences?.specificProgram || 'Computer Science',
          intake_season: app.preferences?.intakeSeason || 'Autumn (September)',
          status: app.status,
          education_highest_level: app.education?.highestEducation,
          education_school_name: app.education?.schoolName,
          education_field: app.education?.fieldOfStudy,
          education_grad_year: app.education?.graduationYear,
          education_gpa: app.education?.gpaOrGrade,
          education_english_level: app.education?.englishProficiency,
          education_chinese_level: app.education?.chineseProficiency,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase application sync error:', e);
      }
    }

    const current = getStoredApplications();
    const updated = [app, ...current.filter(a => a.id !== app.id)];
    saveApplications(updated);
    return { success: true, data: app };
  },

  /**
   * Update status with timeline transition
   */
  async updateStatus(
    appId: string,
    newStatus: ApplicationStatus,
    note?: string
  ): Promise<{ success: boolean; data?: StudentApplication }> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('applications')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', appId);
      } catch (e) {
        console.warn('Supabase status update error:', e);
      }
    }

    const updated = updateLocalAppStatus(appId, newStatus, note);
    return { success: true, data: updated };
  },

  /**
   * Delete application
   */
  async deleteApplication(appId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('applications').delete().eq('id', appId);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }

    const current = getStoredApplications();
    const filtered = current.filter(a => a.id !== appId);
    saveApplications(filtered);
    return true;
  },
};
