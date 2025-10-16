# Organizations Module Refactoring - Migration Guide

**Date:** October 16, 2025  
**Status:** ✅ Completed  
**Related:** [ADR-001](./docs/adr/ADR-001-admin-organizations-restructuring.md)

---

## Overview

The admin organizations module has been restructured for better maintainability, scalability, and user experience. This guide documents what changed and how to use the new structure.

---

## What Changed

### 🎯 Key Improvements

1. ✅ **Shareable URLs** for all CRUD operations
2. ✅ **Centralized logic** in `_lib` folder
3. ✅ **Loading states** at every route
4. ✅ **Metadata** for SEO and breadcrumbs
5. ✅ **Removed redundant** session checks
6. ✅ **Shared form component** for create/edit
7. ✅ **Better folder structure** (3 levels max)

### 📁 New Folder Structure

```
app/(admin)/admin/organizations/
├── page.tsx                          ← List page with metadata
├── loading.tsx                       ← Loading state for list
├── new/                              ← Renamed from "create"
│   ├── page.tsx                      ← Create form (shareable URL)
│   └── loading.tsx                   ← Loading state
├── [id]/
│   ├── page.tsx                      ← Detail view
│   ├── loading.tsx                   ← Loading state
│   └── edit/                         ← New route
│       ├── page.tsx                  ← Edit form (placeholder)
│       └── loading.tsx               ← Loading state
├── _lib/                             ← ⭐ NEW: Centralized logic
│   ├── actions.ts                    ← Server actions
│   ├── queries.ts                    ← Data fetching
│   ├── schema.ts                     ← Zod validation
│   └── utils.ts                      ← Helper functions
└── _components/                      ← UI components
    ├── organization-card.tsx
    ├── organization-form.tsx         ← ⭐ NEW: Shared form
    ├── organizations-empty.tsx
    └── create-organization-button.tsx ← ⭐ NEW: Nav button
```

---

## Route Changes

### Before → After

| Old Route | New Route | Purpose |
|-----------|-----------|---------|
| `/admin/organizations` | `/admin/organizations` | List (unchanged) |
| N/A (dialog only) | `/admin/organizations/new` | **Create** (shareable!) |
| `/admin/organizations/[id]` | `/admin/organizations/[id]` | View (enhanced) |
| N/A | `/admin/organizations/[id]/edit` | **Edit** (placeholder) |

### URL Examples

```
✅ /admin/organizations           → List all organizations
✅ /admin/organizations/new       → Create new organization
✅ /admin/organizations/abc123    → View organization details
✅ /admin/organizations/abc123/edit → Edit organization (coming soon)
```

---

## Breaking Changes

### 1. Import Paths Changed

**Before:**
```tsx
import { getOrganizations } from "./action";
import { createOrganization } from "./create/action";
import { organizationSchema } from "./create/schema";
import { generateSlug } from "./create/utils";
```

**After:**
```tsx
import { getOrganizations } from "./_lib/queries";
import { createOrganization } from "./_lib/actions";
import { organizationSchema } from "./_lib/schema";
import { generateSlug } from "./_lib/utils";
```

### 2. Component Changes

**Before:**
```tsx
import { OrganizationsHeader } from "./_components";

<OrganizationsHeader />
```

**After:**
```tsx
import { PageHeader } from "@/components/page-header";
import { CreateOrganizationButton } from "./_components";

<PageHeader
  title="Organizations"
  description="Manage all organizations"
  action={<CreateOrganizationButton />}
/>
```

### 3. Route Changes

**Before:** Dialog-based creation (no dedicated URL)
```tsx
<CreateOrganizationDialog /> // Opens modal
```

**After:** Page-based creation (shareable URL)
```tsx
<CreateOrganizationButton /> // Navigates to /admin/organizations/new
```

---

## New Features

### 1. Shareable CRUD URLs ✨

**Create:**
```
Share this link: /admin/organizations/new
Anyone with admin access can use it to create organizations
```

**Edit (placeholder):**
```
Share this link: /admin/organizations/abc123/edit
Ready for implementation when needed
```

### 2. Loading States 🔄

Every route now has a loading.tsx file with skeleton UI:

```tsx
// app/(admin)/admin/organizations/loading.tsx
export default function OrganizationsLoading() {
  return <Skeleton />; // Automatic with Suspense!
}
```

### 3. Metadata for SEO 📊

Every page now has proper metadata:

```tsx
export const metadata: Metadata = {
  title: "Organizations | Admin Portal",
  description: "Manage all organizations"
};
```

**Benefits:**
- ✅ Browser tab shows meaningful title
- ✅ Better SEO for authenticated pages
- ✅ Can be used for breadcrumbs (future)

### 4. Centralized Logic 🎯

All organization logic in `_lib/`:

```tsx
// _lib/actions.ts - Server actions
export async function createOrganization(name, slug) { }
export async function updateOrganization(id, name, slug) { } // TODO
export async function deleteOrganization(id) { } // TODO

// _lib/queries.ts - Data fetching
export async function getOrganizations() { }
export async function getOrganization(id) { } // TODO
export async function getFullOrganization(slug) { }

// _lib/schema.ts - Validation
export const organizationSchema = z.object({ })

// _lib/utils.ts - Helpers
export function generateSlug(name: string) { }
```

### 5. Shared Form Component 🔄

`OrganizationForm` supports both create and edit:

```tsx
// Create mode
<OrganizationForm mode="create" />

// Edit mode (future)
<OrganizationForm 
  mode="edit" 
  initialData={{ name: "Acme", slug: "acme" }}
  organizationId="abc123"
/>
```

---

## Migration Checklist

### If You Have Custom Organization Code:

- [ ] Update imports from `./action` → `./_lib/actions`
- [ ] Update imports from `./create/schema` → `./_lib/schema`
- [ ] Update imports from `./create/utils` → `./_lib/utils`
- [ ] Replace `OrganizationsHeader` with direct `PageHeader` usage
- [ ] Replace `CreateOrganizationDialog` with `CreateOrganizationButton`
- [ ] Test all routes: list, create, view, edit placeholder
- [ ] Verify breadcrumbs show correctly
- [ ] Check loading states appear during navigation

### Files to Delete (Old Structure):

⚠️ **Do NOT delete yet** - Keep as reference until fully tested

```
app/(admin)/admin/organizations/
├── action.ts                         ← Old, replaced by _lib/actions.ts
└── create/                           ← Old, replaced by new/
    ├── action.ts                     ← Old, replaced by _lib/actions.ts
    ├── schema.ts                     ← Old, replaced by _lib/schema.ts
    ├── utils.ts                      ← Old, replaced by _lib/utils.ts
    ├── page.tsx                      ← Old, replaced by new/page.tsx
    └── _components/
        ├── CreateOrganizationDialog.tsx ← Old, replaced by button
        └── CreateOrganizationForm.tsx   ← Old, replaced by organization-form.tsx
```

---

## Testing Guide

### 1. Test List Page

```
Visit: /admin/organizations
✅ Shows list of organizations
✅ Has "Create Organization" button
✅ Breadcrumb: "Admin Portal > Organizations"
✅ Loading skeleton appears during fetch
✅ Metadata: "Organizations | Admin Portal"
```

### 2. Test Create Page

```
Visit: /admin/organizations/new
✅ Shows create form
✅ Name field auto-generates slug
✅ Form validates on submit
✅ Success redirects to list
✅ Breadcrumb: "Admin Portal > Organizations > Create"
✅ Loading skeleton appears
✅ Metadata: "Create Organization | Admin Portal"
```

### 3. Test Detail Page

```
Visit: /admin/organizations/[id]
✅ Shows "Coming Soon" placeholder
✅ Has "Edit Organization" button
✅ Breadcrumb: "Admin Portal > Organizations > [id]"
✅ Loading skeleton appears
✅ Metadata: "Organization Details | Admin Portal"
```

### 4. Test Edit Page (Placeholder)

```
Visit: /admin/organizations/[id]/edit
✅ Shows "Coming Soon" placeholder
✅ Displays organization ID
✅ Breadcrumb: "Admin Portal > Organizations > [id] > Edit"
✅ Loading skeleton appears
✅ Metadata: "Edit Organization | Admin Portal"
```

### 5. Test Breadcrumbs

```
/admin/organizations          → Admin Portal > Organizations
/admin/organizations/new      → Admin Portal > Organizations > Create
/admin/organizations/abc123   → Admin Portal > Organizations > abc123
/admin/organizations/abc123/edit → Admin Portal > Organizations > abc123 > Edit
```

---

## Troubleshooting

### Error: "Cannot find module './_lib/actions'"

**Solution:** Make sure you're using the index export or full path:
```tsx
// Option 1: Use full path
import { createOrganization } from "./_lib/actions";

// Option 2: Add to _lib/index.ts (not created yet)
export * from "./actions";
export * from "./queries";
export * from "./schema";
export * from "./utils";
```

### Error: "Cannot find module '../_components'"

**Solution:** Import from the index file:
```tsx
import { OrganizationForm } from "../_components"; // ✅
// NOT: import { OrganizationForm } from "../_components/organization-form"; // ❌
```

### Breadcrumb Shows Wrong Label

**Solution:** Update `admin-breadcrumb.tsx` segment labels:
```tsx
const segmentLabels = {
  new: "Create",    // Maps /new → "Create"
  edit: "Edit",     // Maps /edit → "Edit"
  // Add more as needed
};
```

### Form Not Submitting

**Solution:** Check that actions.ts is imported from `_lib`:
```tsx
import { createOrganization } from "../_lib/actions"; // ✅
// NOT: import { createOrganization } from "../create/action"; // ❌ Old path
```

---

## Future Enhancements

### Coming Soon

- [ ] Implement organization detail view with full data
- [ ] Implement edit functionality
- [ ] Add delete functionality with confirmation
- [ ] Add member management
- [ ] Add organization settings
- [ ] Add organization analytics

### Potential Improvements

- [ ] Metadata-aware breadcrumbs (read titles from route metadata)
- [ ] Optimistic UI updates
- [ ] Bulk operations (multi-select + actions)
- [ ] Organization search and filtering
- [ ] Export/import functionality
- [ ] Audit log for organization changes

---

## Questions?

**Need Help?**
- Check [ADR-001](./docs/adr/ADR-001-admin-organizations-restructuring.md) for architectural decisions
- Review this migration guide
- Check the inline code comments in `_lib/` files

**Found a Bug?**
- Verify you're using the new import paths
- Check that all files exist in `_lib/`
- Test with fresh build: `pnpm build && pnpm start`

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Refactoring Complete  
**Next:** Implement edit functionality
