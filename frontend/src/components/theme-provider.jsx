"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function SystemThemeWatcher() {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const syncSystemTheme = () => {
      let storedTheme = null;
      try {
        storedTheme = localStorage.getItem("theme");
      } catch (err) {
        // ignore storage error
      }

      if (storedTheme === "system" || !storedTheme || theme === "system") {
        const isDark = media.matches;
        const root = document.documentElement;
        if (isDark) {
          root.classList.add("dark");
          root.classList.remove("light");
          root.style.colorScheme = "dark";
        } else {
          root.classList.remove("dark");
          root.classList.add("light");
          root.style.colorScheme = "light";
        }
      }
    };

    // Modern event listener with legacy fallback
    if (media.addEventListener) {
      media.addEventListener("change", syncSystemTheme);
    } else if (media.addListener) {
      media.addListener(syncSystemTheme);
    }

    // Sync on mount / refresh
    syncSystemTheme();

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", syncSystemTheme);
      } else if (media.removeListener) {
        media.removeListener(syncSystemTheme);
      }
    };
  }, [theme]);

  return null;
}

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>
      <SystemThemeWatcher />
      {children}
    </NextThemesProvider>
  );
}
