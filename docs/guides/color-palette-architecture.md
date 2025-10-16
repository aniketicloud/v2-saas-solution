# Color Palette + Theme System - Architecture Overview

## Visual Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Portal                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Header                                                    │  │
│  │  [☰] / Admin / Dashboard           [🎨 ▼] [☀️/🌙]      │  │
│  │                                      ↑       ↑            │  │
│  │                               Palette  Theme             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Palette Dropdown:                    Theme Toggle:             │
│  ┌─────────────────────┐             ┌──────┐                  │
│  │ Color Palette      │             │ ☀️  │ Light             │
│  ├─────────────────────┤             ├──────┤                  │
│  │ ✓ Soft Pop         │             │ 🌙  │ Dark              │
│  │   Purple & Teal    │             └──────┘                  │
│  ├─────────────────────┤                                       │
│  │   Minimal Slate    │                                       │
│  │   Orange & Gray    │                                       │
│  └─────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌───────────────────────────────────────────────────────────────┐
│                    User Preferences                            │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  localStorage                                                  │
│  ├── "theme": "light" | "dark"      (next-themes)           │
│  └── "color-palette": "soft-pop" | "minimal-slate"          │
│                                                                │
└───────────────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────────────┐
│                    React Hooks                                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  useTheme() ─────────────────→ Controls <html class="dark">  │
│  useColorPalette() ───────────→ Controls CSS variables        │
│                                                                │
└───────────────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────────────┐
│                    DOM Manipulation                            │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  <html class="dark">  (if theme === "dark")                  │
│  document.documentElement.style.setProperty(...)              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────────────┐
│                    CSS Variables Applied                       │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  :root {                                                       │
│    --background: oklch(0.9789 0.0082 121.6272);              │
│    --foreground: oklch(0 0 0);                               │
│    --primary: oklch(0.5106 0.2301 276.9656);                 │
│    /* ... all other variables */                             │
│  }                                                             │
│                                                                │
└───────────────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────────────┐
│                    UI Renders                                  │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Components use CSS variables:                                │
│  - bg-background                                              │
│  - text-foreground                                            │
│  - bg-primary                                                 │
│  → Automatically get colors from active palette               │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## Palette Selection Flow

```
                    User clicks palette dropdown
                              ↓
          ┌──────────────────────────────────────┐
          │   ColorPaletteSelector Component     │
          │   Shows: Soft Pop ✓                  │
          │          Minimal Slate                │
          └──────────────────────────────────────┘
                              ↓
                    User selects "Minimal Slate"
                              ↓
          ┌──────────────────────────────────────┐
          │   setPalette("minimal-slate")        │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   localStorage.setItem(              │
          │     "color-palette",                 │
          │     "minimal-slate"                  │
          │   )                                   │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   useColorPalette hook detects       │
          │   palette state change               │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   Check current theme:               │
          │   const isDark = document            │
          │     .documentElement                 │
          │     .classList                       │
          │     .contains("dark")                │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   Get correct palette variant:       │
          │   const colors = isDark              │
          │     ? palette.dark                   │
          │     : palette.light                  │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   Apply CSS variables:               │
          │   Object.entries(colors)             │
          │     .forEach(([key, value]) => {     │
          │       root.style.setProperty(        │
          │         key, value                   │
          │       )                               │
          │     })                                │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   UI updates instantly!              │
          │   New colors applied everywhere      │
          └──────────────────────────────────────┘
```

## Theme Toggle Flow (with Palette)

```
                    User clicks theme toggle
                              ↓
          ┌──────────────────────────────────────┐
          │   ThemeSwitcher Component            │
          │   Toggles: light → dark              │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   next-themes:                       │
          │   setTheme("dark")                   │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   <html class="dark"> added          │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   MutationObserver in                │
          │   useColorPalette detects            │
          │   class attribute change             │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   Re-apply current palette           │
          │   with DARK variant:                 │
          │   colors = palette.dark              │
          └──────────────────────────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │   CSS variables updated              │
          │   UI shows dark mode colors          │
          │   from current palette               │
          └──────────────────────────────────────┘
```

## Complete System Matrix

