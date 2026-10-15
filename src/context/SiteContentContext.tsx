import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { siteConfig } from '../config/siteConfig';
import { DEFAULT_SITE_CONTENT, SiteContent, mergeSiteContent, whatsappUrl } from '../config/siteContent';

const LOCAL_KEY = 'sic_site_content_v1';
const CACHE_KEY = 'sic_site_content_cache_v1';

interface SiteContentContextType {
  content: SiteContent;
  loading: boolean;
  updatedAt: string | null;
  save: (next: SiteContent) => Promise<{ ok: boolean; error?: string }>;
  reload: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

/** Keep the legacy siteConfig object in sync so every screen shows the edited values. */
const applyToLegacyConfig = (c: SiteContent) => {
  siteConfig.brandName = c.brandName;
  siteConfig.contact.email = c.contact.email;
  siteConfig.contact.whatsappNumber = c.contact.whatsappNumber;
  siteConfig.contact.whatsappFormatted = c.contact.whatsappNumber;
  siteConfig.contact.whatsappDirectUrl = whatsappUrl(c.contact);
  siteConfig.contact.officeAddress = c.contact.officeAddress;
  siteConfig.contact.businessHours = c.contact.businessHours;
  if (typeof document !== 'undefined') {
    document.title = `${c.brandName} — International Education Consultancy`;
  }
};

const readCache = (key: string): SiteContent | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? mergeSiteContent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start from the last known content (cache) so returning visitors don't see a flash of old text
  const [content, setContent] = useState<SiteContent>(() => {
    const initial = readCache(isSupabaseConfigured() ? CACHE_KEY : LOCAL_KEY) || DEFAULT_SITE_CONTENT;
    applyToLegacyConfig(initial);
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const apply = (c: SiteContent) => {
    applyToLegacyConfig(c);
    setContent(c);
  };

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      apply(readCache(LOCAL_KEY) || DEFAULT_SITE_CONTENT);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('site_content').select('data, updated_at').eq('id', 'main').maybeSingle();
      if (!error) {
        const merged = mergeSiteContent(data?.data);
        apply(merged);
        setUpdatedAt(data?.updated_at || null);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      console.warn('Site content could not be loaded, using defaults:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = async (next: SiteContent) => {
    const clean = mergeSiteContent(next);
    if (!isSupabaseConfigured()) {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(clean));
      } catch {
        return { ok: false, error: 'Could not save in this browser.' };
      }
      apply(clean);
      setUpdatedAt(new Date().toISOString());
      return { ok: true };
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('site_content')
      .upsert({ id: 'main', data: clean, updated_at: new Date().toISOString(), updated_by: userData.user?.id || null }, { onConflict: 'id' })
      .select('updated_at')
      .single();
    if (error) return { ok: false, error: error.message };
    apply(clean);
    setUpdatedAt(data?.updated_at || new Date().toISOString());
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(clean));
    } catch {
      /* ignore */
    }
    return { ok: true };
  };

  return (
    <SiteContentContext.Provider value={{ content, loading, updatedAt, save, reload }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside SiteContentProvider');
  return ctx;
};
