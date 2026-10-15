import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { blogPostsData } from '../data/blog';
import { BlogPost } from '../types';
import { BlogCard } from './BlogCard';

interface ResourcesSectionProps {
  onReadArticle: (article: BlogPost) => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({ onReadArticle }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'JW202',
    'Student Visa',
    'Scholarships',
    'Life in China',
  ];

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return blogPostsData;
    return blogPostsData.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="resources" className="py-20 bg-white border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
              Admissions & Visa Knowledge Base
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18151B]">
              Guides & Student Resources
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#575260] max-w-xl">
              Authentic, authoritative insights on obtaining JW202 visa documentation, securing CSC scholarships, and navigating student life in China.
            </p>
          </div>

          {/* Clean Segmented buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === cat
                    ? 'bg-white text-[#18151B] shadow-xs'
                    : 'text-[#575260] hover:text-[#18151B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} onRead={onReadArticle} />
          ))}
        </div>
      </div>
    </section>
  );
};
