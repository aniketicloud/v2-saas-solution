# Access Control & Authorization

This document describes the comprehensive access control system implemented in the v2-saas-solution project.

## Overview

The application uses a **role-based access control (RBAC)** system combined with **organization membership checks** to ensure proper authorization across different routes.

## Access Control Rules

### 1. Admin Routes (`/admin/*`)

**Rule**: Only users with `role === "admin"` can access admin routes.

- ✅ **Allowed**: Users with `user.role === "admin"`
- ❌ **Denied**: All other users (including regular users with organizations)
- 🔀 **Redirect**: Non-admin users are redirected to `/unauthorized`

**Implementation**: `app/(admin)/admin/layout.tsx`

```typescript
// CRITICAL: Only users with admin role can access /admin routes
if (session.user.role !== "admin") {
  redirect("/unauthorized");
}
```

**Example**:
- `admin@email.com` (role: admin) → ✅ Can access `/admin/dashboard`
- `user@email.com` (role: user) → ❌ Redirected to `/unauthorized`

---

### 2. Organization Routes (`/org/[slug]/*`)

**Rule**: Only users who are members of the specific organization can access that organization's routes. Admins are redirected to their admin dashboard.

- ✅ **Allowed**: Users who are members of the organization
- ❌ **Denied**: Non-members and admins
- 🔀 **Redirect**: 
  - Admins → `/admin/dashboard`
  - Non-members → `/unauthorized`

**Implementation**: `app/(organization)/org/[slug]/layout.tsx`

```typescript
// Redirect admins to admin dashboard
if (session.user.role === "admin") {
  redirect("/admin/dashboard");
}

// Verify user is a member of this organization
const isMember = organization.members.some(
  (member) => member.userId === session.user.id
);

if (!isMember) {
  redirect("/unauthorized");
}
```

**Example**:
- Member of "acme-inc" → ✅ Can access `/org/acme-inc/dashboard`
- Not a member → ❌ Redirected to `/unauthorized`
- Admin user → 🔀 Redirected to `/admin/dashboard`

---

### 3. User Dashboard (`/dashboard/*`)

**Rule**: Authenticated users with at least one organization membership can access their dashboard. Admins are redirected to admin dashboard, users without organizations are redirected to no-organization page.

- ✅ **Allowed**: Regular users with organization membership
- ❌ **Denied**: Unauthenticated users
- 🔀 **Redirect**: 
  - Unauthenticated → `/login`
  - Admins → `/admin/dashboard`
  - No organizations → `/no-organization`

**Implementation**: `app/dashboard/layout.tsx`

```typescript
// Redirect admins to admin dashboard
if (sessionInfo.user.role === "admin") {
  redirect("/admin/dashboard");
}

// Check if user has any organizations
const organizations = await auth.api.listOrganizations({ headers: h });

// If user has no organizations, redirect to no-organization page
if (!organizations || organizations.length === 0) {
  redirect("/no-organization");
}
```

**Example**:
- `user@email.com` with organizations → ✅ Can access `/dashboard`
- `admin@email.com` → 🔀 Redirected to `/admin/dashboard`
- New user with no organizations → 🔀 Redirected to `/no-organization`

---

## Special Pages

### No Organization Page (`/no-organization`)

**Purpose**: Landing page for authenticated users who are not members of any organization.

**Who sees this**:
- New users who just signed up
- Users who were removed from all organizations
- Users waiting for organization invitations

**What users can do**:
- View their status
- Sign out
- Contact administrator for help

**What users CANNOT do**:
- Access `/dashboard` routes (no organizations)
- Access `/org/*` routes (no organizations)
- Access `/admin` routes (not an admin)

**Implementation**: `app/no-organization/page.tsx`

---

### Unauthorized Page (`/unauthorized`)

**Purpose**: Error page for authorization failures.

**Who sees this**:
- Regular users trying to access `/admin` routes
- Non-members trying to access organization routes
- Users attempting to access resources they don't have permission for

**Implementation**: `app/unauthorized/page.tsx`

---

## User Journey Flowchart

```
User Logs In / Signs Up
        |
        ↓
   [Middleware checks session]
        |
        ↓
   Is Authenticated?
    /           \
  NO            YES
   |             |
   ↓             ↓
/login    Is role === "admin"?
            /              \
          YES              NO
           |                |
           ↓                ↓
    /admin/dashboard   Has organizations?
                        /              \
                      YES              NO
                       |                |
                       ↓                ↓
                   /dashboard    /no-organization
```

---

## Authorization Checks Summary

