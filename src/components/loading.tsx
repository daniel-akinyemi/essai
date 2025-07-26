import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-3/4 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-2 pt-4">
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <div className="flex space-x-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mb-4">
        <LoadingSpinner size="lg" />
      </div>
      <p className="text-muted-foreground">Loading, please wait...</p>
    </div>
  );
}
