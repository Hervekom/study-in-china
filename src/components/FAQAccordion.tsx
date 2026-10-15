import React, { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { faqsData } from '../data/faqs';
import { FAQItem } from '../types';
import { pricing } from '../config/siteConfig';

export const FAQAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-cost-total');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqsData.map((f) => f.category)));
    return ['All', ...cats];
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqsData.filter((faq) => {
      const matchesCat =
        selectedCategory === 'All' || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 bg-[#FAF7F9] border-t border-neutral-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
            <span>Everything You Need to Know</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18151B]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#575260] leading-relaxed max-w-2xl mx-auto">
            Clear, transparent answers about our ${pricing.totalUSD.toLocaleString()} USD 3-stage pricing structure, academic program applications, JW202 visa documentation, and life in China.
          </p>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search frequently asked questions (e.g. $${pricing.depositUSD}, JW202, visa, scholarships)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 focus:border-[#6D1838] shadow-2xs"
            />
          </div>

          {/* Clean Segmented Interactive Buttons for Category Filter (as allowed by anti-slop guidelines) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/70 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-[#18151B] shadow-xs'
                    : 'text-[#575260] hover:text-[#18151B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                  isOpen
                    ? 'border-[#6D1838]/40 shadow-xs'
                    : 'border-neutral-200/80 hover:border-neutral-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isOpen ? 'bg-[#6D1838]' : 'bg-neutral-300'}`} />
                    <span className="text-sm sm:text-base font-bold text-[#18151B]">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#6D1838]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-neutral-100 text-xs sm:text-sm text-[#575260] leading-relaxed animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                    <div className="mt-2 text-[11px] font-medium text-[#6C3B9E]">
                      Category: {faq.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 text-xs text-[#575260]">
            No answers matched "{searchQuery}". Try a different keyword or contact our advisors directly.
          </div>
        )}

        {/* Additional Help prompt */}
        <div className="mt-10 text-center p-6 bg-white rounded-2xl border border-neutral-200/80 text-xs text-[#575260]">
          <p className="font-semibold text-sm text-[#18151B] mb-1">Have a specific question not answered here?</p>
          <p className="mb-3">Our international admissions team is available daily to evaluate your eligibility.</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D1838] text-white font-semibold rounded-xl text-xs hover:bg-[#58122c] transition-colors"
          >
            Contact Admissions Team
          </a>
        </div>
      </div>
    </section>
  );
};
