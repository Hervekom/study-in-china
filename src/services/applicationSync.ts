import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StudentApplication } from '../types';

/**
 * Cloud sync for student applications (Supabase table public.student_applications).
 *
 * The UI keeps using the synchronous helpers in data/applicationStorage.ts; in production those
 * read from a local cache that is refreshed from the database, and every change is written
 * through to the database. The database is the source of truth: if a write is refused
 * (e.g. a student trying to change something only admins may change), the cache is reloaded.
 */

export const CLOUD_CACHE_KEY = 'sic_cloud_applications_v1';
export const SYNC_ERROR_EVENT = 'sic_sync_error';
export const APPS_UPDATED_EVENT = 'chinastudy_applications_updated';

export const isCloudMode = () => isSupabaseConfigured();

export const readCloudCache = (): StudentApplication[] => {
  try {
    const raw = localStorage.getItem(CLOUD_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeCloudCache = (apps: StudentApplication[], notify = true) => {
  try {
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(apps));
  } catch {
    /* storage full / blocked */
  }
  if (notify) window.dispatchEvent(new Event(APPS_UPDATED_EVENT));
};

export const clearCloudCache = () => {
  try {
    localStorage.removeItem(CLOUD_CACHE_KEY);
  } catch {
    /* ignore */
  }
};

const fromRow = (row: any): StudentApplication => ({
  ...(row.data || {}),
  id: row.id,
  status: row.data?.status || row.status,
  createdAt: row.data?.createdAt || row.created_at,
  updatedAt: row.updated_at,
});

const reportError = (message: string) => {
  window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT, { detail: message }));
};

let pulling: Promise<void> | null = null;

/** Reload all applications the signed-in user may see (own ones, or all for admins). */
export const pullApplications = async (): Promise<void> => {
  if (!isCloudMode()) return;
  if (pulling) return pulling;
  pulling = (async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        writeCloudCache([]);
        return;
      }
      const { data, error } = await supabase
        .from('student_applications')
        .select('id, status, data, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000);
      if (error) {
        console.warn('Could not load applications:', error.message);
        return;
      }
      const next = (data || []).map(fromRow);
      const current = localStorage.getItem(CLOUD_CACHE_KEY);
      if (current !== JSON.stringify(next)) writeCloudCache(next);
    } finally {
      pulling = null;
    }
  })();
  return pulling;
};

const replaceInCache = (app: StudentApplication) => {
  const list = readCloudCache();
  const i = list.findIndex(a => a.id === app.id);
  if (i >= 0) list[i] = app;
  else list.unshift(app);
  writeCloudCache(list);
};

/** Strip the id/updatedAt duplicates before storing the document */
const toData = (app: StudentApplication) => {
  const { ...rest } = app as any;
  return rest;
};

export const pushNewApplication = async (app: StudentApplication): Promise<boolean> => {
  if (!isCloudMode()) return true;
  const { data, error } = await supabase
    .from('student_applications')
    .insert({ id: app.id, data: toData(app) })
    .select('id, status, data, created_at, updated_at')
    .single();
  if (error) {
    reportError(`Your application could not be saved: ${error.message}`);
    await pullApplications();
    return false;
  }
  replaceInCache(fromRow(data));
  return true;
};

export const pushApplicationUpdate = async (app: StudentApplication): Promise<boolean> => {
  if (!isCloudMode()) return true;
  const { data, error } = await supabase
    .from('student_applications')
    .update({ data: toData(app) })
    .eq('id', app.id)
    .select('id, status, data, created_at, updated_at')
    .maybeSingle();
  if (error || !data) {
    reportError(error ? `Change not saved: ${error.message}` : 'Change not saved: application not found.');
    await pullApplications();
    return false;
  }
  replaceInCache(fromRow(data));
  return true;
};
