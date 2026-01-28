'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Home } from 'lucide-react';
import type { University, Faculty } from '@/types/database';

interface MobileForumMenuProps {
  universities: (University & { faculties: Faculty[] })[];
  onNavigate: () => void;
}

export function MobileForumMenu({ universities, onNavigate }: MobileForumMenuProps) {
  // Manages expanded/collapsed state of the forum menu
  const [isExpanded, setIsExpanded] = useState(false);
  // Manages which university's faculties are currently expanded
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);

  // Toggles a university's faculty list expansion
  const toggleUniversity = (universityId: string) => {
    setExpandedUniversity(expandedUniversity === universityId ? null : universityId);
  };

  return (
    <div className="space-y-1">
      {/* Main Forum Link */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5" />
            Forum
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Expanded Universities List */}
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
            <Link
              href="/forum/select-university"
              onClick={onNavigate}
              className="block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 transition-colors"
            >
              Sva sveučilišta
            </Link>

            {universities.map((university) => (
              <div key={university.id}>
                <button
                  onClick={() => toggleUniversity(university.id)}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <span>{university.name}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedUniversity === university.id ? 'rotate-90' : ''}`} />
                </button>

                {/* Faculties List */}
                {expandedUniversity === university.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {university.faculties.map((faculty) => (
                      <Link
                        key={faculty.id}
                        href={`/forum/${university.slug}/${faculty.slug}`}
                        onClick={onNavigate}
                        className="block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {faculty.abbreviation}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {faculty.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
