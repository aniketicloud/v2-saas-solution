# ADR-003: Organization Edit and Detail Implementation

**Date:** October 16, 2025  
**Status:** Accepted  
**Decision Makers:** Development Team  
**Related:** [ADR-001](./ADR-001-admin-organizations-restructuring.md), [ADR-002](./ADR-002-admin-portal-home-navigation.md)  
**Tags:** #crud #organizations #better-auth #prisma

---

## Context and Problem Statement

After implementing shareable CRUD routes (ADR-001), we needed to implement the edit and detail functionality for organizations. The challenges were:

1. **Better Auth Limitations**: Better Auth organization plugin doesn't expose `updateOrganization` or `getOrganizationById` APIs
2. **Data Fetching**: How to fetch organization details including members, teams, and invitations
3. **Edit Flow**: Best practices for edit forms and validation
4. **Error Handling**: Proper 404 handling for non-existent organizations
5. **Naming Conventions**: Consistent naming for actions and queries

---

## Research: Better Auth Organization API

### Available APIs ✅
- `auth.api.createOrganization()` - Create new organization
- `auth.api.listOrganizations()` - List all organizations
- `auth.api.getFullOrganization({ organizationSlug })` - Get by slug with members

### Missing APIs ❌
- No `updateOrganization()` - Cannot update org details
- No `getOrganizationById()` - Can only get by slug
- No `deleteOrganization()` - Cannot remove organizations

### Industry Pattern

When framework/plugin lacks functionality, use direct database access:
- **Next.js + Prisma**: Use Prisma Client directly
- **Laravel + Eloquent**: Use Eloquent models
- **Django + ORM**: Use Django ORM

**Precedent**: Better Auth documentation recommends using Prisma directly for custom operations.

---

## Decision

### 1. Use Hybrid Approach: Better Auth + Prisma ✅

**For Operations:**
| Operation | Method | Reason |
|-----------|--------|--------|
| **Create** | Better Auth `createOrganization()` | ✅ Available, handles permissions |
| **Read (List)** | Better Auth `listOrganizations()` | ✅ Available, optimized |
| **Read (Detail)** | Prisma `findUnique()` | ⚠️ Need members/teams/invitations |
| **Update** | Prisma `update()` | ❌ Not available in Better Auth |
| **Delete** | Prisma `delete()` (future) | ❌ Not available in Better Auth |

**Rationale:**
- ✅ Use framework when available (Better Auth for create/list)
- ✅ Use Prisma for missing functionality (update/detail)
- ✅ Maintains consistency with existing patterns
- ✅ Allows custom business logic

### 2. Query Organization Structure

**Created Three Query Functions:**

```typescript
// Simple - for edit form (name + slug only)
getOrganization(id) → { id, name, slug, createdAt, logo, metadata }

// Detailed - for detail page (includes relations)
getOrganizationWithDetails(id) → {
  ...organization,
  members: [...],
  teams: [...],
  invitations: [...]
}

// By Slug - uses Better Auth (existing)
getFullOrganization(slug) → Better Auth API
```

**Why Three Functions:**
- ✅ **Performance**: Don't fetch unnecessary data
- ✅ **Clarity**: Function name indicates what you get
- ✅ **Flexibility**: Choose based on use case

### 3. Update Implementation with Slug Validation

**Server Action:**
```typescript
updateOrganization(id, name, slug) {
  1. Validate input with Zod schema
  2. Check if slug is taken by another org
  3. Update using Prisma
  4. Return success/error
}
```

**Slug Uniqueness Check:**
```typescript
prisma.organization.findFirst({
  where: {
    slug: newSlug,
    NOT: { id: currentOrgId }  // ← Exclude current org
  }
})
```

**Why Slug Check:**
- ✅ Prevents duplicate slugs
- ✅ Allows keeping same slug (edit without changing)
- ✅ Better UX than database constraint error

### 4. 404 Handling with not-found.tsx

**Pattern:**
```typescript
// page.tsx
const org = await getOrganization(id)
if (!org) notFound()  // Triggers not-found.tsx

// not-found.tsx
export default function OrganizationNotFound() {
  return <UserFriendly404 />
}
```

**Benefits:**
- ✅ Custom 404 UI per route
- ✅ "Back to Organizations" button
- ✅ Better UX than generic 404

### 5. Detail Page Information Architecture

**Sections:**
1. **Organization Information** (left card)
   - Name, Slug, ID, Created Date
2. **Statistics** (right card)
   - Members count, Teams count, Invitations count
3. **Members Section** (full width)
   - Placeholder for future implementation

**Design Principles:**
- ✅ Two-column layout for overview
- ✅ Icons for visual hierarchy
- ✅ Badges for status indicators
- ✅ Code formatting for technical IDs
- ✅ "Edit Organization" button in header

---

## Implementation Details

### Files Created/Modified

#### New Files ✅
```
app/(admin)/admin/organizations/
  ├── [id]/not-found.tsx        ← Custom 404
  └── _lib/queries.ts            ← Added getOrganizationWithDetails()
```

#### Modified Files ✅
```
app/(admin)/admin/organizations/
  ├── [id]/page.tsx              ← Shows real data now
  ├── [id]/edit/page.tsx         ← Functional edit form
  ├── _lib/actions.ts            ← Implemented updateOrganization()
  ├── _lib/queries.ts            ← Added detail query
  └── _components/
      └── organization-form.tsx  ← Added edit mode logic
```

### Code Patterns

