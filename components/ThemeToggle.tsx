"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 opacity-0" aria-hidden="true" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-surface/50 text-muted hover:border-primary/50 hover:text-primary transition-colors hover:shadow-sm"
      aria-label="Cambiar tema"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.1 }}
        >
          {isDark ? (
             <Moon className="h-4 w-4" />
          ) : (
             <Sun className="h-4 w-4" />
          )}
        </m.div>
      </AnimatePresence>
      <span className="sr-only">Cambiar tema</span>
    </button>
  );
}
