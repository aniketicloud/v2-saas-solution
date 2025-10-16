"use client";

import { useEffect, useState } from "react";
import type { PaletteId } from "@/lib/color-palettes";
import { getPalette } from "@/lib/color-palettes";

const STORAGE_KEY = "color-palette";
const DEFAULT_PALETTE: PaletteId = "default";

/**
 * Hook to manage color palette selection
 *
 * Applies CSS variables dynamically and persists preference to localStorage.
 * Works in conjunction with the theme (light/dark) hook.
 *
 * @example
 * ```tsx
 * const { palette, setPalette, palettes } = useColorPalette();
 *
 * // Change palette
 * setPalette("minimal-slate");
 * ```
 */
export function useColorPalette() {
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE);
  const [mounted, setMounted] = useState(false);

  // Load saved palette on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as PaletteId | null;
    if (saved && getPalette(saved)) {
      setPaletteState(saved);
    }
    setMounted(true);
  }, []);

  // Apply palette CSS variables when palette changes
  useEffect(() => {
    if (!mounted) return;

    const paletteData = getPalette(palette);
    if (!paletteData) return;

    // Determine if we're in dark mode
    const isDark = document.documentElement.classList.contains("dark");
    const colors = isDark ? paletteData.dark : paletteData.light;

    // Apply CSS variables to :root
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [palette, mounted]);

  // Also listen for theme changes (light/dark) to reapply correct palette
  useEffect(() => {
    if (!mounted) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          // Re-apply palette when theme changes
          const paletteData = getPalette(palette);
          if (!paletteData) return;

          const isDark = document.documentElement.classList.contains("dark");
          const colors = isDark ? paletteData.dark : paletteData.light;

          const root = document.documentElement;
          Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
          });
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [palette, mounted]);

  const setPalette = (newPalette: PaletteId) => {
    setPaletteState(newPalette);
    localStorage.setItem(STORAGE_KEY, newPalette);
  };

  return {
    palette,
    setPalette,
    mounted,
  };
}
