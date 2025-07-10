"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");

  if (isAuthPage) {
    return null;
  }

  return <Navigation />;
} 