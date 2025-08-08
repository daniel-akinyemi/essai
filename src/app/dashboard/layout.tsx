'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/student/Sidebar';
import TopNav from '@/components/student/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
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
    window.location.href = '/auth/signin';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <TopNav 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        user={session.user || undefined} 
        onSignOut={() => signOut({ callbackUrl: '/' })}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown when sidebarOpen is true */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activePage={activePage}
            onPageChange={setActivePage}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}