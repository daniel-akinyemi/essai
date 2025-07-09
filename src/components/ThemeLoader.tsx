"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ThemeLoader() {
  const { data: session } = useSession();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadTheme = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("user_settings")
        .select("theme")
        .eq("user_id", session.user.id)
        .single();
      if (data?.theme) {
        document.body.classList.remove("light", "dark");
        if (data.theme === "dark" || data.theme === "light") {
          document.body.classList.add(data.theme);
        }
      }
    };
    loadTheme();
  }, [session?.user?.id, supabase]);

  return null;
} 