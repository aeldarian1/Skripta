'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, CheckCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface Topic {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  reply_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  has_solution: boolean;
  author: {
    username: string;
    avatar_url?: string;
  };
  category: {
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
}

interface TopicListClientProps {
  topics: Topic[];
  totalCount: number;
  solvedCount: number;
  unsolvedCount: number;
}

// Memoized topic card component for better performance
const TopicCard = memo(function TopicCard({ topic }: { topic: Topic }) {
  const formattedDate = useMemo(() => {
    return new Date(topic.created_at).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [topic.created_at]);

  return (
    <div
      className="p-5 sm:p-7 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 will-change-transform"
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <Link href={`/forum/user/${topic.author?.username}`} className="flex-shrink-0">
          <Avatar
            src={topic.author?.avatar_url}
            alt={topic.author?.username || 'User'}
            username={topic.author?.username}
            size="md"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Link
              href={`/forum/category/${topic.category?.slug}`}
              className="px-3.5 py-1.5 text-sm font-bold rounded-full hover:opacity-80 transition-all hover:scale-105 shadow-sm"
              style={{
                backgroundColor: topic.category?.color + '25',
                color: topic.category?.color,
                border: `2px solid ${topic.category?.color}40`,
              }}
            >
              {topic.category?.icon} {topic.category?.name}
            </Link>
            {topic.has_solution && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full border-2 border-green-300 dark:border-green-700">
                <CheckCircle className="w-3.5 h-3.5" />
                Riješeno
              </span>
            )}
            {topic.is_pinned && (
              <span className="text-yellow-500 text-base">📌</span>
            )}
            {topic.is_locked && (
              <span className="text-gray-500 text-base">🔒</span>
            )}
          </div>

          <Link
            href={`/forum/topic/${topic.slug}`}
            className="block mb-3 group"
          >
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words leading-tight">
              {topic.title}
            </h3>
          </Link>

          <div className="flex items-center gap-5 text-sm font-medium text-gray-600 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-500">od</span>
              <Link
                href={`/forum/user/${topic.author?.username}`}
                className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {topic.author?.username}
              </Link>
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-gray-900 dark:text-white">{topic.reply_count}</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="text-gray-900 dark:text-white">{topic.view_count}</span>
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export function TopicListClient({ topics, totalCount, solvedCount, unsolvedCount }: TopicListClientProps) {
  const [currentFilter, setCurrentFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  // Memoized filter handlers
  const handleFilterAll = useCallback(() => setCurrentFilter('all'), []);
  const handleFilterUnsolved = useCallback(() => setCurrentFilter('unsolved'), []);
  const handleFilterSolved = useCallback(() => setCurrentFilter('solved'), []);

  // Filter topics based on current filter (client-side = instant!)
  const filteredTopics = useMemo(() => {
    if (currentFilter === 'solved') {
      return topics.filter(topic => topic.has_solution === true);
    } else if (currentFilter === 'unsolved') {
      return topics.filter(topic => !topic.has_solution);
    }
    return topics;
  }, [topics, currentFilter]);

  return (
    <div>
      {/* Filter Tabs - Enhanced Typography */}
      <div className="flex gap-2 mb-8 border-b-2 border-gray-200 dark:border-gray-700">
        <button
          onClick={handleFilterAll}
          className={`px-6 py-3 font-bold text-base transition-all border-b-3 ${
            currentFilter === 'all'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          Sve <span className="font-extrabold">({totalCount})</span>
        </button>
        <button
          onClick={handleFilterUnsolved}
          className={`px-6 py-3 font-bold text-base transition-all border-b-3 ${
            currentFilter === 'unsolved'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          Neriješeno <span className="font-extrabold">({unsolvedCount})</span>
        </button>
        <button
          onClick={handleFilterSolved}
          className={`px-6 py-3 font-bold text-base transition-all border-b-3 ${
            currentFilter === 'solved'
              ? 'border-green-600 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          Riješeno <span className="font-extrabold">({solvedCount})</span>
        </button>
      </div>

      {/* Topic List - Enhanced Typography & Contrast */}
      <div className="space-y-5">
        {filteredTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nema tema za prikaz
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
