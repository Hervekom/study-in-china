import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Real document files (passport, transcripts…) stored in the private Supabase Storage
 * bucket "student-documents". Path layout: <user_id>/<application_id>/<doc_type>-<timestamp>.<ext>
 * Students can only read/write their own folder; admins can read everything.
 */

export const DOCUMENT_BUCKET = 'student-documents';
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_TYPES = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx';

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

export const validateDocumentFile = (file: File): string | null => {
  if (file.size > MAX_DOCUMENT_BYTES) return `"${file.name}" is larger than 10 MB. Please upload a smaller scan.`;
  if (file.size === 0) return `"${file.name}" is empty.`;
  return null;
};

export const uploadDocumentFile = async (
  applicationId: string,
  docType: string,
  file: File
): Promise<{ storagePath: string; name: string; size: string }> => {
  if (!isSupabaseConfigured()) {
    return { storagePath: '', name: file.name, size: formatBytes(file.size) };
  }
  const invalid = validateDocumentFile(file);
  if (invalid) throw new Error(invalid);

  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error('Please sign in again before uploading documents.');

  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'pdf';
  const safeType = docType.replace(/[^a-z0-9_-]/gi, '');
  const storagePath = `${uid}/${applicationId}/${safeType}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(DOCUMENT_BUCKET).upload(storagePath, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  });
  if (error) throw new Error(`Upload failed for "${file.name}": ${error.message}`);

  return { storagePath, name: file.name, size: formatBytes(file.size) };
};

/** Short-lived link to open or download a stored document (admins: any file, students: their own). */
export const getDocumentUrl = async (storagePath: string, downloadName?: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 300, downloadName ? { download: downloadName } : undefined);
  if (error || !data?.signedUrl) throw new Error(error?.message || 'File not found.');
  return data.signedUrl;
};
