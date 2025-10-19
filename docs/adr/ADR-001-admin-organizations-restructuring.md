# ADR-001: Admin Organizations Module Restructuring

**Date:** October 16, 2025  
**Status:** Accepted  
**Decision Makers:** Development Team  
**Tags:** #architecture #admin #refactoring

---

## Context and Problem Statement

The admin organizations module was experiencing several architectural issues that hindered maintainability, scalability, and developer experience:

1. **Scattered Logic**: Server actions were spread across multiple `action.ts` files at different route levels
2. **Deep Nesting**: Components were nested 4 levels deep (`organizations/create/_components/`)
3. **Manual Breadcrumb Mapping**: Breadcrumbs required manual segment-to-label mapping that would break with dynamic routes
4. **Redundant Security Checks**: Session validation was duplicated in both layout and individual pages
5. **Missing Metadata**: No SEO metadata or browser tab titles
6. **No Loading States**: Missing `loading.tsx` files resulted in blank screens during data fetching
7. **Limited Shareability**: No dedicated routes for CRUD operations (only dialog-based creation)
8. **Inconsistent Component Organization**: Mixed component locations and wrapper abstractions

### Goals

- Create **shareable URLs** for all CRUD operations (list, create, view, edit)
- Centralize feature logic in a single location (`_lib` folder)
- Implement automatic breadcrumb generation from route metadata
- Improve loading UX with Suspense boundaries
- Reduce code duplication and redundant checks
- Follow Next.js 15 and React best practices
- Maintain backward compatibility where possible

---

## Decision

### 1. Folder Structure Reorganization

**Before:**
```
admin/organizations/
  ├── page.tsx              # List view
  ├── action.ts             # Scattered actions
  ├── create/
  │   ├── page.tsx
  │   ├── action.ts         # Duplicate actions
  │   ├── schema.ts
  │   ├── utils.ts
  │   └── _components/      # Deep nesting
  ├── [id]/
  │   └── page.tsx          # Detail view only
  └── _components/          # List components
```

**After:**
```
admin/organizations/
  ├── page.tsx              # List view with metadata
  ├── loading.tsx           # List loading state
  ├── new/                  # Renamed from "create" (REST convention)
  │   ├── page.tsx          # Create form (shareable URL)
  │   └── loading.tsx
  ├── [id]/
  │   ├── page.tsx          # Detail view
  │   ├── loading.tsx
  │   └── edit/             # New edit route
  │       ├── page.tsx      # Edit form (shareable URL)
  │       └── loading.tsx
  ├── _lib/                 # ⭐ Centralized feature logic
  │   ├── actions.ts        # All server actions
  │   ├── schema.ts         # Zod validation schemas
  │   ├── queries.ts        # Data fetching functions
  │   └── utils.ts          # Helper utilities
  └── _components/          # UI components only
      ├── organization-card.tsx
      ├── organization-form.tsx      # Shared create/edit form
      ├── organizations-empty.tsx
      └── create-organization-button.tsx
```

**Key Changes:**
- ✅ All business logic consolidated in `_lib/` folder
- ✅ Shareable routes: `/new`, `/[id]`, `/[id]/edit`
- ✅ Loading states at every route level
- ✅ Shared form component for create + edit
- ✅ Reduced folder depth (3 levels max)

### 2. Metadata-Driven Architecture

**Decision:** Export `metadata` or `generateMetadata` from every page for:
- SEO optimization
- Browser tab titles
- Automatic breadcrumb generation (future enhancement)

**Implementation:**
```tsx
// Static metadata
export const metadata = {
  title: "Organizations | Admin Portal",
  description: "Manage all organizations"
}

// Dynamic metadata
export async function generateMetadata({ params }) {
  const org = await getOrganization(params.id)
  return { title: `${org.name} | Admin Portal` }
}
```

### 3. Remove Redundant Security Checks

**Decision:** Trust the layout's admin role validation, remove duplicate checks from pages.

**Rationale:**
- Layout already validates: `if (session.user.role !== "admin") redirect("/auth/login")`
- Duplicate checks add unnecessary database queries
- Single source of truth (DRY principle)

### 4. Direct Component Usage

**Decision:** Remove wrapper components like `OrganizationsHeader`, use `PageHeader` directly in pages.

**Before:**
```tsx
// _components/OrganizationsHeader.tsx (extra abstraction)
export function OrganizationsHeader() {
  return <PageHeader title="..." action={<Dialog />} />
}

// page.tsx
<OrganizationsHeader />
```

**After:**
```tsx
// page.tsx (direct and flexible)
<PageHeader
  title="Organizations"
  description="..."
  action={<CreateOrganizationButton />}
/>
```

**Benefits:**
- More flexible per-page customization
- Less indirection and easier to understand
- Reduces component count

