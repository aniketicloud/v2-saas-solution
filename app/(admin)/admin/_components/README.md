# Admin Components Location

## Component Structure

```
app/(admin)/admin/_components/
└── admin-sidebar.tsx    # Shadcn sidebar with navigation
```

## Import Paths

### From Admin Layout
```tsx
// ✅ Correct - Relative import
import { AdminSidebar } from "./_components/admin-sidebar";
```

### From Admin Pages (e.g., dashboard/page.tsx)
```tsx
// ✅ Correct - Relative import from sibling
import { AdminSidebar } from "../_components/admin-sidebar";
```

### From Other Admin Routes
```tsx
// ✅ Correct - Navigate to parent then to _components
import { AdminSidebar } from "../../_components/admin-sidebar";
```

## Why _components Folder?

1. **Colocation**: Components stay close to where they're used
2. **Next.js Convention**: `_` prefix excludes from routing
3. **Clear Ownership**: Easy to see which components belong to admin
4. **Better Organization**: Keeps global components separate from route-specific ones

## Global vs Route-Specific Components

### Global Components (`components/`)
- Used across multiple route groups
- Examples: `ui/`, `theme-provider.tsx`, `dashboard-nav.tsx`

### Route-Specific Components (`app/(admin)/admin/_components/`)
- Only used within admin routes
- Example: `admin-sidebar.tsx`

## Quick Reference

| Need | Import From |
|------|-------------|
| UI Components | `@/components/ui/...` |
| Global Components | `@/components/...` |
| Admin Components (from layout) | `./_components/...` |
| Admin Components (from pages) | `../_components/...` |
| Lib/Utils | `@/lib/...` |
