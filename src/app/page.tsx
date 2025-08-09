'use client';

import dynamic from 'next/dynamic';
import { LandingSkeleton } from "@/components/ui/landing-skeleton";

// Dynamically import the HomeContent component with SSR disabled and skeleton loading
const HomeContent = dynamic(() => import('../components/HomeContent'), { 
  ssr: false,
  loading: () => <LandingSkeleton />
});

export default function Home() {
  return <HomeContent />;
}
