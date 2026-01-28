import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Fix for GitHub Codespaces and server actions
  experimental: {
    // Optimize imports for commonly used packages to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      '@supabase/ssr',
      'react-markdown',
      'react-syntax-highlighter',
      'sonner',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-progress',
    ],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev',
        '*.githubpreview.dev',
      ],
      bodySizeLimit: '15mb', // Increase limit for image uploads (default is 1mb)
    },
  },

  // Security headers for better performance and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(ico|png|svg|jpg|jpeg|gif|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Fix for Turbopack workspace root detection
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
