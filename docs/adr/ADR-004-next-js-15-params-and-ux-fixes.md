# ADR-004: Next.js 15 Async Params and UX Improvements

**Date:** October 16, 2025  
**Status:** Accepted  
**Decision Makers:** Development Team  
**Related:** [ADR-003](./ADR-003-organization-edit-detail-implementation.md)  
**Tags:** #nextjs15 #ux #navigation #async-params

---

## Context and Problem Statement

After implementing the organization edit and detail pages (ADR-003), user testing revealed several issues:

### Issues Discovered

1. **Console Warnings (Critical)** ⚠️
   ```
   Error: Route "/admin/organizations/[id]" used `params.id`. 
   `params` should be awaited before using its properties.
   ```
   - Appeared on detail page (2 warnings)
   - Appeared on edit page (1 warning)

2. **Breadcrumb UX Issue** 🍞
   - Showed technical ID: `Admin Portal > Organizations > E8AJzomYpsNAc33yXBFoeKEh5UY6Quit`
   - Expected: `Admin Portal > Organizations > Organization Details`

3. **Edit Form UX Issues** ✏️
   - Slug field appeared disabled (should be editable in edit mode)
   - Cancel button redirected to `/admin/organizations` list
   - Expected: Cancel should return to detail page (`/admin/organizations/[id]`)

4. **Edit Success Navigation** ✅
   - After updating, redirected to list page
   - Expected: Return to detail page to see changes

---

## Research: Next.js 15 Breaking Changes

### Async Params (New in Next.js 15)

**Official Documentation:**
> In Next.js 15, `params`, `searchParams`, and layout props are now Promises to align with async/await patterns.

**Why This Change:**
- ✅ Enables React Server Components optimization
- ✅ Improves streaming and Suspense boundaries
- ✅ Better performance through parallel data fetching
- ✅ Aligns with React 19 async conventions

**Migration Pattern:**

```typescript
// ❌ Old (Next.js 14)
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id);
}

// ✅ New (Next.js 15)
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const data = await fetchData(id);
}
```

**Benefits:**
- Warnings disappear in console
- Future-proof for React 19
- Better type safety

---

## Decision

### 1. Implement Async Params Pattern ✅

**Changed Files:**
- `app/(admin)/admin/organizations/[id]/page.tsx`
- `app/(admin)/admin/organizations/[id]/edit/page.tsx`

**Changes:**

```typescript
// Before
interface PageProps {
  params: { id: string };
}
export default async function Page({ params }: PageProps) {
  const org = await getOrganization(params.id);
}

// After
interface PageProps {
  params: Promise<{ id: string }>;
}
export default async function Page({ params }: PageProps) {
  const { id } = await params; // ← Await params first
  const org = await getOrganization(id);
}
```

**Impact:**
- ✅ Eliminates all console warnings
- ✅ Follows Next.js 15 best practices
- ✅ Better type safety
- ✅ No runtime impact (only type change)

### 2. Smart Breadcrumb with ID Detection ✅

**Problem:** Technical IDs in breadcrumbs look unprofessional

**Solution:** Detect ID patterns and show friendly labels

```typescript
// Added helper function
function isIdSegment(segment: string): boolean {
  return segment.length > 10 && /^[a-zA-Z0-9_-]+$/.test(segment);
}

function getSegmentLabel(segment: string, prevSegment?: string): string {
  // If previous segment was "organizations" and this looks like ID
  if (isIdSegment(segment) && prevSegment === "organizations") {
    return "Organization Details";
  }
  // ... other logic
}
```

**Results:**
- Before: `Admin Portal > Organizations > E8AJzomYpsNAc33yXBFoeKEh5UY6Quit`
- After: `Admin Portal > Organizations > Organization Details`

**Why This Approach:**
- ✅ Client-side breadcrumb stays simple
- ✅ No extra server-side data fetching needed
- ✅ Works for all resource detail pages (future-proof)
- ✅ Generic pattern applicable to users, teams, etc.

### 3. Editable Slug in Edit Mode ✅

**Changed:** OrganizationForm component

**Before:**
```typescript
<Input
  {...register("slug")}
  disabled={mode === "create" || isSubmitting} // ← Disabled in edit
/>
```

**After:**
```typescript
<Input
  {...register("slug")}
  disabled={mode === "create" || isSubmitting} // ← Only disabled in create
  autoComplete="off"
/>
<FieldDescription>
  {mode === "edit" 
    ? "URL-friendly identifier. Change carefully as it affects existing links."
    : "This will be used in URLs and identifiers"}
</FieldDescription>
```

