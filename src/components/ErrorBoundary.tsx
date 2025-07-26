'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-left overflow-auto">
                <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer text-red-600 dark:text-red-400">
                    Stack trace
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try again
              </Button>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                variant="outline"
              >
                Go to Home
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<T>(
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function ErrorBoundaryWrapper(props: T) {
    return (
      <ErrorBoundary 
        fallback={
          FallbackComponent ? (
            <FallbackComponent 
              error={new Error('An error occurred')} 
              resetError={() => window.location.reload()} 
            />
          ) : undefined
        }
      >
        <Component {...(props as any)} />
      </ErrorBoundary>
    );
  };
}
