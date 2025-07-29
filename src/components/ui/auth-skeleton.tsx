import { Skeleton } from "@/components/ui/skeleton";

export function AuthSkeleton() {
  return (
    <div className="flex flex-col space-y-6 w-[350px] mx-auto">
      <div className="flex flex-col space-y-2 text-center">
        <Skeleton className="h-10 w-10 mx-auto rounded-full" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Skeleton className="w-full h-px" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <Skeleton className="px-2 bg-background h-4 w-24" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
    </div>
  );
}
