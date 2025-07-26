'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Temporarily disabled Sentry to isolate build issues
const captureException = async (error: Error) => {
  console.log('Error occurred (Sentry disabled):', error.message);
  // Sentry integration temporarily disabled
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const [errorReported, setErrorReported] = useState(false);

  useEffect(() => {
    // Log the error to Sentry
    if (!errorReported) {
      captureException(error);
      setErrorReported(true);
      console.error('Page error:', error);
    }
  }, [error, errorReported]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6 p-8 bg-card rounded-lg shadow-lg">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-destructive">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We're sorry, but an unexpected error occurred. Our team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-md text-left overflow-auto">
              <h3 className="font-medium text-destructive">Error details:</h3>
              <pre className="mt-2 text-sm text-muted-foreground font-mono">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer text-muted-foreground">
                    Show stack trace
                  </summary>
                  <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => {
              reset();
            }}
            variant="default"
            className="w-full sm:w-auto"
          >
            Try again
          </Button>
          <Button
            onClick={() => {
              router.push('/');
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go to Home
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          If the problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
