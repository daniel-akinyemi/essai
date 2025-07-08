'use client';

import { useSession } from "next-auth/react";
import StudentMainContent from "./StudentMainContent";

export default function StudentDashboard() {
  const { data: session } = useSession();

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

  return <StudentMainContent activePage="overview" userName={session.user?.name} />;
} 