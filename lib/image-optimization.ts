/**
 * Optimized Image Component Configuration
 * Use these utilities for all avatar and profile image rendering
 */

import Image from 'next/image';
import { CSSProperties } from 'react';

/**
 * Predefined image sizes for responsive images
 * Ensures consistent sizing across components
 */
export const IMAGE_SIZES = {
  AVATAR_SMALL: {
    width: 32,
    height: 32,
    // sizes: "32px" // For CSS responsive sizing
  },
  AVATAR_MEDIUM: {
    width: 48,
    height: 48,
  },
  AVATAR_LARGE: {
    width: 64,
    height: 64,
  },
  AVATAR_XL: {
    width: 128,
    height: 128,
  },
  TOPIC_THUMBNAIL: {
    width: 300,
    height: 200,
  },
  BANNER: {
    width: 1200,
    height: 400,
  },
} as const;

/**
 * Get optimized image URL for Supabase
 * Automatically handles webp/avif conversion through Next.js
 */
export function getOptimizedImageUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Image loading strategies
 * Use `eager` for above-fold images, `lazy` for below-fold
 */
export type ImageLoadingStrategy = 'eager' | 'lazy';

/**
 * Next.js Image component configuration
 * Already optimized with avif/webp support in next.config.mjs
 */
export const IMAGE_COMPONENT_CONFIG = {
  quality: 75, // 75% quality - good balance of size/quality
  formats: ['image/avif', 'image/webp'], // Automatically serves best format
  loader: undefined, // Uses Vercel's Image Optimization by default for production
};

/**
 * Usage example with Avatar:
 * 
 * import Image from 'next/image';
 * import { IMAGE_SIZES, IMAGE_COMPONENT_CONFIG } from '@/lib/image-optimization';
 * 
 * export function OptimizedAvatar({ src, alt }: { src?: string; alt: string }) {
 *   return (
 *     <Image
 *       src={src || '/default-avatar.png'}
 *       alt={alt}
 *       width={IMAGE_SIZES.AVATAR_MEDIUM.width}
 *       height={IMAGE_SIZES.AVATAR_MEDIUM.height}
 *       className="rounded-full"
 *       quality={IMAGE_COMPONENT_CONFIG.quality}
 *       loading="lazy"
 *     />
 *   );
 * }
 */

/**
 * Skeleton loader for images
 * Improves perceived performance during image load
 */
export interface ImageSkeletonProps {
  width: number;
  height: number;
  className?: string;
}

export function ImageSkeleton({ width, height, className = '' }: ImageSkeletonProps) {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
    />
  );
}