| Route Pattern | Auth Required | Role Check | Org Check | Redirect On Fail |
|---------------|---------------|------------|-----------|------------------|
| `/login` | ❌ No | N/A | N/A | N/A |
| `/signup` | ❌ No | N/A | N/A | N/A |
| `/admin/*` | ✅ Yes | Admin only | N/A | `/unauthorized` |
| `/dashboard/*` | ✅ Yes | Not admin | Must have orgs | `/no-organization` or `/admin/dashboard` |
| `/org/[slug]/*` | ✅ Yes | Not admin | Must be member | `/unauthorized` or `/admin/dashboard` |
| `/no-organization` | ✅ Yes | N/A | N/A | N/A |
| `/unauthorized` | ❌ No | N/A | N/A | N/A |

---

## Test Scenarios

### Scenario 1: Admin User Access

**Given**: User logged in as `admin@email.com` (role: admin)

| Attempts to access | Result | Reason |
|--------------------|--------|--------|
| `/admin/dashboard` | ✅ Allowed | Admin role |
| `/dashboard` | 🔀 Redirect to `/admin/dashboard` | Admins use admin portal |
| `/org/any-slug` | 🔀 Redirect to `/admin/dashboard` | Admins use admin portal |

---

### Scenario 2: Regular User with Organization

**Given**: User logged in as `user@email.com` (role: user, member of "acme-inc")

| Attempts to access | Result | Reason |
|--------------------|--------|--------|
| `/admin/dashboard` | ❌ Redirect to `/unauthorized` | Not an admin |
| `/dashboard` | ✅ Allowed | Has organizations |
| `/org/acme-inc/dashboard` | ✅ Allowed | Member of this org |
| `/org/other-company/dashboard` | ❌ Redirect to `/unauthorized` | Not a member |

---

### Scenario 3: New User (No Organizations)

**Given**: User logged in as `newuser@email.com` (role: user, no organizations)

| Attempts to access | Result | Reason |
|--------------------|--------|--------|
| `/admin/dashboard` | ❌ Redirect to `/unauthorized` | Not an admin |
| `/dashboard` | 🔀 Redirect to `/no-organization` | No organizations |
| `/org/any-slug` | ❌ Redirect to `/unauthorized` | No organizations |
| `/no-organization` | ✅ Allowed | Expected page for this state |

---

## Implementation Details

### Better Auth Integration

Access control leverages Better Auth's built-in features:

1. **Session Management**: `auth.api.getSession()` provides user info and role
2. **Organization Plugin**: `auth.api.listOrganizations()` and `auth.api.getFullOrganization()` for membership checks
3. **Admin Plugin**: `user.role` field managed by Better Auth

### Server-Side Enforcement

All authorization checks are performed server-side in layout files:
- Cannot be bypassed by client-side manipulation
- Uses `redirect()` from Next.js for secure navigation
- Runs on every route navigation

### Middleware Session Validation

`middleware.ts` ensures valid sessions:
- Verifies session with Better Auth API
- Clears invalid session cookies automatically
- Redirects to login for protected routes

---

## Security Best Practices

✅ **DO**:
- Always check authorization server-side in layouts
- Use `redirect()` for unauthorized access attempts
- Verify organization membership for org routes
- Clear invalid sessions automatically

❌ **DON'T**:
- Rely solely on client-side checks (can be bypassed)
- Assume authenticated = authorized
- Skip role checks on sensitive routes
- Allow admins to access regular user routes

---

## Adding New Protected Routes

### For Admin-Only Features

Add route under `app/(admin)/admin/`:
- Layout automatically enforces admin role check
- No additional auth code needed in page components

### For Organization Features

Add route under `app/(organization)/org/[slug]/`:
- Layout automatically enforces membership check
- Access `params.slug` to get current organization

### For User Dashboard Features

Add route under `app/dashboard/`:
- Layout automatically enforces authentication and organization membership
- No additional auth code needed

---

## Troubleshooting

### User Can't Access Dashboard

**Symptoms**: Redirected to `/no-organization`

**Solution**: User needs to be invited to or create an organization

**Check**:
```sql
-- Check user's organizations
SELECT * FROM organization_members WHERE user_id = '<user-id>';
```

### User Can't Access Specific Organization

**Symptoms**: Redirected to `/unauthorized` when accessing `/org/[slug]`

**Solution**: User must be added as member of that organization

**Check**:
```sql
-- Check organization membership
SELECT * FROM organization_members 
WHERE user_id = '<user-id>' AND organization_id = '<org-id>';
```

### Admin Redirected from Dashboard

**Symptoms**: Cannot access `/dashboard`, redirected to `/admin/dashboard`

**Solution**: This is expected behavior - admins use the admin portal

**Workaround**: If admin needs to act as regular user, sign in with different account

---

## Related Documentation

- [Better Auth Configuration](../lib/auth.ts)
- [Database Seeding](./DATABASE_SEEDING.md) - Test user credentials
- [Project Setup](./PROJECT_SETUP.md) - Environment configuration
- [ADR-002: Admin Portal Navigation](./adr/ADR-002-admin-portal-home-navigation.md)
