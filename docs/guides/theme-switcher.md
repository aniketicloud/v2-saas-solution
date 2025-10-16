# Theme Switcher Implementation

## Overview
This document describes the theme switching implementation using `next-themes` with a light/dark toggle switch.

## Architecture

### Components

#### 1. **ThemeProvider** (`components/theme-provider.tsx`)
- Wraps the Next.js app in the root layout
- Configuration:
  - `attribute="class"` - Uses Tailwind's class-based dark mode
  - `defaultTheme="light"` - App starts in light mode
  - `enableSystem={false}` - Disables system preference detection
  - `disableTransitionOnChange` - Prevents flash during theme switch

#### 2. **ThemeSwitcher** (`components/theme-switcher.tsx`)
Two variants available:

**a) Simple ThemeSwitcher (Default)**
```tsx
<ThemeSwitcher />
```
- Clean toggle button using shadcn Toggle component
- Sun icon ☀️ for light mode
- Moon icon 🌙 for dark mode
- Toggle pressed state indicates dark mode

**b) Compact ThemeSwitcher**
```tsx
<ThemeSwitcherCompact />
```
- Includes "Light"/"Dark" text label
- Shows current theme name
- Better for settings pages

### Integration Points

#### Root Layout (`app/layout.tsx`)
```tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  </body>
</html>
```

**Key attributes:**
- `suppressHydrationWarning` - Prevents React hydration warnings from theme flicker

#### Admin Layout (`app/(admin)/admin/layout.tsx`)
- Theme toggle placed in header (top right)
- Next to breadcrumb navigation
- Always visible and easily accessible
- Uses `ml-auto` to push to the right side

## How It Works

### 1. **User Preference Storage**
- `next-themes` automatically stores preference in `localStorage`
- Key: `theme`
- Values: `"light"` or `"dark"`
- Persists across sessions

### 2. **Theme Application**
- When theme is "dark", `next-themes` adds `class="dark"` to `<html>`
- Tailwind CSS applies dark mode styles via `.dark` class
- CSS variables in `globals.css` automatically switch colors

### 3. **Hydration Handling**
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <LoadingSkeleton />;
}
```

**Why?**
- Server renders with default theme
- Client may have different stored preference
- Prevents hydration mismatch by showing placeholder until client-side hydration completes

## Usage in Other Areas

### Add to any client component:
```tsx
"use client";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function MyComponent() {
  return (
    <div>
      <ThemeSwitcher />
    </div>
  );
}
```

### Programmatic theme control:
```tsx
"use client";
import { useTheme } from "@/hooks/use-theme";

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

## Component API

### ThemeSwitcher
```tsx
<ThemeSwitcher />
```
**Props:** None  
**Description:** Toggle button with sun/moon icon. Automatically manages theme state.

### ThemeSwitcherCompact
```tsx
<ThemeSwitcherCompact />
```
**Props:** None  
**Description:** Toggle button with current theme label. Better for settings pages.

## Best Practices Applied

### ✅ Modular Architecture
- Separate theme provider component
- Reusable theme switcher components
- Single responsibility principle

### ✅ User Experience
- No system preference interference (user controls theme explicitly)
- Preference persists across sessions
- No flash of unstyled content (FOUC)
- Smooth transitions between themes
- Loading state prevents hydration issues

### ✅ Accessibility
- `aria-label="Toggle theme"` on switch
- Visual indicators (icons) for current state
- Keyboard accessible (Switch component)

### ✅ Performance
- `disableTransitionOnChange` prevents unnecessary re-renders
- Lightweight localStorage for persistence
- No server-side theme detection overhead

## Extending to Other Layouts

To add theme switcher to other areas (user dashboard, organization pages):

1. **Import the component:**
```tsx
import { ThemeSwitcher } from "@/components/theme-switcher";
```

2. **Add to layout/component:**
```tsx
<ThemeSwitcher />
// or
<ThemeSwitcherLabeled />
```

3. **No additional setup needed** - ThemeProvider in root layout covers all routes

## Troubleshooting

### Issue: Theme flickers on page load
**Solution:** Ensure `suppressHydrationWarning` is on `<html>` tag

### Issue: Theme not persisting
**Solution:** Check localStorage is enabled in browser

### Issue: Hydration mismatch error
**Solution:** Use `mounted` state pattern shown in components

## Configuration Reference

### ThemeProvider Props
```tsx
{
  attribute: "class",              // How to apply theme (class vs data-attribute)
  defaultTheme: "light",           // Initial theme
  enableSystem: false,             // Disable system preference
  disableTransitionOnChange: true, // Prevent transition flash
  storageKey: "theme"              // localStorage key (default)
}
```

## Related Files
- `app/layout.tsx` - Root layout with ThemeProvider
- `app/(admin)/admin/layout.tsx` - Admin header with theme toggle
- `app/globals.css` - Theme color definitions
- `components/theme-provider.tsx` - Provider wrapper
- `components/theme-switcher.tsx` - Toggle components
- `components/ui/toggle.tsx` - shadcn Toggle component
- `hooks/use-theme.ts` - Centralized theme hook
