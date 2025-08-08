"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");

  // Don't show navigation on auth pages
  if (isAuthPage) {
    return null;
  }

  // Always show navigation for all other pages
  return <Navigation />;
}