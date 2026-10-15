import { Student } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile extends Student {}

export interface AuthSession {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
}

const LOCAL_SESSION_KEY = 'chinastudy_auth_session_mock';

// Demo profiles for instant frontend evaluation and local testing
export const DEMO_STUDENT_PROFILE: UserProfile = {
  id: 'usr-prof-student-001',
  userId: 'usr-student-001',
  firstName: 'David',
  lastName: 'Osei',
  email: 'david.osei@example.com',
  whatsapp: '+233 50 123 4567',
  nationality: 'Ghanaian',
  country: 'Ghana',
  city: 'Accra',
  dateOfBirth: '2003-08-22',
  gender: 'Male',
  role: 'student',
  createdAt: '2025-01-15T00:00:00Z',
};

export const DEMO_ADMIN_PROFILE: UserProfile = {
  id: 'usr-prof-admin-001',
  userId: 'usr-admin-001',
  firstName: 'Elena',
  lastName: 'Zhao',
  email: 'admin@studyinchina.com',
  whatsapp: '+86 186 2100 8954',
  nationality: 'Chinese',
  country: 'China',
  city: 'Beijing',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
};

/**
 * Authentication Service
 * Connects to Supabase Auth and public.profiles table when configured,
 * with resilient fallback to local storage and evaluation presets.
 */
