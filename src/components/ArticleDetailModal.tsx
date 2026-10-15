import React from 'react';
import { X, Calendar, Clock, User, Share2, Check } from 'lucide-react';
import { BlogPost } from '../types';
import { pricing } from '../config/siteConfig';

interface ArticleDetailModalProps {
  article: BlogPost | null;
  onClose: () => void;
  onStartApplication: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onStartApplication,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!article) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Cover */}
        {article.coverImage && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-neutral-900 shrink-0">
            <img
              src={article.coverImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Close article"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#6D1838] text-white mb-2">
                {article.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                {article.title}
              </h2>
            </div>
          </div>
        )}

        {/* Metadata bar */}
        <div className="px-6 py-3 border-b border-neutral-100 bg-[#FAF7F9] flex flex-wrap items-center justify-between text-xs text-[#575260] gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#6D1838]" /> {article.author}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {article.publishedDate}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTimeMinutes} min read
            </span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-200 text-[#18151B] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-sm sm:text-base text-[#18151B] leading-relaxed">
          <p className="font-semibold text-base sm:text-lg text-[#18151B] leading-relaxed border-l-4 border-[#6D1838] pl-4 py-1 italic bg-[#FAF2F5]/50 rounded-r-lg">
            {article.excerpt}
          </p>

          {article.content.map((paragraph, idx) => (
            <p key={idx} className="text-[#575260] leading-relaxed">
              {paragraph}
            </p>
          ))}

          {/* Practical Callout box */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#FAF2F5] to-[#F8F5FD] border border-[#EAD5DE]">
            <h4 className="font-bold text-base text-[#18151B] mb-2">
              Ready to submit your application for study in China?
            </h4>
            <p className="text-xs sm:text-sm text-[#575260] mb-4">
              Get comprehensive guidance through document review, program admissions, and verified JW202 visa processing with our transparent three-stage payment plan (${pricing.total.usd.toLocaleString()} USD total, ${pricing.initialDeposit.usd} USD initial deposit).
            </p>
            <button
              onClick={() => {
                onClose();
                onStartApplication();
              }}
              className="px-5 py-2.5 bg-[#6D1838] hover:bg-[#58122c] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Start Your Application (${pricing.initialDeposit.usd} USD Deposit)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-[#FAF7F9] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-xl transition-colors"
          >
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};
