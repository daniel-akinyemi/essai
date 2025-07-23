'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Dashboard component with SSR disabled
const Dashboard = dynamic(() => import('@/components/Dashboard'), { 
  ssr: false,
  loading: () => <div>Loading dashboard...</div>
});

export default function DashboardPage() {
  return <Dashboard />;
}