"use client";

import { Palette, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useColorPalette } from "@/hooks/use-color-palette";
import { getPalettes } from "@/lib/color-palettes";
import { useState, useEffect } from "react";

/**
 * Color Palette Selector Component
 *
 * Dropdown menu to select from available color palettes.
 * Persists selection to localStorage and applies CSS variables dynamically.
 *
 * @example
 * ```tsx
 * <ColorPaletteSelector />
 * ```
 */
export function ColorPaletteSelector() {
  const { palette, setPalette, mounted } = useColorPalette();
  const [palettes] = useState(() => getPalettes());

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const currentPalette = palettes.find((p) => p.id === palette);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Select color palette"
          className="h-9 w-9 p-0"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Color Palette</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {palettes.map((paletteOption) => (
          <DropdownMenuItem
            key={paletteOption.id}
            onClick={() => setPalette(paletteOption.id)}
            className="flex items-start gap-2 cursor-pointer"
          >
            <div className="flex h-4 w-4 items-center justify-center mt-0.5">
              {palette === paletteOption.id && <Check className="h-4 w-4" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{paletteOption.name}</span>
              <span className="text-xs text-muted-foreground">
                {paletteOption.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact Color Palette Selector
 *
 * Includes current palette name label.
 * Better for settings pages.
 *
 * @example
 * ```tsx
 * <ColorPaletteSelectorCompact />
 * ```
 */
export function ColorPaletteSelectorCompact() {
  const { palette, setPalette, mounted } = useColorPalette();
  const [palettes] = useState(() => getPalettes());

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Palette</span>
        <Button variant="outline" size="sm" disabled>
          <Palette className="h-4 w-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  const currentPalette = palettes.find((p) => p.id === palette);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Palette</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            {currentPalette?.name || "Select"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Color Palette</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {palettes.map((paletteOption) => (
            <DropdownMenuItem
              key={paletteOption.id}
              onClick={() => setPalette(paletteOption.id)}
              className="flex items-start gap-2 cursor-pointer"
            >
              <div className="flex h-4 w-4 items-center justify-center mt-0.5">
                {palette === paletteOption.id && <Check className="h-4 w-4" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{paletteOption.name}</span>
                <span className="text-xs text-muted-foreground">
                  {paletteOption.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
