import React, { useEffect, useMemo, useState } from 'react';
import { tr, useTr } from '../i18n/tr';
import {
  PenSquare,
  Image as ImageIcon,
  Phone,
  Share2,
  Info,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  ExternalLink,
  Megaphone,
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_SITE_CONTENT, SITE_IMAGES, SiteContent, HeroSlide, whatsappUrl } from '../config/siteContent';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { auditService } from '../services/auditService';

type SubTab = 'site' | 'carousel' | 'about' | 'contact' | 'social';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const Field: React.FC<{
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
}> = ({ label, hint, value, onChange, multiline, rows = 3, placeholder, type = 'text' }) => (
  <label className="block space-y-1">
    <span className="block text-[11px] font-bold uppercase tracking-wide text-ink/65">{tr(label)}</span>
    {multiline ? (
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838] leading-relaxed"
      />
    ) : (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
      />
    )}
    {hint && <span className="block text-[11px] text-neutral-500">{tr(hint)}</span>}
  </label>
);

const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-3xl ring-1 ring-ink/[0.07] p-4 sm:p-5 space-y-4">
    <div>
      <p className="text-sm font-bold text-ink">{tr(title)}</p>
      {subtitle && <p className="text-[11px] text-ink/65 mt-0.5">{tr(subtitle)}</p>}
    </div>
    {children}
  </div>
);