### 5. Enhanced Breadcrumb System

**Current Implementation:** Dynamic segment-based generation
**Future Enhancement:** Metadata-aware breadcrumbs (deferred to ADR-002)

**Current Approach:**
```tsx
const segmentLabels = {
  admin: "Admin Portal",
  organizations: "Organizations",
  new: "Create",
  edit: "Edit"
}
```

### 6. Naming Conventions

**Route Naming:**
- Use `/new` for create operations (REST convention, though "Create" in UI)
- Use `/[id]/edit` for update operations
- UI labels: "Create Organization", "Edit Organization"

**File Naming:**
- Server actions: `actions.ts` (plural)
- Data fetching: `queries.ts`
- UI components: kebab-case (e.g., `organization-form.tsx`)

---

## Consequences

### Positive

✅ **Centralized Logic**: All organization-related code in one place (`_lib`)  
✅ **Shareable URLs**: Every CRUD operation has a dedicated, bookmarkable route  
✅ **Better Performance**: Fewer database queries (removed redundant auth checks)  
✅ **Improved UX**: Loading states prevent blank screens  
✅ **Better SEO**: Metadata on all pages  
✅ **Maintainability**: Clear separation of concerns (logic vs. UI)  
✅ **Scalability**: Easy to add new routes (delete, archive, etc.)  
✅ **DX**: Easier to find code, consistent patterns  
✅ **Code Reuse**: Shared form component for create + edit  

### Negative

⚠️ **Breaking Changes**: Imports need updating (e.g., `../action` → `../_lib/actions`)  
⚠️ **Migration Effort**: Need to move files and update references  
⚠️ **Learning Curve**: Team needs to understand new structure  

### Neutral

🔄 **Route Change**: `/create` → `/new` (can use Next.js redirects for compatibility)  
🔄 **More Files**: Additional `loading.tsx` files (but improves UX)  

---

## Implementation Plan

### Phase 1: Non-Breaking Preparation (✅ Safe)
1. Create `_lib` folder structure
2. Copy actions/schema/utils to `_lib` (keep originals temporarily)
3. Add metadata exports to existing pages
4. Add loading.tsx files

### Phase 2: Route Restructuring (⚠️ Breaking)
5. Rename `create/` → `new/`
6. Create `[id]/edit/` route with placeholder
7. Update all imports to use `_lib`
8. Update CreateOrganizationButton to point to `/new`

### Phase 3: Component Cleanup (✅ Safe)
9. Remove OrganizationsHeader wrapper
10. Update page.tsx to use PageHeader directly
11. Extract shared OrganizationForm component
12. Remove redundant session checks

### Phase 4: Verification (✅ Safe)
13. Test all routes: list, create, view, edit placeholder
14. Verify breadcrumbs work correctly
15. Check loading states appear
16. Validate metadata in browser tabs

### Phase 5: Cleanup (✅ Safe)
17. Delete old duplicate files
18. Update documentation
19. Run linting and type checking

---

## Alternatives Considered

### Alternative 1: Keep Current Structure
**Pros:** No migration effort, no breaking changes  
**Cons:** Technical debt grows, harder to maintain long-term  
**Decision:** ❌ Rejected - Issues will compound as project grows

### Alternative 2: Use Parallel Routes
**Pros:** Can show modals with dedicated URLs (`@modal` convention)  
**Cons:** More complex, requires intercepting routes  
**Decision:** ❌ Deferred - Can implement later if needed

### Alternative 3: Keep "create" instead of "new"
**Pros:** More explicit, clearer to non-REST developers  
**Cons:** Doesn't follow REST conventions  
**Decision:** ⚠️ **Chosen "new" for routes, but UI shows "Create"**

### Alternative 4: Monolithic actions.ts for all admin
**Pros:** Single file for all admin actions  
**Cons:** Would become massive, hard to navigate  
**Decision:** ❌ Rejected - Feature-level organization better

---

## Related Decisions

- **ADR-002** (Future): Metadata-aware breadcrumb system
- **ADR-003** (Future): Admin module shared components library
- **ADR-004** (Future): Data fetching patterns (queries.ts vs direct Prisma)

---

## References

- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [REST API Naming Conventions](https://restfulapi.net/resource-naming/)
- [ADR Template by Michael Nygard](https://github.com/joelparkerhenderson/architecture-decision-record)
- Project: v2-saas-solution Copilot Instructions (`/.github/copilot-instructions.md`)

---

## Notes

- Migration can be done incrementally without downtime
- No database schema changes required
- Existing functionality preserved, just reorganized
- Can add redirects from `/create` → `/new` for backward compatibility

---

**Last Updated:** October 16, 2025  
**Next Review:** After Phase 5 completion
