import { Student } from '../types';
import { DEMO_STUDENT_PROFILE, DEMO_ADMIN_PROFILE } from './authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PROFILES_KEY = 'chinastudy_mock_profiles';

export const profileService = {
  async getProfile(userId: string): Promise<Student | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`user_id.eq.${userId},id.eq.${userId}`)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            nationality: data.nationality || '',
            country: data.country || '',
            city: data.city || '',
            dateOfBirth: data.date_of_birth,
            gender: data.gender,
            profilePhotoUrl: data.profile_photo_url,
            role: data.role,
            createdAt: data.created_at,
          };
        }
      } catch (e) {
        console.warn('Supabase profile query error:', e);
      }
    }

    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      if (raw) {
        const list: Student[] = JSON.parse(raw);
        const found = list.find(p => p.userId === userId || p.id === userId);
        if (found) return found;
      }
    } catch (e) {}

    if (userId.includes('admin')) return DEMO_ADMIN_PROFILE;
    return DEMO_STUDENT_PROFILE;
  },

  async updateProfile(profileId: string, updates: Partial<Student>): Promise<{ success: boolean }> {
    if (isSupabaseConfigured()) {
      try {
        const payload: any = {};
        if (updates.firstName !== undefined) payload.first_name = updates.firstName;
        if (updates.lastName !== undefined) payload.last_name = updates.lastName;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
        if (updates.country !== undefined) payload.country = updates.country;
        if (updates.city !== undefined) payload.city = updates.city;
        if (updates.nationality !== undefined) payload.nationality = updates.nationality;
        if (updates.dateOfBirth !== undefined) payload.date_of_birth = updates.dateOfBirth;
        if (updates.gender !== undefined) payload.gender = updates.gender;
        if (updates.profilePhotoUrl !== undefined) payload.profile_photo_url = updates.profilePhotoUrl;
        payload.updated_at = new Date().toISOString();

        await supabase
          .from('profiles')
          .update(payload)
          .or(`id.eq.${profileId},user_id.eq.${profileId}`);
      } catch (e) {
        console.warn('Supabase profile update error:', e);
      }
    }

    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      const list: Student[] = raw ? JSON.parse(raw) : [DEMO_STUDENT_PROFILE, DEMO_ADMIN_PROFILE];
      const idx = list.findIndex(p => p.id === profileId || p.userId === profileId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updates };
      } else {
        list.push({ ...DEMO_STUDENT_PROFILE, ...updates, id: profileId });
      }
      localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('chinastudy_auth_state_changed'));
    } catch (e) {}

    return { success: true };
  },

  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Avatar image must be under 5MB.' };
    }

    let fileUrl = URL.createObjectURL(file);

    if (isSupabaseConfigured()) {
      try {
        const filePath = `avatars/${userId}_${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (data?.publicUrl) {
            fileUrl = data.publicUrl;
          }
        }
      } catch (e) {
        console.warn('Supabase avatar upload error:', e);
      }
    }

    await this.updateProfile(userId, { profilePhotoUrl: fileUrl });
    return { url: fileUrl, error: null };
  },
};
