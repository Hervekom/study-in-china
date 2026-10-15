import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, UserCheck, LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';
import { siteConfig, pricing } from '../data/siteConfig';
import { AppView } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';

interface NavbarProps {
  onOpenApplication: () => void;
  onNavigate: (view: AppView) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  activeSection?: string;
  currentView?: AppView;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApplication,
  onNavigate,
  onOpenAuth,
  activeSection,
  currentView = 'home',
}) => {
  const { content: siteContent } = useSiteContent();
  const { user, profile, isAdmin, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const desktopLinks = siteConfig.navLinks.filter(l => !['#home', '#resources'].includes(l.href));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#compare') {
      onNavigate('home');
      return;
    }
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200/80'
          : 'bg-white/90 backdrop-blur-sm border-b border-neutral-100'
      }`}
    >
      {siteContent.announcement.enabled && siteContent.announcement.text && !scrolled && (
        <div className="bg-[#6D1838] text-white text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-center">
            <span className="leading-snug">{siteContent.announcement.text}</span>
            {siteContent.announcement.linkLabel && siteContent.announcement.linkUrl && (
              <a
                href={siteContent.announcement.linkUrl}
                onClick={(e) => {
                  const url = siteContent.announcement.linkUrl;
                  if (url === '/apply') { e.preventDefault(); onOpenApplication(); }
                  else if (url.startsWith('#')) { e.preventDefault(); handleNavClick(url); }
                }}
                className="shrink-0 font-bold underline underline-offset-2 hover:text-[#EAD5DE]"
              >
                {siteContent.announcement.linkLabel}
              </a>
            )}
          </div>
        </div>
      )}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 xl:gap-8 transition-all duration-200 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => { setMobileMenuOpen(false); onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2 group text-[#18151B] transition-colors text-left min-w-0 shrink"
          aria-label={`${siteConfig.brandName} home`}
        >
          <div className="w-9 h-9 shrink-0 rounded-lg bg-[#6D1838] flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:bg-[#58122c] transition-colors">
            SIC
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#18151B] whitespace-nowrap truncate">
            {siteConfig.brandName}
          </span>
        </button>

        {/* Zone 2: Navigation Links (large screens) */}
        <nav aria-label="Main" className="hidden xl:flex items-center gap-1 text-[#575260]">
          {desktopLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="px-2.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap hover:text-[#6D1838] hover:bg-[#FAF2F5]/70 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Account + Apply */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-label="Account menu"
                className="h-10 flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-colors text-xs font-semibold"
              >
                <span className="w-7 h-7 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[11px]">
                  {(profile?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </span>
                <span className="hidden md:inline truncate max-w-[110px] text-[#18151B]">
                  {profile?.firstName || 'My Account'}
                </span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-neutral-100">
                      <p className="font-bold text-sm text-[#18151B] truncate">{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'My Account'}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                      {isAdmin && <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#FAF2F5] text-[#6D1838]">Admin</span>}
                    </div>

                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-[#18151B] hover:bg-[#FAF2F5] hover:text-[#6D1838] flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#6D1838]" />
                      <span>My Dashboard</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onNavigate('admin')}
                        className="w-full text-left px-3.5 py-2.5 text-sm text-[#6D1838] font-semibold hover:bg-[#FAF2F5] flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Admin Portal</span>
                      </button>
                    )}

                    <div className="border-t border-neutral-100 my-1" />

                    <button
                      onClick={async () => {
                        await logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              aria-label="Sign in"
              className="h-10 px-2.5 sm:px-3.5 text-sm font-semibold text-neutral-700 hover:text-[#6D1838] hover:bg-neutral-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenApplication(); }}
            className="h-10 px-3.5 sm:px-5 text-sm font-semibold text-white bg-[#6D1838] hover:bg-[#58122c] active:bg-[#4A1028] rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 whitespace-nowrap"
          >
            <span className="sm:hidden">Apply</span>
            <span className="hidden sm:inline">Apply Now</span>
            <ArrowRight className="hidden sm:block w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-10 h-10 flex items-center justify-center text-[#18151B] hover:bg-neutral-100 rounded-xl transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Drawer Menu (phones, tablets, small laptops) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-neutral-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-64px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 space-y-4">
            <nav aria-label="Main" className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {siteConfig.navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="px-3 py-3 rounded-xl text-sm font-medium text-[#18151B] hover:bg-[#FAF2F5] hover:text-[#6D1838] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-3 text-sm font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('dashboard');
                  }}
                  className="w-full py-3 text-sm font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#6D1838]" />
                  <span>My Dashboard</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenApplication();
                }}
                className="w-full py-3 text-sm font-bold text-white bg-[#6D1838] rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <span>Start Your Application (${pricing.depositUSD} Deposit)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full py-3 text-sm font-semibold text-[#6D1838] bg-[#FAF2F5] border border-[#EAD5DE] rounded-xl flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    onNavigate('home');
                  }}
                  className="w-full py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out{profile?.firstName ? ` (${profile.firstName})` : ''}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