**Why Allow Slug Editing:**
- ✅ Admin might want to rebrand organization
- ✅ Fix typos in slug
- ⚠️ Warning message about affecting existing links
- ✅ Server validates uniqueness

### 4. Context-Aware Navigation ✅

**Problem:** One-size-fits-all navigation doesn't fit all contexts

**Solution:** Dynamic cancel/success paths based on context

#### Form Component Enhancement

```typescript
interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: OrganizationFormData;
  organizationId?: string;
  onCancelPath?: string; // ← New optional prop
}

export function OrganizationForm({ onCancelPath, ... }: OrganizationFormProps) {
  const cancelPath = onCancelPath || "/admin/organizations";
  
  // On cancel click
  <Button onClick={() => router.push(cancelPath)}>Cancel</Button>
}
```

#### Navigation Logic

| Context | Cancel Path | Success Path |
|---------|-------------|--------------|
| **Create** | `/admin/organizations` | `/admin/organizations` |
| **Edit** | `/admin/organizations/[id]` | `/admin/organizations/[id]` |

**Edit Page Usage:**
```typescript
<OrganizationForm
  mode="edit"
  organizationId={id}
  onCancelPath={`/admin/organizations/${id}`} // ← Back to detail
/>
```

**Edit Action Success:**
```typescript
if (result.success) {
  router.push(`/admin/organizations/${organizationId}`); // ← Back to detail
  router.refresh();
}
```

**User Journey:**
1. View org detail (`/admin/organizations/[id]`)
2. Click "Edit Organization" → Edit page
3. Make changes...
4. **Cancel** → Returns to detail page ✅
5. **OR Submit** → Returns to detail page showing updated data ✅

---

## Implementation Details

### Files Changed

#### Critical Fixes ⚠️
```
app/(admin)/admin/organizations/
  ├── [id]/page.tsx              ← Async params
  └── [id]/edit/page.tsx         ← Async params + cancel path
```

#### UX Improvements ✨
```
app/(admin)/admin/
  ├── _components/
  │   └── admin-breadcrumb.tsx   ← Smart ID detection
  └── organizations/
      └── _components/
          └── organization-form.tsx  ← Editable slug + context navigation
```

### Code Patterns Applied

#### Pattern 1: Async Params (Next.js 15)
```typescript
// Type definition
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Usage
export default async function Page({ params }: PageProps) {
  const { id } = await params; // ← Always await first
  // Now use id
}
```

#### Pattern 2: Smart Breadcrumb Labels
```typescript
// Detection pattern
function isIdSegment(segment: string): boolean {
  return segment.length > 10 && /^[a-zA-Z0-9_-]+$/.test(segment);
}

// Context-aware labeling
function getSegmentLabel(segment: string, prevSegment?: string): string {
  if (isIdSegment(segment) && prevSegment === "organizations") {
    return "Organization Details";
  }
  // Add more patterns as needed:
  // if (isIdSegment(segment) && prevSegment === "users") return "User Details";
  // if (isIdSegment(segment) && prevSegment === "teams") return "Team Details";
}
```

#### Pattern 3: Context-Aware Navigation
```typescript
// Form component with flexible paths
interface FormProps {
  onCancelPath?: string;
  onSuccessPath?: string;
}

// Edit page passes context
<Form 
  onCancelPath={`/resource/${id}`}
  onSuccessPath={`/resource/${id}`}
/>

// Create page uses defaults
<Form /> // Defaults to list page
```

---

## Consequences

### Positive ✅

- ✅ **Zero Console Warnings**: All Next.js 15 warnings eliminated
- ✅ **Professional UI**: Breadcrumbs show friendly labels, not IDs
- ✅ **Intuitive Navigation**: Cancel/success return to expected locations
- ✅ **Flexible Slugs**: Admins can fix typos or rebrand
- ✅ **Future-Proof**: Ready for Next.js 15+ and React 19
- ✅ **Generic Pattern**: Breadcrumb logic works for all resources

### Negative ⚠️

- ⚠️ **Slug Editing Risk**: Changing slug breaks existing bookmarked links
  - **Mitigation**: Warning message + server validation
- ⚠️ **Breadcrumb Complexity**: ID detection adds logic to breadcrumb
  - **Mitigation**: Simple regex check, minimal overhead

### Neutral 🔄

