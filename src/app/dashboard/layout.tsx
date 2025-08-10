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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-0">
        {/* Mobile header - now inside main content area */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-2.5 flex items-center sticky top-0 z-30 -ml-0.5">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">ESSAI</h1>
          </div>
          <div className="flex-1"></div> {/* This pushes the logo and menu to the left */}
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 -mt-px">
          {children}
        </main>
      </div>
    </div>
  );
}