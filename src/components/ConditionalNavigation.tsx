"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");
  const isDashboard = pathname.startsWith("/dashboard");

  // Don't show navigation on auth pages
  if (isAuthPage) {
    return null;
  }

  // For the dashboard, the navigation is handled by the dashboard layout
  if (isDashboard) {
    return null;
  }

  // Show navigation for all other pages (landing, pricing, contact, etc.)
  return <Navigation />;
}