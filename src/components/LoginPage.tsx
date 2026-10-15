import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../data/siteConfig';
import { DEMO_MODE } from '../lib/supabase';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToHome }) => {
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState(DEMO_MODE ? 'student@example.com' : '');
  const [password, setPassword] = useState(DEMO_MODE ? 'student123' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both your email address and password.');
        setLoading(false);
        return;
      }

      const res = await login(email.trim(), password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      await loginAsDemo('student');
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize demo session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-[#18151B] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 group text-[#18151B] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6D1838] flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:bg-[#58122c] transition-colors">
            SIC
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#18151B]">
            {siteConfig.brandName}
          </span>
        </button>

        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-neutral-600 hover:text-[#6D1838] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden animate-in fade-in">
          {/* Card Header */}
          <div className="p-6 pb-5 border-b border-neutral-100 bg-[#FAF7F9]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded bg-[#6D1838] text-white font-bold text-[10px] flex items-center justify-center">
                SIC
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D1838]">
                Student Admissions Portal
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-[#18151B]">
              Sign In to Student Portal
            </h1>
            <p className="text-xs text-[#575260] mt-1 leading-relaxed">
              Access your application progress, document audit vault, milestone payments, and JW202 visa status.
            </p>
          </div>

          {/* Quick Mock Credentials Callout (local demo only) */}
          {DEMO_MODE && (<div className="p-4 bg-[#FAF2F5]/80 border-b border-[#EAD5DE] flex items-start gap-2.5 text-xs text-[#58122c]">
            <ShieldCheck className="w-4 h-4 text-[#6D1838] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-[#6D1838]">Frontend Mock Authentication</strong>
              <p className="text-[11px] text-[#575260]">
                Testing Account: <span className="font-mono font-semibold text-[#18151B]">student@example.com</span> / Password: <span className="font-mono font-semibold text-[#18151B]">student123</span>
              </p>
            </div>
          </div>)}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
                Student Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full p-3 pl-9 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#6D1838] focus:bg-white transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#575260] uppercase">
                  Password
                </label>
                {DEMO_MODE && <span className="text-[10px] text-neutral-400">Mock demo: student123</span>}
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full p-3 pl-9 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#6D1838] focus:bg-white transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6D1838] hover:bg-[#58122c] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick 1-Click Access for Evaluators (local demo only) */}
            {DEMO_MODE && <div className="pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={loading}
                className="w-full py-2.5 px-3 bg-[#FAF2F5] hover:bg-[#F3EEFA] border border-[#EAD5DE] text-[#6D1838] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Student Demo Sign In</span>
              </button>
            </div>}
          </form>
        </div>
      </main>

      {/* Footer info */}
      <footer className="py-4 text-center text-xs text-[#575260] border-t border-neutral-100">
        <p>© {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
      </footer>
    </div>
  );
};
