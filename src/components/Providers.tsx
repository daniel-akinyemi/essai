'use client';

import { SessionProvider } from 'next-auth/react';
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
  const [theme, setTheme] = useState("system");

  // Apply theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "light" || theme === "dark") {
      root.classList.add(theme);
    }
  }, [theme]);

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