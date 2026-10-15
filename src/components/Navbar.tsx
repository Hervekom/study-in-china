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
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-200 ${scrolled ? 'py-3' : 'py-4'}`}>
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group text-[#18151B] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6D1838] flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:bg-[#58122c] transition-colors">
            SIC
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#18151B] whitespace-nowrap truncate max-w-[52vw] sm:max-w-none">
            {siteConfig.brandName}
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-[#575260]">
          {siteConfig.navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="hover:text-[#6D1838] transition-colors relative py-1 text-[13px] font-medium whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => onNavigate('admin')}
            className="text-[12px] font-bold text-[#6D1838] hover:bg-[#FAF2F5] px-2.5 py-1 rounded-lg border border-[#EAD5DE] transition-colors flex items-center gap-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: User Auth / Portal / Apply CTA */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors text-xs font-semibold"
              >
                <div className="w-6 h-6 rounded-full bg-[#6D1838] text-white flex items-center justify-center font-bold text-[10px]">
                  {profile?.firstName?.[0] || 'U'}
                </div>
                <span className="truncate max-w-[100px] text-[#18151B]">
                  {profile?.firstName || 'My Account'}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  isAdmin ? 'bg-[#FAF2F5] text-[#6D1838]' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-neutral-100">
                    <p className="font-bold text-xs text-[#18151B]">{profile?.firstName} {profile?.lastName}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#18151B] hover:bg-[#FAF2F5] hover:text-[#6D1838] flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#6D1838]" />
                    <span>Student Dashboard</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#6D1838] font-bold hover:bg-[#FAF2F5] flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#6D1838]" />
                      <span>Admissions Directorate</span>
                    </button>
                  )}

                  <div className="border-t border-neutral-100 my-1" />

                  <button
                    onClick={async () => {
                      await logout();
                      onNavigate('login');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-[#6D1838] hover:bg-neutral-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-2 text-xs font-semibold text-[#18151B] hover:text-[#6D1838] hover:bg-neutral-100 rounded-xl transition-colors flex items-center gap-1.5"
            title="Track application progress, documents & JW202"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#6D1838]" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={onOpenApplication}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#6D1838] hover:bg-[#58122c] active:bg-[#4A1028] rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 whitespace-nowrap"
          >
            <span>Start Your Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger toggle */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#6D1838] bg-[#FAF2F5] border border-[#EAD5DE] rounded-lg"
          >
            Portal
          </button>
          <button
            onClick={onOpenApplication}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#6D1838] rounded-lg"
          >
            Apply
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#18151B] hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-neutral-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#18151B] pt-2">
            {siteConfig.navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="p-2 rounded-lg hover:bg-[#FAF2F5] hover:text-[#6D1838] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 space-y-2">
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            ) : (
              <div className="p-3 bg-[#FAF2F5] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#18151B] block">{profile?.firstName} {profile?.lastName}</span>
                  <span className="text-[10px] text-neutral-500 uppercase">{profile?.role} Account</span>
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    onNavigate('login');
                  }}
                  className="text-rose-600 font-bold text-xs"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('dashboard');
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-[#6D1838]" />
              <span>Student Application Portal</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApplication();
              }}
              className="w-full py-3 text-center text-sm font-bold text-white bg-[#6D1838] rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              <span>Start Your Application (${pricing.depositUSD} Deposit)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="w-full py-2 text-center text-[11px] font-bold text-[#6D1838] hover:underline"
            >
              Admissions Officer Admin View →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
