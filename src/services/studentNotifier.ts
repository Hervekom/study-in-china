import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Emails the student that something new is waiting in their account.
 * Like official immigration portals, the email never contains the details:
 * the content itself lives only in the account (Messages).
 * Sends through the Supabase Edge Function "notify-student" (which uses Brevo).
 * Never blocks the action: failures are reported, not thrown.
 */
export const notifyStudent = async (params: {
  applicationId: string;
  type?: 'account_update' | 'application_received';
}): Promise<{ sent: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { sent: false, error: 'demo' };
  try {
    const { data, error } = await supabase.functions.invoke('notify-student', {
      body: { type: params.type || 'account_update', applicationId: params.applicationId, siteUrl: window.location.origin },
    });
    if (error) return { sent: false, error: error.message };
    if (data && data.sent === false) return { sent: false, error: data.error || 'Email not sent' };
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e?.message || 'Email not sent' };
  }
};
