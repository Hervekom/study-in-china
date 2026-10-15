import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'document' | 'payment' | 'admission' | 'jw' | 'message' | 'system';
  isRead: boolean;
  createdAt: string;
}

const LOCAL_NOTIFICATIONS_KEY = 'chinastudy_notifications_store_mock';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-student-001',
    title: 'Admissions Dossier Initiated',
    message: 'Your dossier has been registered and assigned to Senior Admissions Director Elena Zhao.',
    type: 'application',
    isRead: false,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-student-001',
    title: 'Initial Deposit ($515 USD) Recorded',
    message: 'Credential audit underway. Document dossier lodging preparation active.',
    type: 'payment',
    isRead: true,
    createdAt: '2025-02-10T10:05:00Z',
  },
];

export const notificationService = {
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type as AppNotification['type'],
            isRead: n.is_read,
            createdAt: n.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase notifications query error:', e);
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  },

  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: AppNotification['type'];
  }): Promise<AppNotification> {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').insert({
          user_id: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          is_read: false,
        });
      } catch (e) {
        console.warn('Supabase notification create error:', e);
      }
    }

    try {
      const current = await this.getNotifications();
      const updated = [newNotif, ...current];
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('chinastudy_notifications_updated'));
    } catch (e) {
      console.error(e);
    }

    return newNotif;
  },

  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {}
    }

    try {
      const current = await this.getNotifications();
      const updated = current.map(n => (n.id === id ? { ...n, isRead: true } : n));
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('chinastudy_notifications_updated'));
    } catch (e) {
      console.error(e);
    }
  },

  async markAllAsRead(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      } catch (e) {}
    }

    try {
      const current = await this.getNotifications();
      const updated = current.map(n => ({ ...n, isRead: true }));
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('chinastudy_notifications_updated'));
    } catch (e) {
      console.error(e);
    }
  },
};
