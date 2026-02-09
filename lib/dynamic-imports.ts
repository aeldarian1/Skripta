/**
 * Dynamic Component Loader
 * Optimizes bundle size by lazy-loading heavy components
 */

import dynamic from 'next/dynamic';

/**
 * Lazy-loaded components for performance optimization
 * These are heavy components that are only loaded when needed
 */

export const DynamicMarkdownEditor = dynamic(
  () => import('@/components/forum/markdown-editor').then(mod => mod.MarkdownEditor),
  { 
    ssr: true
  }
);

export const DynamicMarkdownRenderer = dynamic(
  () => import('@/components/forum/markdown-renderer').then(mod => mod.MarkdownRenderer),
  { 
    ssr: true 
  }
);

export const DynamicEnhancedMarkdownEditor = dynamic(
  () => import('@/components/forum/new/enhanced-markdown-editor').then(mod => mod.EnhancedMarkdownEditor),
  { 
    ssr: false
  }
);
