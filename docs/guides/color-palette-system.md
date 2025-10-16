# Color Palette System - Complete Guide

## Overview
Dynamic color palette system that allows users to switch between different color schemes. Works independently with the light/dark theme system - each palette has both light and dark variants.

## Architecture

### Files Structure
```
lib/
  └── color-palettes.ts          # Palette definitions
hooks/
  └── use-color-palette.ts       # Palette management hook
components/
  └── color-palette-selector.tsx # Dropdown UI component
```

## How It Works

### 1. Color Palette Definition (`lib/color-palettes.ts`)

Each palette contains:
- **ID**: Unique identifier (e.g., "soft-pop", "minimal-slate")
- **Name**: Display name for the UI
- **Description**: Brief description of the palette
- **Light**: CSS variables for light mode
- **Dark**: CSS variables for dark mode

```typescript
export interface ColorPalette {
  id: PaletteId;
  name: string;
  description: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}
```

### 2. Available Palettes

#### **Default**
- **Primary**: Neutral dark gray
- **Secondary**: Light gray
- **Accent**: Subtle gray tones
- **Style**: Clean and professional (original theme)
- **Border Radius**: 0.625rem

#### **Tangerine**
- **Primary**: Warm orange
- **Secondary**: Slate gray
- **Accent**: Subtle purple
- **Style**: Warm and inviting
- **Border Radius**: 0.75rem

#### **Twitter**
- **Primary**: Twitter blue
- **Secondary**: Dark gray/white
- **Accent**: Light blue
- **Style**: Modern and social
- **Border Radius**: 1.3rem (extra rounded)

### 3. Palette Management Hook (`hooks/use-color-palette.ts`)

```tsx
const { palette, setPalette, mounted } = useColorPalette();
```

**Features:**
- ✅ Persists to localStorage (key: `"color-palette"`)
- ✅ Applies CSS variables dynamically to `:root`
- ✅ Listens for theme changes (light/dark) and reapplies palette
- ✅ SSR-safe with mounted state

**How it works:**
1. Loads saved palette from localStorage on mount
2. Applies correct color variables based on current theme (light/dark)
3. Watches for theme changes via MutationObserver
4. Re-applies palette colors when theme toggles

### 4. UI Component (`components/color-palette-selector.tsx`)

Two variants:

#### **ColorPaletteSelector** (Default)
```tsx
<ColorPaletteSelector />
```
- Palette icon button (🎨)
- Dropdown with all available palettes
- Checkmark shows current selection
- Clean, minimal design

#### **ColorPaletteSelectorCompact**
```tsx
<ColorPaletteSelectorCompact />
```
- Includes current palette name
- Better for settings pages
- More descriptive UI

## Integration

### Admin Layout
Located in header (top-right), next to theme switcher:

```tsx
// app/(admin)/admin/layout.tsx
<header>
  <AdminBreadcrumb />
  <div className="ml-auto flex items-center gap-1">
    <ColorPaletteSelector />  {/* Palette dropdown */}
    <ThemeSwitcher />         {/* Light/Dark toggle */}
  </div>
</header>
```

## Usage Examples

### Basic Usage
```tsx
"use client";
import { ColorPaletteSelector } from "@/components/color-palette-selector";

export function MyComponent() {
  return <ColorPaletteSelector />;
}
```

### Programmatic Control
```tsx
"use client";
import { useColorPalette } from "@/hooks/use-color-palette";

export function MyComponent() {
  const { palette, setPalette } = useColorPalette();
  
  return (
    <div>
      <p>Current: {palette}</p>
      <button onClick={() => setPalette("minimal-slate")}>
        Switch to Minimal Slate
      </button>
    </div>
  );
}
```

### Get All Palettes
```tsx
import { getPalettes, getPalette } from "@/lib/color-palettes";

const palettes = getPalettes(); // Array of all palettes
const softPop = getPalette("soft-pop"); // Get specific palette
```

## How Theme & Palette Work Together

```
User State:
├── Theme: "light" | "dark"        (via next-themes)
└── Palette: "soft-pop" | "minimal-slate"  (via useColorPalette)

Rendering:
1. Theme sets <html class="dark"> or <html> (no class)
2. Palette hook detects theme via MutationObserver
3. Applies correct palette.light or palette.dark CSS variables
4. All components use CSS variables (--primary, --background, etc.)
```

