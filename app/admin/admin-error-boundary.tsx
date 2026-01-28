'use client';

import { ErrorBoundary } from '@/components/error-boundary-client';
import { ReactNode } from 'react';

// Error boundary wrapper for admin panel that catches and logs errors
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log errors to console in production (ready for error tracking service integration)
        if (process.env.NODE_ENV === 'production') {
          // TODO: Send to Sentry, LogRocket, etc.
          console.error('Admin panel error:', error, errorInfo);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
