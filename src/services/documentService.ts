import { DocumentType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  uploadOrReplaceDocument,
  updateDocumentStatus as updateLocalDocStatus,
  getStoredApplications,
  saveApplications,
} from '../data/applicationStorage';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const documentService = {
  /**
   * Uploads or replaces an applicant document.
   * Leverages Supabase Storage bucket 'application-documents' when configured,
   * while keeping instant interactive feedback in local state.
   */
  async uploadDocument(params: {
    applicationId: string;
    studentId?: string;
    documentType: DocumentType;
    file: File;
  }): Promise<{ success: boolean; error?: string; url?: string }> {
    const { applicationId, documentType, file } = params;

    // 1. File Type Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp)$/i)) {
      return { success: false, error: 'Invalid file format. Please upload PDF, JPG, or PNG files only.' };
    }

    // 2. File Size Validation (10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: 'File size exceeds the 10MB maximum limit.' };
    }

    const fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    let fileUrl = URL.createObjectURL(file);

    if (isSupabaseConfigured()) {
      try {
        const filePath = `${applicationId}/${documentType}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('application-documents')
          .upload(filePath, file, {
            upsert: true,
          });

        if (!uploadError && storageData) {
          const { data: publicUrlData } = supabase.storage
            .from('application-documents')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
          }

          // Register in database table
          if (params.studentId) {
            await supabase.from('application_documents').insert({
              application_id: applicationId,
              student_id: params.studentId,
              document_type: documentType,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              status: 'pending',
            });
          }
        }
      } catch (e) {
        console.warn('Supabase storage upload error, continuing with local object URL:', e);
      }
    }

    uploadOrReplaceDocument(applicationId, documentType, {
      name: file.name,
      size: fileSizeStr,
      url: fileUrl,
    });

    return { success: true, url: fileUrl };
  },

  /**
   * Admin: Approve or request correction on document
   */
  async updateStatus(params: {
    applicationId: string;
    documentId: string;
    status: 'approved' | 'correction_required' | 'under_review';
    adminNote?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { applicationId, documentId, status, adminNote } = params;

    const mappedStatus =
      status === 'approved' ? 'verified' : status === 'correction_required' ? 'needs_resubmission' : 'pending';

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('application_documents')
          .update({
            status: status === 'approved' ? 'verified' : status === 'correction_required' ? 'rejected' : 'pending',
            admin_feedback: adminNote || '',
          })
          .eq('id', documentId);
      } catch (e) {
        console.warn('Supabase document status update error:', e);
      }
    }

    updateLocalDocStatus(applicationId, documentId, mappedStatus, adminNote);
    return { success: true };
  },

  /**
   * Remove a document
   */
  async deleteDocument(applicationId: string, documentId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('application_documents').delete().eq('id', documentId);
      } catch (e) {}
    }

    const apps = getStoredApplications();
    const app = apps.find(a => a.id === applicationId);
    if (!app) return false;

    app.documents = app.documents.filter(d => d.id !== documentId);
    saveApplications(apps);
    return true;
  },
};
