import React, { useEffect, useState } from 'react';
import { Menu, X, User, LayoutDashboard, UserCheck, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { useLanguage, Lang } from '../../i18n/LanguageContext';
import { AppView } from '../../types';

interface Props {
  onApply: () => void;
  onNavigate: (view: AppView) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LanguageSwitch: React.FC<{ tone?: 'light' | 'dark'; className?: string }> = ({ tone = 'light', className = '' }) => {
  const { lang, setLang, t } = useLanguage();
  const opts: Lang[] = ['en', 'fr'];
  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={`inline-flex items-center rounded-full p-0.5 text-xs font-semibold ${
        tone === 'dark' ? 'bg-white/10 text-white/70' : 'bg-blush text-ink/70'
      } ${className}`}
    >
      {opts.map(l => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            lang === l ? (tone === 'dark' ? 'bg-white text-ink' : 'bg-white text-bordeaux shadow-sm') : 'hover:text-current'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export const SiteHeader: React.FC<Props> = ({ onApply, onNavigate, onOpenAuth }) => {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const { user, profile, isAdmin, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const links = [
    { href: '#programs', label: t.nav.programs },
    { href: '#process', label: t.nav.process },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#guides', label: t.nav.guides },
    { href: '#faq', label: t.nav.faq },
    { href: '#contact', label: t.nav.contact },
  ];

  const go = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Over the hero photo the header is transparent with light text; after scrolling it turns solid.
  const solid = scrolled || menuOpen;
  const ann = content.announcement;

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? 'bg-porcelain/95 backdrop-blur-md shadow-[0_1px_0_rgba(31,18,25,0.08)]' : 'bg-transparent'}`}>
      {ann.enabled && ann.text && !scrolled && (
        <div className="bg-bordeaux text-white text-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2 text-center">
            <span>{ann.text}</span>
            {ann.linkLabel && ann.linkUrl && (
              <a
                href={ann.linkUrl}
                onClick={e => {
                  if (ann.linkUrl === '/apply') {
                    e.preventDefault();
                    onApply();
                  } else if (ann.linkUrl.startsWith('#')) {
                    e.preventDefault();
                    go(ann.linkUrl);
                  }
                }}
                className="font-semibold underline underline-offset-2"
              >
                {ann.linkLabel}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 min-w-0"
          aria-label={content.brandName}
        >
          <span className="w-9 h-9 shrink-0 rounded-xl bg-bordeaux text-white grid place-items-center text-[11px] font-bold tracking-wide">SIC</span>
          <span className={`font-display text-lg sm:text-[22px] font-semibold truncate transition-colors ${solid ? 'text-ink' : 'text-white'}`}>
            {content.brandName}
          </span>
        </button>

        <nav aria-label="Main" className="hidden xl:flex items-center gap-0.5">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={e => {
                e.preventDefault();
                go(l.href);
              }}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                solid ? 'text-ink/75 hover:text-bordeaux hover:bg-blush' : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="hidden sm:block">
            <LanguageSwitch tone={solid ? 'light' : 'dark'} />
          </span>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen(o => !o)}
                aria-expanded={accountOpen}
                aria-label="Account"
                className={`h-10 flex items-center gap-1.5 pl-1 pr-2 rounded-full border transition-colors ${
                  solid ? 'border-ink/10 bg-white text-ink' : 'border-white/30 bg-white/10 text-white'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-bordeaux text-white grid place-items-center text-xs font-bold">
                  {(profile?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {accountOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl ring-1 ring-ink/10 py-2 z-50 text-sm" onClick={() => setAccountOpen(false)}>
                    <div className="px-4 py-2 border-b border-ink/5">
                      <p className="font-semibold text-ink truncate">{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || user?.email}</p>
                      <p className="text-xs text-ink/50 truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-4 py-2.5 hover:bg-blush flex items-center gap-2 text-ink">
                      <LayoutDashboard className="w-4 h-4 text-bordeaux" /> {t.nav.myDashboard}
                    </button>
                    {isAdmin && (
                      <button onClick={() => onNavigate('admin')} className="w-full text-left px-4 py-2.5 hover:bg-blush flex items-center gap-2 text-bordeaux font-medium">
                        <UserCheck className="w-4 h-4" /> {t.nav.adminPortal}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 flex items-center gap-2 text-rose-700"
                    >
                      <LogOut className="w-4 h-4" /> {t.nav.signOut}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className={`hidden sm:flex h-10 px-3 rounded-full text-sm font-medium items-center gap-1.5 transition-colors ${
                solid ? 'text-ink/80 hover:bg-blush' : 'text-white hover:bg-white/10'
              }`}
              aria-label={t.nav.signIn}
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">{t.nav.signIn}</span>
            </button>
          )}

          <button onClick={onApply} className="h-10 px-4 sm:px-5 rounded-full bg-bordeaux hover:bg-bordeaux-hover text-white text-sm font-semibold whitespace-nowrap transition-colors">
            <span className="sm:hidden">{t.nav.applyShort}</span>
            <span className="hidden sm:inline">{t.nav.apply}</span>
          </button>

          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={menuOpen}
            className={`xl:hidden w-10 h-10 grid place-items-center rounded-full transition-colors ${solid ? 'text-ink hover:bg-blush' : 'text-white hover:bg-white/10'}`}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="xl:hidden bg-porcelain border-t border-ink/5 shadow-xl max-h-[calc(100dvh-64px)] overflow-y-auto">
          <nav aria-label="Main" className="max-w-6xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={e => {
                  e.preventDefault();
                  go(l.href);
                }}
                className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-blush"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-5 flex flex-wrap items-center gap-3">
            <LanguageSwitch />
            {isAuthenticated ? (
              <button onClick={() => { setMenuOpen(false); onNavigate('dashboard'); }} className="text-sm font-semibold text-bordeaux">
                {t.nav.myDashboard}
              </button>
            ) : (
              <button onClick={() => { setMenuOpen(false); onOpenAuth('login'); }} className="text-sm font-semibold text-bordeaux">
                {t.nav.signIn}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { setMenuOpen(false); onNavigate('admin'); }} className="text-sm font-semibold text-ink/70">
                {t.nav.adminPortal}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