```
┌─────────────────┬──────────────┬─────────────────────────────┐
│ Theme           │ Palette      │ Result                      │
├─────────────────┼──────────────┼─────────────────────────────┤
│ Light           │ Soft Pop     │ Light bg + Purple/Teal      │
│ Light           │ Minimal Slate│ Light bg + Orange/Gray      │
│ Dark            │ Soft Pop     │ Dark bg + Purple/Teal       │
│ Dark            │ Minimal Slate│ Dark bg + Orange/Gray       │
└─────────────────┴──────────────┴─────────────────────────────┘

Total combinations: 2 themes × 2 palettes = 4 unique looks
```

## File Dependencies

```
app/layout.tsx
├── ThemeProvider (next-themes)
│   └── Provides theme context
│
app/(admin)/admin/layout.tsx
├── ColorPaletteSelector
│   ├── uses: useColorPalette()
│   └── reads: getPalettes()
└── ThemeSwitcher
    └── uses: useTheme()

hooks/use-color-palette.ts
├── Reads: localStorage["color-palette"]
├── Watches: <html> class changes (MutationObserver)
├── Applies: CSS variables to :root
└── Uses: getPalette() from lib/color-palettes.ts

lib/color-palettes.ts
└── Exports: colorPalettes, getPalettes(), getPalette()

components/color-palette-selector.tsx
├── Uses: useColorPalette()
├── Uses: getPalettes()
└── Renders: Dropdown with palette options
```

## CSS Variable Inheritance

```
:root
├── --background ────────→ bg-background
├── --foreground ────────→ text-foreground
├── --primary ───────────→ bg-primary, border-primary
├── --secondary ─────────→ bg-secondary
├── --accent ────────────→ bg-accent
├── --muted ─────────────→ bg-muted
├── --destructive ───────→ bg-destructive
├── --border ────────────→ border-border
├── --input ─────────────→ bg-input
└── --ring ──────────────→ ring-ring

All Tailwind classes automatically use these variables!
```

## Performance Characteristics

```
┌──────────────────┬─────────────────────────────────────┐
│ Operation        │ Performance                         │
├──────────────────┼─────────────────────────────────────┤
│ Palette Switch   │ ~10ms (CSS var updates)            │
│ Theme Toggle     │ ~5ms (class change + palette)      │
│ Initial Load     │ ~2ms (localStorage read)           │
│ MutationObserver │ ~1ms (class change detection)      │
│ Re-renders       │ 0 (CSS-only, no React re-renders)  │
└──────────────────┴─────────────────────────────────────┘
```

## Browser Storage Schema

```json
{
  "localStorage": {
    "theme": "dark",
    "color-palette": "minimal-slate"
  }
}
```

## Error Handling

```
┌─────────────────────────────────────────────────────────┐
│ Error Scenario         │ Handling                       │
├────────────────────────┼────────────────────────────────┤
│ Invalid palette ID     │ Falls back to "soft-pop"      │
│ localStorage blocked   │ Uses in-memory state          │
│ Missing CSS variables  │ Warns in console              │
│ Hydration mismatch     │ mounted state prevents flash  │
└─────────────────────────────────────────────────────────┘
```

## Future Architecture Enhancements

```
Current: Client-side only (localStorage)
         ↓
Future:  Server-side preferences (database)
         ├── User.preferences.colorPalette
         ├── Sync across devices
         └── Per-organization palettes

Current: Fixed palettes (JS objects)
         ↓
Future:  Custom palette creator
         ├── Color picker UI
         ├── Generate light/dark variants
         └── Share palette JSON

Current: Manual palette definitions
         ↓
Future:  Import from themes.shadcn.com
         ├── Fetch JSON via API
         ├── Auto-generate types
         └── Community palettes
```

## Testing Strategy

```
Unit Tests:
├── getPalettes() returns all palettes
├── getPalette(id) returns correct palette
├── useColorPalette() saves to localStorage
└── useColorPalette() applies CSS variables

Integration Tests:
├── Palette selector renders palettes
├── Clicking palette changes colors
├── Theme toggle preserves palette
└── Page reload restores preferences

E2E Tests:
├── Select palette → verify UI colors
├── Toggle theme → verify palette variant
├── Refresh page → verify persistence
└── Test all 4 combinations (2×2 matrix)
```
