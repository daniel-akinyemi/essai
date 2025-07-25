'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from "react";
 
// Theme context
const ThemeContext = createContext({
  theme: "system",
  setTheme: (t: string) => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("system");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ensure we're in the browser before applying theme
  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or system preference
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'system' : 'system';
    setTheme(savedTheme);
  }, []);

  // Apply theme to <html> element
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "light" || theme === "dark") {
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    } else {
      // Handle system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
      localStorage.removeItem('theme');
    }
  }, [theme, mounted]);

  // Force re-render on route change to prevent hydration issues
  useEffect(() => {
    if (mounted) {
      // This forces a re-render when route changes
      window.dispatchEvent(new Event('visibilitychange'));
    }
  }, [pathname, searchParams, mounted]);

  if (!mounted) {
    return <>{children}</>; // Return children without theme provider during SSR
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}