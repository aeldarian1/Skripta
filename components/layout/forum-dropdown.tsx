'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { University, Faculty } from '@/types/database';

interface ForumDropdownProps {
  universities: (University & { faculties: Faculty[] })[];
}

export function ForumDropdown({ universities }: ForumDropdownProps) {
  // Manages dropdown open/close and expanded university state
  const [isOpen, setIsOpen] = useState(false);
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);

  // Closes the dropdown menu
  const handleClose = () => {
    setIsOpen(false);
    setExpandedUniversity(null);
  };

  return (
    <div
      className="relative"
      onMouseLeave={handleClose}
    >
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-2"
      >
        Forum
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full pt-2 w-56 z-50"
          onMouseEnter={() => setIsOpen(true)}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
            <Link
              href="/forum/select-university"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mx-1"
              onClick={handleClose}
            >
              Sva sveučilišta
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

            {universities.map((university) => (
              <div key={university.id} className="relative">
                <div
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md mx-1"
                  onMouseEnter={() => setExpandedUniversity(university.id)}
                >
                  <Link
                    href={`/forum/select-university/${university.slug}`}
                    className="flex-1"
                    onClick={handleClose}
                  >
                    {university.name}
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                </div>

                {/* Faculties submenu with bridge */}
                {expandedUniversity === university.id && (
                  <div
                    className="absolute left-full top-0 pl-2 w-72"
                    onMouseEnter={() => setExpandedUniversity(university.id)}
                    onMouseLeave={() => setExpandedUniversity(null)}
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                      {university.faculties.map((faculty) => (
                        <Link
                          key={faculty.id}
                          href={`/forum/${university.slug}/${faculty.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mx-1"
                          onClick={handleClose}
                        >
                          <div className="font-medium">{faculty.abbreviation}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {faculty.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