#### Update Action with Validation
```typescript
export async function updateOrganization(id, name, slug) {
  // 1. Validate input
  const validationResult = organizationSchema.safeParse({ name, slug })
  if (!validationResult.success) return { success: false, error: "..." }

  // 2. Check slug uniqueness
  const existingOrg = await prisma.organization.findFirst({
    where: { slug, NOT: { id } }
  })
  if (existingOrg) return { success: false, error: "Slug taken" }

  // 3. Update
  const updated = await prisma.organization.update({
    where: { id },
    data: { name, slug }
  })

  return { success: true, data: updated }
}
```

#### Form Mode Handling
```typescript
<OrganizationForm
  mode="edit"  // or "create"
  organizationId={org.id}
  initialData={{ name: org.name, slug: org.slug }}
/>

// Inside form:
if (mode === "create") {
  await createOrganization(...)  // Better Auth
} else {
  await updateOrganization(...)  // Prisma
}
```

---

## Consequences

### Positive ✅

- ✅ **Full CRUD**: Create, read, update now functional
- ✅ **Enterprise Pattern**: Hybrid approach is industry standard
- ✅ **Performance**: Only fetch needed data
- ✅ **User Experience**: Custom 404, detailed views, proper validation
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Scalability**: Easy to add delete later

### Negative ⚠️

- ⚠️ **Dual Patterns**: Some ops use Better Auth, some use Prisma (acceptable trade-off)
- ⚠️ **Sync Risk**: Must keep Prisma queries in sync with Better Auth schema (mitigate: use generated types)

### Neutral 🔄

- 🔄 **Delete**: Still TODO, will follow same Prisma pattern
- 🔄 **Member Management**: Placeholder for future
- 🔄 **Teams**: Placeholder for future

---

## Best Practices Applied

### 1. Enterprise Naming Conventions ✅

| Action | Name | Pattern |
|--------|------|---------|
| Create | `createOrganization` | Verb + Noun |
| Read List | `getOrganizations` | Get + Plural |
| Read One | `getOrganization` | Get + Singular |
| Read Detail | `getOrganizationWithDetails` | Get + Noun + Qualifier |
| Update | `updateOrganization` | Verb + Noun |
| Delete | `deleteOrganization` | Verb + Noun |

### 2. Error Handling ✅

```typescript
// Server actions return structured response
{ success: boolean, data?: T, error?: string }

// Client shows toast
if (result.success) {
  toast.success("Organization updated!")
} else {
  toast.error(result.error)
}

// Pages handle not found
if (!org) notFound()  // Custom 404 UI
```

### 3. Form UX ✅

- ✅ **Loading states**: Spinner during submit
- ✅ **Validation**: Inline error messages
- ✅ **Feedback**: Toast notifications
- ✅ **Navigation**: Auto-redirect on success
- ✅ **Cancellation**: Back to list button

### 4. Data Fetching ✅

- ✅ **Performance**: Fetch only needed data
- ✅ **Type Safety**: Prisma generated types
- ✅ **Error Handling**: tryCatch utility
- ✅ **Logging**: Console errors for debugging

---

## Alternative Considered

### Alternative 1: Wait for Better Auth Update

**Pros:**
- Native support
- Consistent API

**Cons:**
- ❌ Blocking feature development
- ❌ No ETA on when available
- ❌ May never be added

**Decision:** ❌ **Rejected** - Can't wait indefinitely

### Alternative 2: Custom Better Auth Plugin

**Pros:**
- Extends Better Auth
- Keeps API consistent

**Cons:**
- ❌ Complex to maintain
- ❌ May break on Better Auth updates
- ❌ Overkill for simple CRUD

**Decision:** ❌ **Rejected** - Unnecessary complexity

### Alternative 3: GraphQL Layer

**Pros:**
- Flexible data fetching
- Standard pattern

**Cons:**
- ❌ Massive overhead for simple CRUD
- ❌ Extra dependencies
- ❌ Team needs GraphQL knowledge

**Decision:** ❌ **Rejected** - Over-engineering

---

## Testing Checklist

### Edit Functionality ✅

- [ ] Navigate to edit page from detail view
- [ ] Form pre-fills with current data
- [ ] Name field updates correctly
- [ ] Slug can be manually edited
- [ ] Validation errors show inline
- [ ] Duplicate slug shows error
- [ ] Successful update shows toast
- [ ] Redirects to list after success
- [ ] Loading spinner appears during submit
- [ ] Cancel button navigates back

### Detail View ✅

- [ ] Organization name displays in header
- [ ] All information cards show correct data
- [ ] Statistics show accurate counts
- [ ] Created date formats correctly
- [ ] Edit button navigates to edit page
- [ ] 404 page shows for invalid ID
- [ ] Back button works from 404

### Data Integrity ✅

- [ ] Cannot create duplicate slugs
- [ ] Slug uniqueness allows self (edit without change)
- [ ] Updates persist to database
- [ ] Relations (members/teams) preserved

---

## Future Enhancements

### Short-term (Next Sprint)
- [ ] Implement delete organization
- [ ] Add confirmation dialog for destructive actions
- [ ] Implement member management (add/remove members)
- [ ] Add organization logo upload
- [ ] Add organization metadata editor

### Long-term
- [ ] Soft delete with restore functionality
- [ ] Organization archive instead of delete
- [ ] Team management within organization
- [ ] Organization settings page
- [ ] Audit log for organization changes
- [ ] Bulk operations (multi-select edit/delete)

---

## Related Decisions

- **ADR-001**: Organizations Module Restructuring (folder structure)
- **ADR-002**: Admin Portal Home Navigation (breadcrumb context)
- **ADR-004** (Future): Organization Member Management
- **ADR-005** (Future): Soft Delete Pattern

---

## References

- [Better Auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [React Hook Form](https://react-hook-form.com/)
- Project: [ADR-001](./ADR-001-admin-organizations-restructuring.md)

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Implemented and ready for testing  
**Next:** Implement delete functionality
