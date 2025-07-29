'use client';

import dynamic from 'next/dynamic';
import DashboardSkeleton from '@/components/ui/dashboard-skeleton';

// Dynamically import the Dashboard component with SSR disabled
const Dashboard = dynamic(() => import('@/components/Dashboard'), { 
  ssr: false,
  loading: () => <DashboardSkeleton />
});

export default function DashboardPage() {
  return <Dashboard />;
}