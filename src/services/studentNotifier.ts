import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Email the student when the admissions team changes something in their account.
 * Sends through the Supabase Edge Function "notify-student" (which uses Brevo).
 * Never blocks the admin action: failures are reported, not thrown.
 */
export const notifyStudent = async (params: {
  applicationId: string;
  subject: string;
  headline: string;
  message: string;
}): Promise<{ sent: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { sent: false, error: 'demo' };
  try {
    const { data, error } = await supabase.functions.invoke('notify-student', {
      body: { ...params, siteUrl: window.location.origin },
    });
    if (error) return { sent: false, error: error.message };
    if (data && data.sent === false) return { sent: false, error: data.error || 'Email not sent' };
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e?.message || 'Email not sent' };
  }
};
