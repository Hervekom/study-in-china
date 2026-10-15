import { AdvisorMessage } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { addAdvisorMessage as addLocalAdvisorMessage, getStoredApplications } from '../data/applicationStorage';

export const messageService = {
  async getMessages(applicationId: string): Promise<AdvisorMessage[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('application_id', applicationId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            sender: m.sender_role === 'student' ? 'student' : 'advisor',
            senderName: m.sender_role === 'student' ? 'Student' : 'Elena Zhao (Senior Admissions Director)',
            content: m.content,
            timestamp: m.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase getMessages error:', e);
      }
    }

    await new Promise(r => setTimeout(r, 60));
    const apps = getStoredApplications();
    const app = apps.find(a => a.id === applicationId);
    return app?.messages || [];
  },

  async sendMessage(params: {
    applicationId: string;
    senderId?: string;
    senderRole: 'advisor' | 'student';
    senderName: string;
    content: string;
  }): Promise<{ success: boolean; data?: AdvisorMessage }> {
    const newMessage: AdvisorMessage = {
      id: `msg-${Date.now()}`,
      sender: params.senderRole,
      senderName: params.senderName,
      content: params.content,
      timestamp: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('messages').insert({
          application_id: params.applicationId,
          sender_id: params.senderId || null,
          sender_role: params.senderRole === 'advisor' ? 'admin' : 'student',
          content: params.content,
        });
      } catch (e) {
        console.warn('Supabase sendMessage error:', e);
      }
    }

    addLocalAdvisorMessage(params.applicationId, params.senderRole, params.senderName, params.content);
    return { success: true, data: newMessage };
  },
};
