'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Updates state when an error is caught to trigger fallback UI
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  // Handles caught errors by logging them and calling the optional error handler
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
  }

  // Resets the error state to allow the component tree to try rendering again
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  // Reloads the entire page to recover from the error
  handleReload = () => {
    window.location.reload();
  };

  // Navigates the user to the forum homepage
  handleGoHome = () => {
    window.location.href = '/forum';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Došlo je do greške</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Nažalost, došlo je do neočekivane greške. Pokušajte osvježiti stranicu ili se vratiti na početnu stranicu.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="font-mono text-sm text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Pokušaj ponovno
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Osvježi stranicu
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="default"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Početna
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple Error Fallback Component
 * Can be used as a custom fallback for ErrorBoundary
 */
// Displays a simple error message with optional reset button
export function SimpleErrorFallback({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div className="p-6 text-center space-y-4">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold mb-2">Nešto nije u redu</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {error?.message || 'Došlo je do greške prilikom učitavanja ove sekcije.'}
        </p>
      </div>
      {reset && (
        <Button onClick={reset} variant="outline" size="sm">
          Pokušaj ponovno
        </Button>
      )}
    </div>
  );
}