export const authService = {
  /**
   * Register a new student account.
   * Default role is strictly 'student'. Users cannot register as 'admin'.
   */
  async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    whatsapp?: string;
    nationality?: string;
  }): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
    if (!params.email || !params.password) {
      return { user: null, profile: null, error: 'Email and password are required.' };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              first_name: params.firstName,
              last_name: params.lastName,
              whatsapp: params.whatsapp || '',
              nationality: params.nationality || '',
              role: 'student', // Strict enforcement
            },
          },
        });

        if (authError) {
          return { user: null, profile: null, error: authError.message };
        }

        if (authData.user) {
          const profilePayload = {
            user_id: authData.user.id,
            first_name: params.firstName,
            last_name: params.lastName,
            email: params.email,
            whatsapp: params.whatsapp || '',
            nationality: params.nationality || '',
            role: 'student', // Strict enforcement
          };

          const { data: profileRecord, error: profileError } = await supabase
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'user_id' })
            .select('*')
            .single();

          const studentProfile: UserProfile = {
            id: profileRecord?.id || authData.user.id,
            userId: authData.user.id,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            whatsapp: params.whatsapp || '',
            nationality: params.nationality || '',
            country: profileRecord?.country || '',
            city: profileRecord?.city || '',
            role: 'student',
            createdAt: profileRecord?.created_at || new Date().toISOString(),
          };

          const session: AuthSession = { user: { id: authData.user.id, email: params.email }, profile: studentProfile };
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
          window.dispatchEvent(new Event('chinastudy_auth_state_changed'));

          return { user: authData.user, profile: studentProfile, error: null };
        }
      } catch (err: any) {
        console.warn('Supabase auth register error, falling back to local session:', err);
      }
    }

    // Local / Prototype Fallback
    await new Promise(r => setTimeout(r, 400));
    const mockUser = {
      id: `usr-${Date.now()}`,
      email: params.email,
    };

    const mockProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      userId: mockUser.id,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      whatsapp: params.whatsapp || '',
      nationality: params.nationality || '',
      country: '',
      city: '',
      role: 'student',
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = { user: mockUser, profile: mockProfile };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('chinastudy_auth_state_changed'));

    return { user: mockUser, profile: mockProfile, error: null };
  },

  /**
   * Log into an existing account with email and password
   */
  async login(email: string, password: string): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
    if (!email || !password) {
      return { user: null, profile: null, error: 'Please enter both email and password.' };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          return { user: null, profile: null, error: authError.message };
        }

        if (authData.user) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

          const profile: UserProfile = {
            id: profileRow?.id || authData.user.id,
            userId: authData.user.id,
            firstName: profileRow?.first_name || authData.user.user_metadata?.first_name || 'Student',
            lastName: profileRow?.last_name || authData.user.user_metadata?.last_name || '',
            email: authData.user.email || email,
            phone: profileRow?.phone || '',
            whatsapp: profileRow?.whatsapp || authData.user.user_metadata?.whatsapp || '',
            nationality: profileRow?.nationality || authData.user.user_metadata?.nationality || '',
            country: profileRow?.country || '',
            city: profileRow?.city || '',
            dateOfBirth: profileRow?.date_of_birth,
            gender: profileRow?.gender,
            profilePhotoUrl: profileRow?.profile_photo_url,
            role: (profileRow?.role as 'student' | 'admin') || 'student',
            createdAt: profileRow?.created_at || new Date().toISOString(),
          };

          const session: AuthSession = {
            user: { id: authData.user.id, email: authData.user.email || email },
            profile,
          };

          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
          window.dispatchEvent(new Event('chinastudy_auth_state_changed'));

          return { user: authData.user, profile, error: null };
        }
      } catch (err: any) {
        console.warn('Supabase login error, checking local store:', err);
      }
    }

    // Local / Prototype Demo Fallback
    await new Promise(r => setTimeout(r, 200));

    const normalizedEmail = email.toLowerCase().trim();

    // Specific mock student credentials validation
    if (normalizedEmail === 'student@example.com') {
      if (password !== 'student123') {
        return { user: null, profile: null, error: 'Invalid password. Please use "student123" for student portal access.' };
      }
      const studentProfile: UserProfile = {
        ...DEMO_STUDENT_PROFILE,
        email: 'student@example.com',
        role: 'student',
      };
      const session: AuthSession = {
        user: { id: studentProfile.userId, email: 'student@example.com' },
        profile: studentProfile,
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event('chinastudy_auth_state_changed'));
      return { user: session.user, profile: studentProfile, error: null };
    }

    if (normalizedEmail.includes('admin')) {
      if (password.length < 4) {
        return { user: null, profile: null, error: 'Password must be at least 4 characters.' };
      }
      const session: AuthSession = {
        user: { id: DEMO_ADMIN_PROFILE.userId, email: DEMO_ADMIN_PROFILE.email },
        profile: DEMO_ADMIN_PROFILE,
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event('chinastudy_auth_state_changed'));
      return { user: session.user, profile: DEMO_ADMIN_PROFILE, error: null };
    }

    if (password.length < 4) {
      return { user: null, profile: null, error: 'Password must be at least 4 characters.' };
    }

    const studentProfile: UserProfile = {
      ...DEMO_STUDENT_PROFILE,
      email: normalizedEmail,
      role: 'student',
    };
    const session: AuthSession = {
      user: { id: studentProfile.userId, email: normalizedEmail },
      profile: studentProfile,
    };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('chinastudy_auth_state_changed'));
    return { user: session.user, profile: studentProfile, error: null };
  },

  /**
   * Instant 1-click evaluation access
   */
  async loginAsDemo(role: 'student' | 'admin'): Promise<AuthSession> {
    const profile = role === 'admin' ? DEMO_ADMIN_PROFILE : DEMO_STUDENT_PROFILE;
    const session: AuthSession = {
      user: { id: profile.userId, email: profile.email },
      profile,
    };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('chinastudy_auth_state_changed'));
    return session;
  },

  /**
   * Log out of current session
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    window.dispatchEvent(new Event('chinastudy_auth_state_changed'));
  },

  /**
   * Retrieve active authenticated session
   */
  async getSession(): Promise<AuthSession> {
    if (isSupabaseConfigured()) {
      try {
        const { data: authSessionData } = await supabase.auth.getSession();
        if (authSessionData.session?.user) {
          const user = authSessionData.session.user;
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profileRow) {
            const profile: UserProfile = {
              id: profileRow.id,
              userId: profileRow.user_id,
              firstName: profileRow.first_name,
              lastName: profileRow.last_name,
              email: profileRow.email,
              phone: profileRow.phone,
              whatsapp: profileRow.whatsapp,
              nationality: profileRow.nationality,
              country: profileRow.country,
              city: profileRow.city,
              dateOfBirth: profileRow.date_of_birth,
              gender: profileRow.gender,
              profilePhotoUrl: profileRow.profile_photo_url,
              role: profileRow.role,
              createdAt: profileRow.created_at,
            };
            return {
              user: { id: user.id, email: user.email || '' },
              profile,
            };
          }
        }
      } catch (e) {
        console.warn('Error reading Supabase session:', e);
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_SESSION_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Session retrieval error:', e);
    }
    return { user: null, profile: null };
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#reset-password`,
        });
        if (error) {
          return { success: false, message: error.message };
        }
        return {
          success: true,
          message: `Password reset instructions have been sent to ${email}.`,
        };
      } catch (e: any) {
        return { success: false, message: e.message || 'Failed to dispatch reset instructions.' };
      }
    }

    await new Promise(r => setTimeout(r, 400));
    return {
      success: true,
      message: `Password reset instructions dispatched to ${email}. Check your inbox.`,
    };
  },

  /**
   * Google OAuth preparation (ready to activate when Google Client ID is configured in Supabase)
   */
  async signInWithGoogle(): Promise<{ error?: string }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase URL and Anon Key are required to initialize Google OAuth.' };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message || 'Google OAuth failed' };
    }
  },
};