export const AdminContentEditor: React.FC<{ onToast: (msg: string) => void }> = ({ onToast }) => {
  useTr();
  const { content, save, updatedAt } = useSiteContent();
  const { profile, user } = useAuth();
  const [draft, setDraft] = useState<SiteContent>(() => clone(content));
  const [tab, setTab] = useState<SubTab>('site');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // When saved content changes elsewhere (first load), refresh the draft if untouched
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(content), [draft, content]);
  useEffect(() => {
    if (!dirty) setDraft(clone(content));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const set = <K extends keyof SiteContent>(section: K, patch: Partial<SiteContent[K]>) =>
    setDraft(d => ({ ...d, [section]: typeof d[section] === 'object' ? { ...(d[section] as object), ...patch } : patch }) as SiteContent);

  const changedSections = () =>
    (Object.keys(draft) as (keyof SiteContent)[]).filter(k => JSON.stringify(draft[k]) !== JSON.stringify(content[k]));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const sections = changedSections();
    const res = await save(draft);
    setSaving(false);
    if (!res.ok) {
      const msg = res.error || 'Save failed.';
      setError(
        /site_content|relation|schema cache|policy/i.test(msg)
          ? `${msg} — One-time setup: in Supabase SQL Editor, run the file supabase/migrations/20261015_site_content.sql, then save again.`
          : msg
      );
      return;
    }
    await auditService.log({
      action: 'site_content_updated',
      entityType: 'site_content',
      entityId: 'main',
      details: { sections: sections.join(', ') },
      actorLabel: profile?.email || user?.email || 'admin',
    });
    onToast(tr("Website updated. Changes are live."));
  };

  const handleReset = () => {
    if (!window.confirm(tr("Replace all fields with the original website text? Nothing is saved until you click Save."))) return;
    setDraft(clone(DEFAULT_SITE_CONTENT));
  };

  // ---------- Carousel ----------
  const slides = draft.hero.slides;
  const setSlides = (next: HeroSlide[]) => set('hero', { slides: next });
  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    setSlides(next);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      setError(tr("Please choose an image file (JPG, PNG or WebP)."));
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(tr("Image is larger than 5 MB. Please use a smaller image."));
      return null;
    }
    if (!isSupabaseConfigured()) {
      // Demo mode: keep the image inside the browser
      return await new Promise(resolve => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
    }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `carousel/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('site-assets').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
    if (upErr) {
      setError(`Upload failed: ${upErr.message}. If this is the first upload, run supabase/migrations/20261015_site_content.sql in the Supabase SQL Editor.`);
      return null;
    }
    return supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
  };

  const handleAddUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    const url = await uploadImage(file);
    setUploading(false);
    if (url) setSlides([...slides, { image: url, label: tr("Campus Life"), caption: '' }]);
  };

  const tabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: 'site', label: tr("Site & Hero"), icon: PenSquare },
    { id: 'carousel', label: `Carousel (${slides.length})`, icon: ImageIcon },
    { id: 'about', label: tr("About & Footer"), icon: Info },
    { id: 'contact', label: tr("Contact"), icon: Phone },
    { id: 'social', label: tr("Social"), icon: Share2 },
  ];

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink flex items-center gap-2">
            <PenSquare className="w-5 h-5 text-[#6D1838]" />{tr("Site Content Editor")}</h2>
          <p className="text-xs sm:text-sm text-ink/65 mt-1">{tr("Edit the site name, hero banner, about texts, office address and contacts, social links, and manage the hero carousel. Changes go live as soon as you save.")}</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto shrink-0 h-9 px-3 rounded-lg border border-neutral-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50 text-neutral-700"
        >
          <ExternalLink className="w-4 h-4" />{' '}{tr("View website")}</a>
      </div>

      <div className="flex gap-1 sm:gap-2 border-b border-neutral-200 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                active ? 'border-[#6D1838] text-[#6D1838]' : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {error && <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 break-words">{error}</div>}

      {/* ===== SITE & HERO ===== */}
      {tab === 'site' && (
        <div className="space-y-4">
          <Card title={tr("Site name")} subtitle="Shown in the top bar, footer, login page and browser tab.">
            <Field label="Site name" value={draft.brandName} onChange={v => setDraft(d => ({ ...d, brandName: v }))} />
          </Card>

          <Card title={tr("Announcement bar")} subtitle="A thin message above the menu on the home page (e.g. deadlines, new intake).">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={draft.announcement.enabled}
                onChange={e => set('announcement', { enabled: e.target.checked })}
                className="w-4 h-4 accent-[#6D1838]"
              />
              <Megaphone className="w-4 h-4 text-[#6D1838]" />{' '}{tr("Show the announcement bar")}</label>
            <Field label="Message" value={draft.announcement.text} onChange={v => set('announcement', { text: v })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Link text (optional)" value={draft.announcement.linkLabel} onChange={v => set('announcement', { linkLabel: v })} placeholder={tr("Apply now")} />
              <Field label="Link (optional)" value={draft.announcement.linkUrl} onChange={v => set('announcement', { linkUrl: v })} placeholder={tr("/apply, #pricing or https://…")} hint="/apply opens the application, #pricing scrolls to a section." />
            </div>
          </Card>

          <Card title={tr("Hero banner")} subtitle="The first thing visitors see on the home page.">
            <Field label="Small label above the title" value={draft.hero.kicker} onChange={v => set('hero', { kicker: v })} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Title line 1" value={draft.hero.titleLine1} onChange={v => set('hero', { titleLine1: v })} />
              <Field label="Title line 2" value={draft.hero.titleLine2} onChange={v => set('hero', { titleLine2: v })} />
              <Field label="Title line 3 (colored)" value={draft.hero.titleHighlight} onChange={v => set('hero', { titleHighlight: v })} />
            </div>
            <Field label="Text under the title" value={draft.hero.subtitle} onChange={v => set('hero', { subtitle: v })} multiline />
            <Field label="Main button text" value={draft.hero.primaryCta} onChange={v => set('hero', { primaryCta: v })} />
          </Card>
        </div>
      )}

      {/* ===== CAROUSEL ===== */}
      {tab === 'carousel' && (
        <div className="space-y-4">
          <Card title={tr("Hero carousel")} subtitle="Images rotate next to the hero title. With one image, no rotation.">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-ink/65">{tr("Change image every")}</label>
              <input
                type="number"
                min={3}
                max={30}
                value={draft.hero.autoplaySeconds}
                onChange={e => set('hero', { autoplaySeconds: Math.max(3, Math.min(30, Number(e.target.value) || 6)) })}
                className="w-20 p-2 text-sm border border-neutral-300 rounded-lg"
              />
              <span className="text-xs text-ink/65">{tr("seconds")}</span>
            </div>

            <div className="space-y-3">
              {slides.map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img src={s.image} alt="" className="w-full sm:w-40 h-40 sm:h-28 object-cover rounded-lg bg-neutral-200 shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Field label="Label" value={s.label} onChange={v => setSlides(slides.map((x, k) => (k === i ? { ...x, label: v } : x)))} />
                    <Field label="Caption" value={s.caption} onChange={v => setSlides(slides.map((x, k) => (k === i ? { ...x, caption: v } : x)))} />
                  </div>
                  <div className="flex sm:flex-col gap-1.5 shrink-0">
                    <button onClick={() => moveSlide(i, -1)} disabled={i === 0} aria-label={tr("Move up")} className="flex-1 sm:flex-none h-9 w-full sm:w-9 rounded-lg border border-neutral-300 bg-white flex items-center justify-center disabled:opacity-30">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} aria-label={tr("Move down")} className="flex-1 sm:flex-none h-9 w-full sm:w-9 rounded-lg border border-neutral-300 bg-white flex items-center justify-center disabled:opacity-30">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => slides.length > 1 ? setSlides(slides.filter((_, k) => k !== i)) : setError(tr("Keep at least one image."))}
                      aria-label={tr("Remove image")}
                      className="flex-1 sm:flex-none h-9 w-full sm:w-9 rounded-lg border border-rose-200 bg-white text-rose-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title={tr("Add an image")} subtitle="Upload your own photo (max 5 MB) or reuse one of the site's photos.">
            <label className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#6D1838] hover:bg-[#58122c] text-white text-sm font-bold cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" /> {uploading ? tr("Uploading…") : tr("Upload a photo")}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAddUpload} className="hidden" />
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {SITE_IMAGES.map(img => (
                <button
                  key={img}
                  onClick={() => setSlides([...slides, { image: img, label: tr("Campus Life"), caption: '' }])}
                  className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-[4/3]"
                  aria-label={tr("Add this image")}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                    <Plus className="w-5 h-5" />
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ===== ABOUT & FOOTER ===== */}
      {tab === 'about' && (
        <div className="space-y-4">
          <Card title={tr("About section")} subtitle="The “About” block on the home page.">
            <Field label="Headline" value={draft.about.headline} onChange={v => set('about', { headline: v })} />
            <Field label="Introduction" value={draft.about.intro} onChange={v => set('about', { intro: v })} multiline />
            <Field label="Who we are — paragraph 1" value={draft.about.whoWeAre} onChange={v => set('about', { whoWeAre: v })} multiline rows={4} />
            <Field label="Who we are — paragraph 2 (optional)" value={draft.about.whoWeAre2} onChange={v => set('about', { whoWeAre2: v })} multiline />
            <Field label="Our mission — paragraph 1" value={draft.about.mission} onChange={v => set('about', { mission: v })} multiline rows={4} />
            <Field label="Our mission — paragraph 2 (optional)" value={draft.about.mission2} onChange={v => set('about', { mission2: v })} multiline />
          </Card>
          <Card title={tr("Footer")}>
            <Field label="Footer description" value={draft.footer.description} onChange={v => set('footer', { description: v })} multiline />
          </Card>
        </div>
      )}

      {/* ===== CONTACT ===== */}
      {tab === 'contact' && (
        <Card title={tr("Contact details")} subtitle="Used in the contact section, footer, WhatsApp buttons and student dashboard.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Email" type="email" value={draft.contact.email} onChange={v => set('contact', { email: v })} />
            <Field label="WhatsApp number" value={draft.contact.whatsappNumber} onChange={v => set('contact', { whatsappNumber: v })} hint="With country code, e.g. +86 186 2100 8954" />
          </div>
          <Field label="Pre-filled WhatsApp message" value={draft.contact.whatsappMessage} onChange={v => set('contact', { whatsappMessage: v })} />
          <a href={whatsappUrl(draft.contact)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline">
            <ExternalLink className="w-3.5 h-3.5" />{' '}{tr("Test the WhatsApp link")}</a>
          <Field label="Office address" value={draft.contact.officeAddress} onChange={v => set('contact', { officeAddress: v })} multiline rows={2} />
          <Field label="Opening hours" value={draft.contact.businessHours} onChange={v => set('contact', { businessHours: v })} />
        </Card>
      )}

      {/* ===== SOCIAL ===== */}
      {tab === 'social' && (
        <Card title={tr("Social networks")} subtitle="Leave empty to hide. Filled links appear in the footer.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'x'] as const).map(k => (
              <Field
                key={k}
                label={k === 'x' ? 'X (Twitter)' : k.charAt(0).toUpperCase() + k.slice(1)}
                type="url"
                value={draft.social[k]}
                onChange={v => set('social', { [k]: v } as any)}
                placeholder="https://…"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="text-[11px] sm:text-xs text-ink/65 min-w-0 truncate">
            {dirty ? <span className="font-bold text-amber-700">{tr("Unsaved changes")}</span> : updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString()}` : tr("Showing the original website text")}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleReset} className="h-10 px-3 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5" title={tr("Restore original text")}>
              <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">{tr("Original text")}</span>
            </button>
            {dirty && (
              <button onClick={() => setDraft(clone(content))} className="h-10 px-3 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">{tr("Discard")}</button>
            )}
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="h-10 px-5 rounded-full bg-[#6D1838] hover:bg-[#58122c] disabled:opacity-40 text-white text-sm font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> {saving ? tr("Saving…") : tr("Save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
