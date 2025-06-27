'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import StudentSidebar from "./StudentSidebar";
import StudentTopNav from "./StudentTopNav";
import StudentMainContent from "./StudentMainContent";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the student dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onPageChange={setActivePage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <StudentTopNav 
          onMenuClick={() => setSidebarOpen(true)}
          user={session.user}
          onSignOut={() => signOut({ callbackUrl: '/' })}
        />

        {/* Main Content */}
        <StudentMainContent activePage={activePage} />
      </div>
    </div>
  );
} 