- 🔄 **Type Changes**: Need to update all dynamic route pages with async params
- 🔄 **Navigation Patterns**: Established pattern for future forms

---

## Migration Checklist

### For Future Dynamic Routes

When creating new `[param]` routes in Next.js 15:

- [ ] Type `params` as `Promise<{ param: string }>`
- [ ] Await params before using: `const { param } = await params;`
- [ ] Add smart breadcrumb label if resource detail page
- [ ] Consider context-aware navigation for edit forms
- [ ] Add field descriptions for editable identifiers

### Existing Routes to Update

- [ ] `app/(organization)/org/[slug]/*` - Update to async params
- [ ] `app/dashboard/*` - Check for any dynamic segments
- [ ] Any other `[param]` routes in the app

---

## Testing Results

### Before Fixes
- ❌ 3 console warnings about params
- ❌ Breadcrumb: "...> E8AJzomYpsNAc33yXBFoeKEh5UY6Quit"
- ❌ Slug field appeared disabled in edit
- ❌ Cancel went to wrong page
- ❌ Success went to wrong page

### After Fixes
- ✅ Zero console warnings
- ✅ Breadcrumb: "...> Organization Details"
- ✅ Slug editable with warning message
- ✅ Cancel returns to detail page
- ✅ Success returns to detail page with updated data

---

## Best Practices Established

### 1. Always Await Params First
```typescript
// ✅ Correct order
const { id } = await params;
const data = await fetchData(id);

// ❌ Wrong - causes warnings
const data = await fetchData(params.id);
```

### 2. Smart Breadcrumbs for IDs
```typescript
// Generic pattern for all resources
if (isIdSegment(segment)) {
  switch (prevSegment) {
    case "organizations": return "Organization Details";
    case "users": return "User Details";
    case "teams": return "Team Details";
    default: return "Details";
  }
}
```

### 3. Context-Aware Forms
```typescript
// Edit context - return to detail
<Form onCancelPath={`/resource/${id}`} />

// Create context - return to list
<Form /> // Uses default
```

### 4. Warn on Dangerous Edits
```typescript
// For fields that affect existing links/references
<FieldDescription>
  {mode === "edit" && (
    <span className="text-amber-600">
      ⚠️ Changing this affects existing links
    </span>
  )}
</FieldDescription>
```

---

## Alternative Considered

### Alternative 1: Server-Side Breadcrumb with Organization Name

**Approach:** Fetch organization in layout, pass to breadcrumb

**Pros:**
- Shows actual organization name in breadcrumb
- More accurate representation

**Cons:**
- ❌ Extra database query on every page load
- ❌ Increases page load time
- ❌ Complicates layout logic
- ❌ Need to handle for every resource type

**Decision:** ❌ **Rejected** - Performance overhead not worth cosmetic gain

### Alternative 2: Keep Slug Disabled in Edit

**Approach:** Never allow slug editing

**Pros:**
- Safer - no broken links

**Cons:**
- ❌ No way to fix typos
- ❌ Can't rebrand organization
- ❌ Requires database migration for fixes

**Decision:** ❌ **Rejected** - Too restrictive for admin use case

### Alternative 3: Separate Routes for Edit

**Approach:** Different routes: `/edit-and-stay`, `/edit-and-list`

**Pros:**
- Explicit navigation intent

**Cons:**
- ❌ Confusing UX
- ❌ Route proliferation
- ❌ Duplicate code

**Decision:** ❌ **Rejected** - Over-engineering

---

## Future Enhancements

### Short-term
- [ ] Apply async params pattern to organization layout routes
- [ ] Add breadcrumb patterns for users, teams when implemented
- [ ] Add "slug changed" notification if slug is updated

### Long-term
- [ ] Implement slug redirects (old slug → new slug)
- [ ] Add breadcrumb trail with "real" names via React Context
- [ ] Add "slug history" to track changes for audit

---

## Related Decisions

- **ADR-003**: Organization Edit and Detail Implementation (UX context)
- **ADR-005** (Future): Slug Change Redirects and Aliases

---

## References

- [Next.js 15 Release Notes - Async Request APIs](https://nextjs.org/blog/next-15#async-request-apis)
- [Next.js Docs - Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [React 19 - Async/Await Patterns](https://react.dev/blog/2024/04/25/react-19)
- Project: [ADR-003](./ADR-003-organization-edit-detail-implementation.md)

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Implemented and tested  
**Next:** Apply pattern to other dynamic routes
