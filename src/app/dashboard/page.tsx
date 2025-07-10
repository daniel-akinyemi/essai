import dynamic from 'next/dynamic';

// Dynamically import the new Dashboard (App) component for SSR compatibility
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });

export default function DashboardPage() {
  return <Dashboard />;
} 