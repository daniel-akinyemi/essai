import { redirect } from "next/navigation";

export default function DashboardPage() {
  // For now, redirect to student dashboard
  // Later this can be updated to show role-based routing
  redirect('/dashboard/student');
} 