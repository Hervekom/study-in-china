import React from 'react';
import { MessageSquare } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <aside aria-label="Quick contact" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <a
        href={siteConfig.contact.whatsappDirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group active:scale-95"
        aria-label="Chat with Admissions Advisor on WhatsApp"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold hidden sm:inline whitespace-nowrap">
          Chat with Advisor
        </span>
      </a>
    </aside>
  );
};
