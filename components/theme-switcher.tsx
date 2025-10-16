"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Toggle } from "@/components/ui/toggle";
import { useEffect, useState } from "react";

/**
 * Theme Switcher Component
 *
 * A toggle button for light/dark theme with visual icon.
 * Persists user preference in localStorage via next-themes.
 *
 * @example
 * ```tsx
 * <ThemeSwitcher />
 * ```
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Toggle size="sm" disabled aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Toggle>
    );
  }

  const isDark = theme === "dark";

  return (
    <Toggle
      size="sm"
      pressed={isDark}
      onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Toggle>
  );
}

/**
 * Compact Theme Switcher with Label
 *
 * Theme toggle with small label for settings pages.
 *
 * @example
 * ```tsx
 * <ThemeSwitcherCompact />
 * ```
 */
export function ThemeSwitcherCompact() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Theme</span>
        <Toggle size="sm" disabled aria-label="Toggle theme">
          <Sun className="h-4 w-4" />
        </Toggle>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {isDark ? "Dark" : "Light"}
      </span>
      <Toggle
        size="sm"
        pressed={isDark}
        onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Toggle>
    </div>
  );
}
