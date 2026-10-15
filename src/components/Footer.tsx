import React from 'react';
import { siteConfig, pricing } from '../data/siteConfig';
import { Mail, Phone, MapPin, ShieldCheck, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (type: 'terms' | 'privacy' | 'refund') => void;
  onOpenApplication: () => void;
  onNavigate?: (view: 'home' | 'apply' | 'dashboard' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, onOpenApplication, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#18151B] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800 text-xs">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6D1838] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                SIC
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                {siteConfig.brandName}
              </span>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Premier international education consultancy facilitating admissions, scholarship dossier preparation, JW202 government documentation, and student visa coaching for higher education in China.
            </p>

            <div className="pt-2 space-y-2 text-neutral-400 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#EAD5DE]" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
                  {siteConfig.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#EAD5DE]" />
                <a href={siteConfig.contact.whatsappDirectUrl} className="hover:text-white transition-colors">
                  {siteConfig.contact.whatsappFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#EAD5DE]" />
                <span>{siteConfig.contact.officeAddress}</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-neutral-400">
              {onNavigate && (
                <>
                  <li>
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="text-[#EAD5DE] hover:text-white font-semibold transition-colors text-left"
                    >
                      → Student Application Portal
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('admin')}
                      className="text-neutral-400 hover:text-white transition-colors text-left"
                    >
                      → Admissions Officer Admin
                    </button>
                  </li>
                </>
              )}
              <li><a href="#why-china" className="hover:text-white transition-colors">Why Study in China</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Study Preferences</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works (8 Steps)</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Milestone Split</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ Knowledge Base</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Our Advisors</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Office</a></li>
            </ul>
          </div>

          {/* Academic Paths */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Study Options</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Bachelor's Degrees</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Master's Degrees</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Ph.D. & Doctoral Programs</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Chinese Language Immersion</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Medicine & Health Sciences</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Computer Science & AI</a></li>
              <li><a href="#study-preferences" className="hover:text-white transition-colors">Business, Economics & MBA</a></li>
            </ul>
          </div>

          {/* Legal & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Admissions Policy</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('refund')} className="hover:text-white transition-colors text-left">
                  Refund & Cancellation Policy
                </button>
              </li>
            </ul>

            <div className="pt-3">
              <button
                onClick={onOpenApplication}
                className="w-full py-2.5 px-3 bg-[#6D1838] hover:bg-[#58122c] text-white font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
              >
                Start Application (${pricing.depositUSD})
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Transparency Reminder Banner */}
        <div className="py-6 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Official Fee Disclosure:</strong> Total service cost is ${pricing.totalUSD.toLocaleString()} USD (${pricing.depositUSD} initial deposit + ${pricing.admissionPaymentUSD} after admission + ${pricing.finalPaymentUSD.toLocaleString()} final payment after JW202/JW201 form).
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
          <p>© {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
          <p className="text-neutral-400">
            Dedicated independent international education consultancy for higher education in China.
          </p>
        </div>
      </div>
    </footer>
  );
};
