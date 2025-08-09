'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/student/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active page when route changes
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('generate')) setActivePage('essay-generator');
    else if (path.includes('essays')) setActivePage('essay-history');
    else if (path.includes('paragraph-analyzer')) setActivePage('paragraph-analyzer');
    else if (path.includes('settings')) setActivePage('settings');
    else setActivePage('overview');
  }, []);

  // Handle session loading state
  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no session, redirect to sign-in
  if (!session) {
    if (typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">ESSAI</h1>
        <div className="w-6"></div> {/* For alignment */}
      </header>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0`}>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}