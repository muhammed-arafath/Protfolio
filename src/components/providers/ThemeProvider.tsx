"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { safeGet, safeSet } from "@/lib/storage";

type Theme = "dark" | "light";
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = document.documentElement.dataset.theme as Theme | undefined;
    if (t === "light" || t === "dark") setTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      safeSet("local", "theme", next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);

/** Inline script that sets the theme before paint (no flash). Off-white (light) is the default. */
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'light'}catch(e){document.documentElement.dataset.theme='light'}})();`;

// re-export for callers that only need to read storage
export { safeGet };
