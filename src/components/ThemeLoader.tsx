"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ThemeLoader() {
  const { data: session } = useSession();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadTheme = async () => {
      if (!session?.user) return;
      const res = await fetch('/api/user-settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.theme) {
        document.body.classList.remove("light", "dark");
        if (data.theme === "dark" || data.theme === "light") {
          document.body.classList.add(data.theme);
        }
      }
    };
    loadTheme();
  }, [session?.user]);

  return null;
} 