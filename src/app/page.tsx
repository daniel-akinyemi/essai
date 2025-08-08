import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LandingSkeleton } from "@/components/ui/landing-skeleton";

// Dynamically import the HomeContent component with SSR disabled
const HomeContent = dynamic(() => import('../components/HomeContent'), { 
  ssr: false,
  loading: () => <LandingSkeleton />
});

export default function Home() {
  return (
    <div className="pt-16"> {/* Add padding-top to account for fixed navigation */}
      <Suspense fallback={<LandingSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
