'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentTopNav from '@/components/student/StudentTopNav';

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
        <StudentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onPageChange={setActivePage}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Top navigation */}
          <StudentTopNav
            onMenuClick={() => setSidebarOpen(true)}
            user={session?.user}
            onSignOut={() => signOut({ callbackUrl: '/' })}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}