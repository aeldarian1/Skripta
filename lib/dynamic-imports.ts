/**
 * Dynamic Component Loader
 * Optimizes bundle size by lazy-loading heavy components
 */

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for Suspense fallback
const ComponentSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

/**
 * Lazy-loaded components for performance optimization
 * These are heavy components that are only loaded when needed
 */

export const DynamicMarkdownEditor = dynamic(
  () => import('@/components/forum/markdown-editor').then(mod => mod.MarkdownEditor),
  { 
    loading: ComponentSkeleton,
    ssr: true // Keep SSR enabled for SEO
  }
);

export const DynamicMarkdownRenderer = dynamic(
  () => import('@/components/forum/markdown-renderer').then(mod => mod.MarkdownRenderer),
  { 
    loading: ComponentSkeleton,
    ssr: true 
  }
);

export const DynamicReactMarkdown = dynamic(
  () => import('react-markdown'),
  { 
    loading: ComponentSkeleton,
    ssr: true 
  }
);

export const DynamicEnhancedMarkdownEditor = dynamic(
  () => import('@/components/forum/new/enhanced-markdown-editor').then(mod => mod.EnhancedMarkdownEditor),
  { 
    loading: ComponentSkeleton,
    ssr: false // Slower to load, defer to client
  }
);

/**
 * Usage example:
 * 
 * import { DynamicMarkdownEditor } from '@/lib/dynamic-imports';
 * 
 * export default function MyPage() {
 *   return (
 *     <Suspense fallback={<ComponentSkeleton />}>
 *       <DynamicMarkdownEditor value={''} onChange={() => {}} />
 *     </Suspense>
 *   );
 * }
 */
