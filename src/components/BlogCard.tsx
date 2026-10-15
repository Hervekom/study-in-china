import React from 'react';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  onRead: (post: BlogPost) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onRead }) => {
  return (
    <article className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      {/* Cover image if available */}
      {post.coverImage && (
        <div className="relative h-44 overflow-hidden bg-neutral-900 cursor-pointer" onClick={() => onRead(post)}>
          <img
            src={post.coverImage}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#6D1838] text-[11px] font-bold text-white shadow-xs">
            {post.category}
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] flex items-center gap-2">
            <span>{post.publishedDate}</span>
            <span>·</span>
            <span>{post.readTimeMinutes} min read</span>
          </div>
        </div>
      )}

      {/* Text body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {!post.coverImage && (
            <span className="inline-block text-[11px] font-bold text-[#6D1838] uppercase tracking-wider mb-2">
              {post.category}
            </span>
          )}

          <h3
            onClick={() => onRead(post)}
            className="text-base font-bold text-[#18151B] group-hover:text-[#6D1838] transition-colors leading-snug cursor-pointer mb-2"
          >
            {post.title}
          </h3>

          <p className="text-xs text-[#575260] line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] text-[#575260] font-medium flex items-center gap-1">
            <User className="w-3 h-3 text-[#6C3B9E]" />
            {post.author}
          </span>

          <button
            onClick={() => onRead(post)}
            className="text-xs font-bold text-[#6D1838] hover:text-[#58122c] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Read Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