### Example Flow:
```
User clicks theme toggle (Light → Dark)
      ↓
next-themes adds "dark" class to <html>
      ↓
MutationObserver in useColorPalette detects class change
      ↓
Hook applies palette.dark CSS variables to :root
      ↓
UI updates with dark mode colors from current palette
```

## Adding New Palettes

### 1. Define the Palette
Add to `lib/color-palettes.ts`:

```typescript
export type PaletteId = "soft-pop" | "minimal-slate" | "ocean-breeze"; // Add new ID

export const colorPalettes: Record<PaletteId, ColorPalette> = {
  // ... existing palettes
  "ocean-breeze": {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    description: "Cool blues and teals",
    light: {
      "--background": "oklch(...)",
      "--foreground": "oklch(...)",
      // ... all required CSS variables
    },
    dark: {
      "--background": "oklch(...)",
      "--foreground": "oklch(...)",
      // ... all required CSS variables
    },
  },
};
```

### 2. Required CSS Variables
Each palette must define both light and dark variants for:

**Colors:**
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--chart-1` through `--chart-5`

**Sidebar:**
- `--sidebar`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

**Optional:**
- `--radius` (border radius)
- `--font-sans`, `--font-serif`, `--font-mono`
- Shadow variables

### 3. Test the Palette
```bash
pnpm dev
# Click palette dropdown → Select new palette
# Toggle light/dark theme → Verify colors change correctly
```

## Best Practices

### ✅ Do's
- Define both light and dark variants for every palette
- Use meaningful palette IDs (kebab-case)
- Provide clear descriptions
- Test with both light and dark themes
- Ensure sufficient contrast ratios (WCAG compliance)

### ❌ Don'ts
- Don't skip CSS variables (app will break)
- Don't use system theme preferences (we manage manually)
- Don't modify globals.css for palette changes
- Don't hardcode colors in components

## Persistence

### Storage
- **Key**: `"color-palette"`
- **Location**: `localStorage`
- **Scope**: Per-domain
- **Values**: PaletteId strings

### Loading Order
```
1. Page loads → useColorPalette mounts
2. Hook reads localStorage
3. Hook applies saved palette (or default)
4. Hook checks current theme (light/dark)
5. Hook applies correct palette variant
6. UI renders with palette colors
```

## Troubleshooting

### Issue: Palette not persisting
**Solution:** Check localStorage is enabled in browser

### Issue: Colors don't change when switching palettes
**Solution:** 
1. Check browser console for errors
2. Verify all CSS variables are defined
3. Ensure component has `"use client"` directive

### Issue: Theme toggle breaks palette
**Solution:** MutationObserver should handle this automatically. Check if `useColorPalette` is mounted.

### Issue: Hydration mismatch
**Solution:** Use `mounted` state from hook before rendering palette-dependent content

## Performance

- ✅ **Lightweight**: Only stores palette ID (string)
- ✅ **No re-renders**: CSS variables applied via DOM API
- ✅ **Efficient**: MutationObserver only watches class changes
- ✅ **Fast switching**: Instant color updates (no page reload)

## Accessibility

- ✅ **ARIA labels**: Dropdown has proper labels
- ✅ **Keyboard navigation**: Fully accessible via keyboard
- ✅ **Visual feedback**: Checkmark shows current selection
- ✅ **Descriptive**: Each palette has name + description
- ⚠️ **Color contrast**: Ensure palettes meet WCAG AA standards

## Future Enhancements

Possible additions:
- 🎨 Custom palette creator
- 💾 User-specific palettes (stored in database)
- 🔄 Import/export palettes
- 👁️ Live preview in dropdown
- 📊 Palette analytics (most popular)
- 🌈 Gradient palettes
- 🎯 Preset palettes by category (business, playful, minimal, etc.)

## Related Files
- `lib/color-palettes.ts` - Palette definitions
- `hooks/use-color-palette.ts` - Palette management hook
- `components/color-palette-selector.tsx` - UI component
- `app/(admin)/admin/layout.tsx` - Integration point
- `app/globals.css` - Base CSS variables (for reference)
