# Color Palette System - Quick Start

## What Was Implemented

✅ **Dynamic color palette switcher** in Admin header  
✅ **Three palettes available**: Default, Tangerine, and Twitter  
✅ **Works with light/dark themes** - Each palette has both variants  
✅ **Persists user preference** in localStorage  
✅ **Modular, extensible system** - Easy to add new palettes  

## Files Created

1. **`lib/color-palettes.ts`** - Palette definitions and utilities
2. **`hooks/use-color-palette.ts`** - Palette management hook
3. **`components/color-palette-selector.tsx`** - Dropdown UI component
4. **`docs/guides/color-palette-system.md`** - Complete documentation

## Files Modified

1. **`app/(admin)/admin/layout.tsx`** - Added palette selector to header

## Visual Layout

```
┌──────────────────────────────────────────────────┐
│ [☰] / Admin / Dashboard        [🎨] [☀️]       │
│                                  ↑    ↑          │
│                            Palette Theme         │
└──────────────────────────────────────────────────┘
```

## How to Use

### 1. Switch Palettes
1. Run: `pnpm dev`
2. Login as admin → Go to `/admin/dashboard`
3. Click the **🎨 Palette icon** in top-right header
4. Select a palette:
   - **Default** - Clean neutral gray (original theme)
   - **Tangerine** - Warm orange with slate gray
   - **Twitter** - Twitter-inspired blue with modern styling

### 2. Palette + Theme Combinations
Try all 6 combinations:

| Theme | Palette | Result |
|-------|---------|--------|
| Light | Default | Clean light gray & subtle accents |
| Dark | Default | Elegant dark gray & soft highlights |
| Light | Tangerine | Light background & warm orange |
| Dark | Tangerine | Dark slate & vibrant orange |
| Light | Twitter | Bright white & Twitter blue |
| Dark | Twitter | Pure black & bright blue |

### 3. Persistence
- **Palette preference** saved in localStorage
- **Theme preference** (light/dark) saved separately
- Both persist across page reloads and sessions

## Component Variants

### Simple Dropdown (Default)
```tsx
import { ColorPaletteSelector } from "@/components/color-palette-selector";

<ColorPaletteSelector />
```
- Palette icon (🎨)
- Dropdown menu
- Minimal design

### Compact with Label
```tsx
import { ColorPaletteSelectorCompact } from "@/components/color-palette-selector";

<ColorPaletteSelectorCompact />
```
- Shows current palette name
- Better for settings pages

## Programmatic Usage

```tsx
"use client";
import { useColorPalette } from "@/hooks/use-color-palette";

export function MyComponent() {
  const { palette, setPalette } = useColorPalette();
  
  return (
    <div>
      <p>Current: {palette}</p>
      <button onClick={() => setPalette("tangerine")}>
        Switch Palette
      </button>
    </div>
  );
}
```

## How It Works

### Color System Flow
```
1. User selects palette from dropdown
      ↓
2. Hook saves to localStorage
      ↓
3. Hook checks current theme (light/dark)
      ↓
4. Hook applies correct palette.light or palette.dark
      ↓
5. CSS variables updated on :root
      ↓
6. UI updates instantly (no reload)
```

### Theme + Palette Integration
```
Theme (Light/Dark)     Palette (Soft Pop/Minimal Slate)
        ↓                           ↓
    <html class="dark">       localStorage: "minimal-slate"
        ↓                           ↓
    CSS .dark selector       JavaScript applies CSS vars
        ↓                           ↓
        └─────────┬─────────────────┘
                  ↓
        Final rendered colors
```

## Adding New Palettes

### Step 1: Define Colors
Edit `lib/color-palettes.ts`:

```typescript
export type PaletteId = "soft-pop" | "minimal-slate" | "your-palette";

export const colorPalettes = {
  // ... existing
  "your-palette": {
    id: "your-palette",
    name: "Your Palette",
    description: "Your description",
    light: { /* CSS variables */ },
    dark: { /* CSS variables */ },
  },
};
```

### Step 2: Test
```bash
pnpm dev
# Palette automatically appears in dropdown!
```

## Key Features

### ✨ Smart Color Management
- Palettes work with any theme (light/dark)
- Instant switching (no page reload)
- Smooth transitions

### 💾 Persistent Preferences
- localStorage: `"color-palette"` (palette ID)
- localStorage: `"theme"` (light/dark)
- Both work independently

### 🎨 Extensible System
- Add palettes by editing one file
- No component changes needed
- Type-safe palette IDs

### ♿ Accessible
- Keyboard navigation
- ARIA labels
- Visual feedback (checkmark)

## Use Cases

### Admin Portal
- **Current**: Header (always visible)
- **Access**: Top-right, next to theme toggle

### User Dashboard
Add to layout:
```tsx
import { ColorPaletteSelector } from "@/components/color-palette-selector";

<header>
  <ColorPaletteSelector />
</header>
```

### Settings Page
Use compact version:
```tsx
import { ColorPaletteSelectorCompact } from "@/components/color-palette-selector";

<div className="settings-row">
  <ColorPaletteSelectorCompact />
</div>
```

## Troubleshooting

### Colors not changing?
1. Check browser console for errors
2. Verify `"use client"` on parent component
3. Clear localStorage: `localStorage.removeItem("color-palette")`

### Palette not persisting?
1. Check localStorage is enabled
2. Open DevTools → Application → Local Storage
3. Should see `color-palette` key

### Hydration mismatch?
Wait for `mounted` state:
```tsx
const { mounted } = useColorPalette();
if (!mounted) return <Loading />;
```

## Next Steps

🎨 **Add more palettes** - Edit `lib/color-palettes.ts`  
📱 **Add to other layouts** - Import component anywhere  
⚙️ **Custom palette creator** - Future enhancement  
🗄️ **Database storage** - Store per-user preferences  

## Documentation

- **Quick Start** (this file): `docs/COLOR_PALETTE_QUICK_START.md`
- **Complete Guide**: `docs/guides/color-palette-system.md`
- **Theme Switcher**: `docs/THEME_SWITCHER_SUMMARY.md`

---

**Try it now!** Click the 🎨 icon in the admin header and watch the colors change! 🌈
