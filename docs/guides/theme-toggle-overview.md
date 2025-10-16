# Theme Toggle - Component Overview

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Portal                                                 │
│ ┌─────────────┐                                             │
│ │   Sidebar   │  ┌───────────────────────────────────────┐ │
│ │             │  │ Header                                 │ │
│ │ ☰ Admin     │  │ [☰] / Admin / Dashboard      [☀️]     │ │
│ │             │  │                                ^       │ │
│ │ Dashboard   │  │                                │       │ │
│ │ Orgs        │  │                         Theme Toggle   │ │
│ │ Users       │  └───────────────────────────────────────┘ │
│ │             │  ┌───────────────────────────────────────┐ │
│ │             │  │                                        │ │
│ │             │  │   Page Content                         │ │
│ │             │  │                                        │ │
│ │             │  │                                        │ │
│ │             │  └───────────────────────────────────────┘ │
│ │ [User]      │                                            │
│ └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AdminLayout
├── SidebarProvider
│   ├── AdminSidebar
│   │   ├── SidebarHeader (Admin Portal branding)
│   │   ├── SidebarContent (Navigation items)
│   │   └── SidebarFooter (User dropdown)
│   │
│   └── SidebarInset
│       ├── Header
│       │   ├── SidebarTrigger (☰ button)
│       │   ├── Separator
│       │   ├── AdminBreadcrumb (navigation path)
│       │   └── ThemeSwitcher ← HERE (ml-auto pushes right)
│       │
│       └── Content Area (children)
```

## Theme Toggle States

### Light Mode (Default)
```
┌───────┐
│ ☀️ │  ← Sun icon, not pressed
└───────┘
```
Click → Switches to dark mode

### Dark Mode
```
┌───────┐
│ 🌙 │  ← Moon icon, pressed state (highlighted)
└───────┘
```
Click → Switches to light mode

## Props Flow

```typescript
// ThemeSwitcher component
const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <Toggle
      pressed={isDark}              // Highlight when dark
      onPressedChange={(pressed) => 
        setTheme(pressed ? "dark" : "light")
      }
    >
      {isDark ? <Moon /> : <Sun />}
    </Toggle>
  );
};
```

## Integration in Admin Header

```tsx
// app/(admin)/admin/layout.tsx
<header className="flex h-16 items-center gap-2 border-b px-4">
  <SidebarTrigger />           // Left: Menu toggle
  <Separator />
  <AdminBreadcrumb />          // Middle: Breadcrumb
  <div className="ml-auto">   // Right: Auto-margin pushes to end
    <ThemeSwitcher />          // Theme toggle
  </div>
</header>
```

## Why This Location?

### ✅ Advantages
1. **Always visible** - Present on every admin page
2. **Contextually appropriate** - Header is for global controls
3. **Doesn't compete** - Separate from navigation items
4. **Responsive friendly** - Works well on mobile
5. **Standard UX pattern** - Users expect theme controls in headers

### ❌ Previous Location Issues (Sidebar Footer)
1. Hidden when sidebar collapsed
2. Competes with user menu for attention
3. Less common UX pattern

## Usage in Code

### Basic Usage
```tsx
import { ThemeSwitcher } from "@/components/theme-switcher";

<ThemeSwitcher />
```

### In Header Layout
```tsx
<header className="flex items-center">
  <Logo />
  <Navigation />
  <div className="ml-auto flex gap-2">
    <ThemeSwitcher />
    <UserMenu />
  </div>
</header>
```

### Programmatic Control
```tsx
import { useTheme } from "@/hooks/use-theme";

const { theme, setTheme } = useTheme();

// Force dark mode
setTheme("dark");

// Toggle
setTheme(theme === "dark" ? "light" : "dark");
```

## Persistence

```
User clicks toggle
      ↓
next-themes updates
      ↓
localStorage.setItem("theme", "dark")
      ↓
<html class="dark"> added
      ↓
Tailwind applies .dark styles
```

**Storage:**
- Key: `theme`
- Values: `"light"` | `"dark"`
- Location: `localStorage`
- Scope: Per-domain

## Accessibility

- ✅ **Keyboard accessible** - Toggle component supports keyboard
- ✅ **ARIA labels** - `aria-label` describes action
- ✅ **Visual feedback** - Pressed state for current theme
- ✅ **Icon clarity** - Sun/Moon universally understood
- ✅ **No color-only** - Icons provide non-color indication
