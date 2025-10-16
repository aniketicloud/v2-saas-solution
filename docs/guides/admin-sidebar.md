# Admin Layout - Shadcn Sidebar Implementation

## Overview
The admin layout has been updated to use the shadcn/ui Sidebar component, providing a modern, collapsible, and responsive navigation system.

## File Organization

Admin-specific components are located in:
```
app/
  (admin)/
    admin/
      _components/
        admin-sidebar.tsx    # Main sidebar component
      layout.tsx             # Admin layout using sidebar
      dashboard/
      organizations/
      users/
```

This follows Next.js conventions where components specific to a route group are placed in `_components` folders within that route.

## What Changed

### New Components Created

#### 1. `AdminSidebar` (`app/(admin)/admin/_components/admin-sidebar.tsx`)
A fully-featured sidebar component that includes:
- **Collapsible behavior**: Can collapse to icon-only mode
- **Header section**: Displays Admin Portal branding with Shield icon
- **Navigation menu**: Dashboard, Organizations, and Users links with icons
- **Footer section**: User profile dropdown with account info and logout
- **Active state**: Automatically highlights the current page
- **Responsive**: Works on mobile with sheet/drawer behavior

#### 2. Updated `AdminLayout` (`app/(admin)/admin/layout.tsx`)
Now uses:
- `SidebarProvider`: Manages sidebar state and persistence via cookies
- `SidebarInset`: Main content area that adjusts based on sidebar state
- `SidebarTrigger`: Toggle button for the sidebar
- `Breadcrumb`: Navigation breadcrumbs in the header
- Cookie-based state persistence: Remembers collapsed/expanded state

### Installed Components
- ✅ `sidebar` - Already installed
- ✅ `breadcrumb` - Newly installed
- ✅ `tooltip` - Already installed (used by sidebar)
- ✅ `sheet` - Already installed (used for mobile sidebar)
- ✅ `skeleton` - Already installed (for loading states)

### CSS Variables
The following CSS variables were already added to `app/globals.css`:
- `--sidebar` - Background color
- `--sidebar-foreground` - Text color
- `--sidebar-primary` - Primary accent color
- `--sidebar-accent` - Hover/active states
- `--sidebar-border` - Border color
- All with dark mode variants

## Features

### 1. Collapsible Sidebar
- Keyboard shortcut: `Cmd/Ctrl + B`
- Toggle button in header
- Collapses to icon-only mode with tooltips
- State persists across page reloads

### 2. Navigation Structure
```
Admin Portal (Header)
├── Dashboard
├── Organizations
└── Users
```

### 3. User Profile Footer
- Avatar with fallback initials
- User name and email display
- Dropdown menu with:
  - Account settings
  - Log out functionality

### 4. Responsive Design
- Desktop: Collapsible sidebar (16rem width)
- Mobile: Sheet/drawer overlay (18rem width)
- Automatically detects screen size

### 5. State Management
- Cookie-based persistence (`sidebar_state`)
- Server-side state reading for SSR
- Client-side toggle functionality

## Usage

### Layout Structure
```tsx
<SidebarProvider defaultOpen={defaultOpen}>
  <AdminSidebar user={session.user} />
  <SidebarInset>
    <header>{/* SidebarTrigger + Breadcrumbs */}</header>
    <div>{children}</div>
  </SidebarInset>
</SidebarProvider>
```

### Adding New Navigation Items
Edit `app/(admin)/admin/_components/admin-sidebar.tsx`:

```tsx
const navItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  // Add your new item here
  {
    title: "New Page",
    url: "/admin/new-page",
    icon: YourIcon,
  },
];
```

### Customizing Sidebar Width
Edit `components/ui/sidebar.tsx`:

```tsx
const SIDEBAR_WIDTH = "16rem"  // Default width
const SIDEBAR_WIDTH_MOBILE = "18rem"  // Mobile width
const SIDEBAR_WIDTH_ICON = "3rem"  // Collapsed width
```

Or use CSS variables in the provider:

```tsx
<SidebarProvider
  style={{
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem",
  }}
>
```

### Keyboard Shortcuts
Change in `components/ui/sidebar.tsx`:

```tsx
const SIDEBAR_KEYBOARD_SHORTCUT = "b"  // Cmd/Ctrl + B
```

## Migration Guide

### Old Structure (Before)
```tsx
<div className="flex h-screen bg-gray-50">
  <aside className="w-64 bg-gray-900 text-white">
    {/* Old static sidebar */}
  </aside>
  <main className="flex-1 overflow-y-auto p-8">
    {children}
  </main>
</div>
```

### New Structure (After)
```tsx
<SidebarProvider defaultOpen={defaultOpen}>
  <AdminSidebar user={session.user} />
  <SidebarInset>
    <header>{/* Toggle + Breadcrumbs */}</header>
    <div>{children}</div>
  </SidebarInset>
</SidebarProvider>
```

## Components Reference

### SidebarProvider Props
| Prop | Type | Description |
|------|------|-------------|
| `defaultOpen` | `boolean` | Initial open state |
| `open` | `boolean` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | Open state change handler |

### Sidebar Props
| Prop | Type | Description |
|------|------|-------------|
| `side` | `"left" \| "right"` | Which side to display |
| `variant` | `"sidebar" \| "floating" \| "inset"` | Visual variant |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | Collapse behavior |

### useSidebar Hook
```tsx
const {
  state,          // "expanded" | "collapsed"
  open,           // boolean
  setOpen,        // (open: boolean) => void
  openMobile,     // boolean
  setOpenMobile,  // (open: boolean) => void
  isMobile,       // boolean
  toggleSidebar,  // () => void
} = useSidebar()
```

## Theming

Sidebar uses separate CSS variables for easy theming:

### Light Mode
```css
:root {
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-border: oklch(0.92 0.004 286.32);
}
```

### Dark Mode
```css
.dark {
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-border: oklch(1 0 0 / 10%);
}
```

## Best Practices

1. **Active States**: Always use `isActive` prop on `SidebarMenuButton` to highlight current page
2. **Icons**: Use lucide-react icons for consistency
3. **Truncation**: Wrap labels in `<span>` for proper text truncation when collapsed
4. **Tooltips**: Automatically shown in icon mode for better UX
5. **Mobile First**: Sidebar automatically becomes a sheet on mobile
6. **Accessibility**: All interactive elements have proper ARIA labels

## Future Enhancements

- [ ] Add collapsible menu groups with sub-items
- [ ] Add keyboard navigation
- [ ] Add search functionality in sidebar
- [ ] Add notification badges on menu items
- [ ] Add quick actions in sidebar header

## Resources

- [Shadcn Sidebar Documentation](https://ui.shadcn.com/docs/components/sidebar)
- [Shadcn Blocks Library](https://ui.shadcn.com/blocks) - Pre-built sidebar examples
- [Better Auth Documentation](https://better-auth.com)

## Troubleshooting

### Sidebar not persisting state
- Check that cookies are enabled
- Verify `SIDEBAR_COOKIE_NAME` in `sidebar.tsx`
- Ensure layout is reading cookies correctly

### Icons not showing in collapsed mode
- Wrap label text in `<span>` tags
- Ensure icon is first child in `SidebarMenuButton`

### Mobile sidebar not working
- Verify `Sheet` component is installed
- Check `useIsMobile` hook is working
- Ensure proper viewport meta tag in HTML
