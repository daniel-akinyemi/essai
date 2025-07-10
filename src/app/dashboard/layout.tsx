'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/student/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onPageChange={setActivePage}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}