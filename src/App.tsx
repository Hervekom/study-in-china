import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { SyncErrorToast } from './components/SyncErrorToast';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './components/site/HomePage';
import { LanguageProvider } from './i18n/LanguageContext';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustSection } from './components/TrustSection';
import { WhyStudyInChina } from './components/WhyStudyInChina';
import { StudyOptions } from './components/StudyOptions';
import { FieldSelection } from './components/FieldSelection';
import { StudyPreferencesSection } from './components/StudyPreferencesSection';
import { HowItWorksTimeline } from './components/HowItWorksTimeline';
import { PricingSection } from './components/PricingSection';
import { WhatIsIncluded } from './components/WhatIsIncluded';
import { ApplicationCTA } from './components/ApplicationCTA';
import { FAQAccordion } from './components/FAQAccordion';
import { ResourcesSection } from './components/ResourcesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { ApplicationWizard } from './components/ApplicationWizard';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPortal } from './components/AdminPortal';
import { LoginPage } from './components/LoginPage';

import { ArticleDetailModal } from './components/ArticleDetailModal';
import { PolicyModal } from './components/PolicyModal';

import { Program, BlogPost, DegreeLevel, AppView } from './types';
import { setActiveApplicationId } from './data/applicationStorage';

const getRouteFromUrl = (): AppView => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  // Check pathname first
  if (path === '/student/dashboard' || path === '/student' || path === '/dashboard') {
    return 'dashboard';
  }
  if (path === '/login' || path === '/signin') {
    return 'login';
  }
  if (path === '/apply') {
    return 'apply';
  }
  if (path === '/admin') {
    return 'admin';
  }
  if (path === '/compare') {
    return 'compare';
  }

  // Check hash fallback
  if (hash === 'student/dashboard' || hash === 'dashboard' || hash.startsWith('student/dashboard') || hash.startsWith('dashboard')) {
    return 'dashboard';
  }
  if (hash === 'login' || hash === 'signin') {
    return 'login';
  }
  if (hash === 'apply' || hash.startsWith('apply')) {
    return 'apply';
  }
  if (hash === 'admin' || hash.startsWith('admin')) {
    return 'admin';
  }
  if (hash === 'compare') {
    return 'compare';
  }

  return 'home';
};

function MainApp() {
  const { isAuthenticated, isStudent, isAdmin, loading } = useAuth();

  // Navigation / View router state initialized from URL
  const [currentView, setCurrentView] = useState<AppView>(() => getRouteFromUrl());
  const [targetDashboardAppId, setTargetDashboardAppId] = useState<string | undefined>(undefined);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Prefill states for application wizard
  const [prefillProg, setPrefillProg] = useState<string>('');
  const [prefillDeg, setPrefillDeg] = useState<DegreeLevel | undefined>(undefined);

  // Field selection filter state
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('All');

  // Modals on landing page
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [activePolicy, setActivePolicy] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  // Initialize and listen to popstate / hashchange routing
  useEffect(() => {
    const handleRouteChange = () => {
      const route = getRouteFromUrl();
      setCurrentView(route);
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const handleNavigate = (view: AppView, appId?: string) => {
    if (appId) {
      setTargetDashboardAppId(appId);
      setActiveApplicationId(appId);
    }

    let targetPath = '/';
    if (view === 'dashboard') targetPath = '/student/dashboard';
    else if (view === 'login') targetPath = '/login';
    else if (view === 'apply') targetPath = '/apply';
    else if (view === 'admin') targetPath = '/admin';
    else if (view === 'compare') targetPath = '/compare';

    try {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view, appId }, '', targetPath);
      }
    } catch {
      window.location.hash = targetPath.replace(/^\//, '');
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected route guard: enforces auth for /student/dashboard and redirects if logged in at /login
  useEffect(() => {
    if (loading) return;

    if (currentView === 'dashboard') {
      if (!isAuthenticated) {
        handleNavigate('login');
      } else if (!isStudent && isAdmin) {
        handleNavigate('admin');
      }
    } else if (currentView === 'login') {
      if (isAuthenticated) {
        if (isStudent) {
          handleNavigate('dashboard');
        } else if (isAdmin) {
          handleNavigate('admin');
        }
      }
    }
  }, [currentView, isAuthenticated, isStudent, isAdmin, loading]);

  const handleOpenApplication = (progTitle = '', degree?: DegreeLevel) => {
    setPrefillProg(progTitle);
    setPrefillDeg(degree);
    handleNavigate('apply');
  };

  const handleSelectDegreePath = (degree: DegreeLevel) => {
    handleOpenApplication('', degree);
  };

  const handleExplorePrograms = () => {
    const prefEl = document.getElementById('study-preferences') || document.getElementById('how-it-works');
    if (prefEl) {
      prefEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectField = (fieldName: string) => {
    handleOpenApplication(fieldName, undefined);
  };

  // View 0: Student Login Screen (/login)
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => handleNavigate('dashboard')}
        onBackToHome={() => handleNavigate('home')}
      />
    );
  }

  // View 1: 7-Step Multi-Step Application Wizard (/apply)
  if (currentView === 'apply') {
    return (
      <ApplicationWizard
        onBackToHome={() => handleNavigate('home')}
        onGoToDashboard={(appId) => handleNavigate('dashboard', appId)}
        prefillProgram={prefillProg}
        prefillDegree={prefillDeg}
      />
    );
  }

  // View 2: Student Application Dashboard (/student/dashboard)
  if (currentView === 'dashboard') {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#FDFCFD] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#6D1838] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <LoginPage
          onSuccess={() => handleNavigate('dashboard')}
          onBackToHome={() => handleNavigate('home')}
        />
      );
    }

    return (
      <StudentDashboard
        onBackToHome={() => handleNavigate('home')}
        onGoToApply={() => handleNavigate('apply')}
        onGoToAdmin={() => handleNavigate('admin')}
        onLogout={() => handleNavigate('login')}
        initialAppId={targetDashboardAppId}
      />
    );
  }

  // View 3: Admissions Directorate Admin Portal (/admin)
  if (currentView === 'admin') {
    return (
      <AdminPortal
        onBackToHome={() => handleNavigate('home')}
        onGoToDashboard={(appId) => handleNavigate('dashboard', appId)}
        onGoToApply={() => handleNavigate('apply')}
      />
    );
  }

  // View 4: Side-by-Side Program Comparison Matrix (Redirected to Home in this version)
  if (currentView === 'compare') {
    handleNavigate('home');
    return null;
  }

  // View 5: Public website (v2 design, English / French)
  return (
    <>
      <HomePage
        onApply={(program, degree) => handleOpenApplication(program || '', degree)}
        onNavigate={(view) => handleNavigate(view)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
        onReadArticle={(article) => setSelectedArticle(article)}
      />

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onStartApplication={() => handleOpenApplication()}
      />

      <PolicyModal
        isOpen={Boolean(activePolicy)}
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => handleNavigate('dashboard')}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
    <ToastProvider>
      <AuthProvider>
        <SiteContentProvider>
          <MainApp />
          <SyncErrorToast />
        </SiteContentProvider>
      </AuthProvider>
    </ToastProvider>
    </LanguageProvider>
  );
}
