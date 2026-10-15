import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../data/siteConfig';
import { DEMO_MODE } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, loginAsDemo, forgotPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nationality, setNationality] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setError('Please provide both email and password.');
          setLoading(false);
          return;
        }

        const res = await login(email.trim(), password);
        if (!res.success) {
          setError(res.error || 'Authentication failed. Please check your credentials.');
          setLoading(false);
          return;
        }

        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'register') {
        if (!firstName.trim() || !lastName.trim()) {
          setError('First and last name are required.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const res = await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          whatsapp: whatsapp.trim(),
          nationality: nationality.trim(),
        });

        if (!res.success) {
          setError(res.error || 'Registration failed.');
          setLoading(false);
          return;
        }

        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        const res = await forgotPassword(email.trim());
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'student' | 'admin') => {
    setLoading(true);
    await loginAsDemo(role);
    setLoading(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col border border-neutral-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 bg-[#FAF7F9] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded bg-[#6D1838] text-white font-bold text-[10px] flex items-center justify-center">
              SIC
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D1838]">
              {siteConfig.brandName} Portal
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#18151B]">
            {mode === 'login' ? 'Sign In to Your Account' : mode === 'register' ? 'Create Student Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-[#575260] mt-0.5">
            {mode === 'login'
              ? 'Access your student applications, document vault, and JW202 visa status.'
              : mode === 'register'
              ? 'Start your admission journey. Account role defaults to Student.'
              : 'Enter your registered email to receive password reset instructions.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-neutral-200 bg-neutral-50/50">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                mode === 'login'
                  ? 'border-[#6D1838] text-[#6D1838] bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                mode === 'register'
                  ? 'border-[#6D1838] text-[#6D1838] bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration fields */}
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Osei"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="+233 50 123 4567"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ghanaian"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-[#575260] uppercase mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-2.5 pl-8 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Password (if not forgot password mode) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#575260] uppercase">
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[11px] text-[#6D1838] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full p-2.5 pl-8 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#6D1838]"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-2.5 top-3" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6D1838] hover:bg-[#58122c] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' ? 'Sign In to Dashboard' : mode === 'register' ? 'Register Student Account' : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-800"
            >
              Back to Sign In
            </button>
          )}

          {/* Quick Demo Switcher (local demo only) */}
          {DEMO_MODE && <div className="pt-3 border-t border-neutral-100 space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 text-center">
              Quick 1-Click Evaluator Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="p-2 bg-[#FAF2F5] hover:bg-[#F3EEFA] border border-[#EAD5DE] text-[#6D1838] rounded-lg font-bold text-[11px] text-center transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-lg font-bold text-[11px] text-center transition-colors flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-[#6D1838]" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>}
        </form>
      </div>
    </div>
  );
};
