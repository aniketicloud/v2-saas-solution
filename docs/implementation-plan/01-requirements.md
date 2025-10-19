# Part 1: Core Requirements & User Stories

**Last Updated**: October 17, 2025

---

## 🎯 Core Requirements Overview

The application implements a multi-tenant SaaS platform with:
- Two-tier role system (System + Organization levels)
- Dynamic feature modules per organization
- Subscription-based access control
- Granular permission management

---

## 👤 User Personas

### 1. System Administrator (You)
**User Model**: `role = "admin"`  
**Database**: User table

**Capabilities**:
- ✅ Create/delete/edit any organization
- ✅ Create users (both admin and regular users)
- ✅ Manage subscriptions for all organizations
- ✅ Enable/disable modules for any organization
- ✅ Access any organization with full "owner" permissions
- ✅ View all system-wide metrics and analytics
- ✅ Impersonate users (if needed)

**Entry Point**: `/admin/dashboard`

**Example Workflow**:
```
1. Login with admin credentials
2. Lands on /admin/dashboard
3. Navigate to /admin/organizations
4. Create "Nike" organization
5. Navigate to /admin/organizations/nike-id/modules
6. Enable "visitor_management" and "ticket_management" modules
7. Navigate to /admin/users
8. Create user "John" with role="user"
9. Add John to Nike organization as member with role="admin"
10. Set Nike's subscription to "monthly" plan
```

---

### 2. Regular User (John)
**User Model**: `role = "user"`  
**Database**: User table

**Capabilities**:
- ✅ Create other users with `role = "user"` only (cannot create admins)
- ✅ Be added as member to organizations
- ❌ Cannot create organizations
- ❌ Cannot access admin portal

**Entry Point**: Redirects to active organization or org selector

**Example Workflow**:
```
1. Login with john@example.com
2. System checks: role="user", activeOrganizationId=nike-id
3. Redirects to /org/nike-slug/dashboard
4. Sees organization dashboard with enabled modules
```

---

### 3. Organization Admin (John in Nike Org)
**Member Model**: `role = "admin"` within Nike organization  
**Database**: Member table

**Capabilities**:
- ✅ Invite members to the organization
- ✅ Remove members from the organization
- ✅ Update member roles (change between admin/member)
- ✅ Cancel pending invitations
- ✅ View organization settings
- ✅ Use all enabled modules (visitors, tickets, inventory)
- ✅ Perform CRUD operations within enabled modules
- ❌ **CANNOT** edit organization name/slug
- ❌ **CANNOT** delete the organization
- ❌ **CANNOT** manage subscription/billing
- ❌ **CANNOT** enable/disable modules

**Entry Point**: `/org/nike-slug/dashboard`

**Example Workflow**:
```
1. Login as John (org admin)
2. Lands on /org/nike-slug/dashboard
3. Navigate to /org/nike-slug/members
4. Click "Invite Member"
5. Enter email: sarah@example.com, role: member
6. Send invitation
7. Navigate to /org/nike-slug/modules/visitors
8. Create new visitor entry
9. Navigate to /org/nike-slug/settings
10. View org details (cannot edit name/slug)
```

---

### 4. Organization Member (Sarah in Nike Org)
**Member Model**: `role = "member"` within Nike organization  
**Database**: Member table

**Capabilities**:
- ✅ View organization members
- ✅ View organization settings (read-only)
- ✅ Use enabled modules with limited permissions:
  - **Visitors**: View, create, check-in, check-out (cannot delete)
  - **Tickets**: View, create, update (cannot delete, assign, close)
  - **Inventory**: View only (cannot create, update, delete)
- ❌ **CANNOT** invite members
- ❌ **CANNOT** manage member roles
- ❌ **CANNOT** edit organization settings
- ❌ **CANNOT** access admin functions

**Entry Point**: `/org/nike-slug/dashboard`

---

## 🔐 Authentication & Authorization Flow

### Login Flow Diagram

```
┌─────────────────┐
│   User Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Check User.role         │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────┐
│"admin"│  │"user"│
└───┬───┘  └──┬───┘
    │         │
    │         ▼
    │    ┌──────────────────────┐
    │    │ activeOrganizationId?│
    │    └──────┬───────────────┘
    │           │
    │      ┌────┴────┐
    │      │         │
    │      ▼         ▼
    │   ┌─────┐  ┌──────┐
    │   │ Yes │  │  No  │
    │   └──┬──┘  └──┬───┘
    │      │        │
    │      ▼        ▼
    │   ┌─────────────┐  ┌──────────────────┐
    │   │ Get Member  │  │ Select Org Page  │
    │   │    Role     │  └──────────────────┘
    │   └──┬──────────┘
    │      │
    │      ▼
    │   ┌──────────────────────┐
    │   │ /org/[slug]/dashboard│
    │   └──────────────────────┘
    │
    ▼
┌───────────────────┐
│ /admin/dashboard  │
└───────────────────┘
```

### Permission Check Flow

```
Action Request (e.g., "Delete Organization")
    ↓
┌─────────────────────────────────────┐
│ Check: Is User.role === "admin"?    │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  ┌───┐    ┌────┐
  │Yes│    │ No │
  └─┬─┘    └─┬──┘
    │         │
    ▼         ▼
 ┌─────┐  ┌────────────────────────────┐
 │Allow│  │ Check Member.role & AC     │
 └─────┘  └────────┬───────────────────┘
                   │
              ┌────┴────┐
              │         │
              ▼         ▼
           ┌─────┐  ┌──────┐
           │Allow│  │ Deny │
           └─────┘  └──────┘
```

---

## 📋 Detailed User Stories

### Story 1: System Admin Creates Organization

**As a** system administrator  
**I want to** create a new organization  
**So that** I can onboard a new client

**Acceptance Criteria**:
- [ ] Only users with `User.role = "admin"` can create organizations
- [ ] Organization requires: name, slug (auto-generated from name)
- [ ] Creator is automatically added as member with `role = "owner"`
- [ ] Organization starts with no enabled modules
- [ ] Organization starts with "free" subscription plan
- [ ] Slug must be unique and URL-friendly
- [ ] After creation, redirect to organization details page

**Implementation**: `lib/auth.ts`
```typescript
allowUserToCreateOrganization: async (user) => {
  return user.role === "admin";
}
```

---

### Story 2: System Admin Enables Modules for Organization

**As a** system administrator  
**I want to** enable specific modules for an organization  
**So that** the organization can access only the features they need

**Acceptance Criteria**:
- [ ] Only system admins can enable/disable modules
- [ ] Available modules: visitor_management, ticket_management, inventory
- [ ] Toggle switches for each module
- [ ] Changes take effect immediately (no refresh needed)
- [ ] Module links appear in org navigation when enabled
- [ ] Disabled module pages return 404
- [ ] Audit trail: who enabled/disabled and when

**Page**: `/admin/organizations/[id]/modules`

---

### Story 3: System Admin Creates Regular User

**As a** system administrator  
**I want to** create user accounts  
**So that** I can provide access to staff members

**Acceptance Criteria**:
- [ ] System admin can create users with any role (admin or user)
- [ ] Regular users can only create users with `role = "user"`
- [ ] Required fields: email, name, password
- [ ] Email must be unique
- [ ] Password must meet security requirements (min 8 chars)
- [ ] User receives email notification (optional)
- [ ] After creation, can immediately add to organizations

**Page**: `/admin/users/new`

---

### Story 4: Regular User (John) Logs In

**As a** regular user (John)  
**I want to** log in and access my organization  
**So that** I can perform my daily tasks

**Acceptance Criteria**:
- [ ] Login with email and password
- [ ] If `activeOrganizationId` exists, redirect to `/org/[slug]/dashboard`
- [ ] If no active org, show organization selector
- [ ] If member of multiple orgs, can switch between them
- [ ] Session persists for 7 days (Better Auth default)
- [ ] Can sign out from any page

**Entry Point**: `/auth/login` → `/org/nike/dashboard`

---

### Story 5: Org Admin (John) Invites New Member

**As an** organization admin  
**I want to** invite new members to my organization  
**So that** I can collaborate with my team

**Acceptance Criteria**:
- [ ] Must have `Member.role = "admin"` or `"owner"`
- [ ] Enter email address (validated on client and server)
- [ ] Select role: owner, admin, or member
- [ ] Invitation expires in 7 days (configurable)
- [ ] Invitee receives email with acceptance link
- [ ] Can cancel pending invitations
- [ ] Cannot invite user who is already a member
- [ ] Form uses Zod validation + React Hook Form

**Page**: `/org/[slug]/members/invite`

---

### Story 6: Org Admin (John) Manages Member Roles

**As an** organization admin  
**I want to** change member roles  
**So that** I can adjust team permissions as needed

**Acceptance Criteria**:
- [ ] Must have `Member.role = "admin"` or `"owner"`
- [ ] Can change any member's role (owner, admin, member)
- [ ] Cannot change own role (prevents lockout)
- [ ] Owners can demote other owners
- [ ] Changes take effect immediately
- [ ] Member receives notification of role change (optional)
- [ ] Shows confirmation dialog before changing role

**Page**: `/org/[slug]/members/[memberId]/edit`

---

### Story 7: Org Admin Attempts to Edit Organization Settings

**As an** organization admin  
**I want to** understand why I can't edit organization details  
**So that** I know who to contact for changes

**Acceptance Criteria**:
- [ ] Org admin can VIEW all organization settings
- [ ] "Edit" button is hidden (client-side) for org admins
- [ ] Direct access to edit route redirects back to view mode
- [ ] Shows message: "Contact system administrator to edit organization details"
- [ ] System admin sees "Edit" button and can make changes
- [ ] Permissions checked on both client and server

**Page**: `/org/[slug]/settings/general`

---

### Story 8: System Admin Views Any Organization

**As a** system administrator  
**I want to** access any organization's workspace  
**So that** I can assist with issues or configure settings

**Acceptance Criteria**:
- [ ] System admin can access `/org/[any-slug]/dashboard` without being a member
- [ ] Granted virtual "owner" role permissions
- [ ] Navigation shows "🛡️ System Admin" badge
- [ ] Can perform all actions that org owner can do
- [ ] Can return to admin portal via "← Admin Portal" link
- [ ] Actions are audited with admin user ID

**Implementation**: Organization layout checks `User.role === "admin"`

---

### Story 9: Member Uses Visitor Management Module

**As an** organization member  
**I want to** check in visitors  
**So that** I can track who enters our facility

**Acceptance Criteria**:
- [ ] Module must be enabled by system admin first
- [ ] Can view list of all visitors
- [ ] Can create new visitor (name, email, purpose, host)
- [ ] Can check-in visitor (records timestamp)
- [ ] Can check-out visitor (records exit time)
- [ ] Cannot delete visitor records (admin only)
- [ ] Search and filter by date, name, status
- [ ] Export visitor log (CSV/PDF)

**Page**: `/org/[slug]/modules/visitors`

---

### Story 10: Organization Changes Subscription Plan

**As a** system administrator  
**I want to** change an organization's subscription  
**So that** they can access more features or reduce costs

**Acceptance Criteria**:
- [ ] Only system admin can change subscriptions
- [ ] Available plans: free, monthly, yearly
- [ ] Plan limits:
  - Free: Max 2 modules, 10 members
  - Monthly: Max 5 modules, 50 members
  - Yearly: Unlimited modules, unlimited members
- [ ] Shows current plan, next billing date, usage metrics
- [ ] Downgrade requires confirmation
- [ ] Upgrade takes effect immediately
- [ ] Downgrade takes effect at end of billing period
- [ ] Sends notification to org owner

**Page**: `/admin/organizations/[id]/subscription`

---

## 🚫 Explicit Restrictions

### What Org Admins CANNOT Do

1. **Edit Organization Details**
   - Cannot change organization name
   - Cannot change organization slug
   - Cannot upload/change organization logo
   - **Reason**: Prevents unauthorized rebranding or impersonation

2. **Delete Organization**
   - Cannot delete the organization
   - **Reason**: Prevents accidental data loss

3. **Manage Subscription**
   - Cannot view billing details
   - Cannot upgrade/downgrade plan
   - Cannot cancel subscription
   - **Reason**: Financial control reserved for system admin

4. **Enable/Disable Modules**
   - Cannot enable new modules
   - Cannot disable existing modules
   - **Reason**: Feature access tied to subscription tier

5. **Create Organizations**
   - Cannot create new organizations
   - **Reason**: Platform-level resource management

### What Regular Members CANNOT Do

1. **Member Management**
   - Cannot invite new members
   - Cannot remove members
   - Cannot change member roles

2. **Organization Settings**
   - Cannot view billing information
   - Cannot view subscription details
   - Cannot access module configuration

3. **Admin Functions**
   - Cannot access admin portal
   - Cannot impersonate users
   - Cannot view system metrics

---

## ✅ Success Metrics

### For System Admin
- Time to create new organization: < 2 minutes
- Time to enable modules: < 30 seconds per module
- Organizations managed efficiently: 100+

### For Organization Admin
- Time to invite member: < 1 minute
- Member onboarding completion: > 90%
- Daily active users: Track usage

### For Organization Members
- Module load time: < 2 seconds
- Task completion rate: > 95%
- User satisfaction: 4.5+ / 5

---

## 🔄 Edge Cases & Error Handling

### Edge Case 1: System Admin is Also Org Member
**Scenario**: System admin is added as regular member to an organization.  
**Expected**: System admin always has "owner" permissions in any org (virtual role).  
**Implementation**: Check `User.role === "admin"` before checking `Member.role`.

### Edge Case 2: User Has No Organizations
**Scenario**: User logs in but is not a member of any organization.  
**Expected**: Redirect to `/select-organization` with message "No organizations found. Contact admin."  
**Implementation**: Check in root page.tsx.

### Edge Case 3: Disabled Module Direct Access
**Scenario**: User bookmarks `/org/nike/modules/tickets` then admin disables ticket module.  
**Expected**: Return 404 page with message "Module not enabled for this organization."  
**Implementation**: `checkModuleAccess` middleware.

### Edge Case 4: Invitation Expires
**Scenario**: User clicks invitation link after 7 days.  
**Expected**: Show error "Invitation expired. Contact organization admin for new invitation."  
**Implementation**: Better Auth handles expiration automatically.

### Edge Case 5: Last Owner Tries to Leave
**Scenario**: Only owner in organization tries to remove themselves.  
**Expected**: Prevent with error "Cannot remove yourself. Transfer ownership first."  
**Implementation**: Validate in `removeMember` action.

---

## 📝 Notes for Implementation

1. **Always validate permissions on server** - Client-side checks are for UX only
2. **Use Better Auth's `hasPermission` API** - Don't implement custom permission checks
3. **Audit important actions** - Log who did what and when
4. **Handle concurrent updates** - Use optimistic locking if needed
5. **Test with multiple browser sessions** - Ensure permission changes propagate
6. **Use TypeScript strictly** - No `any` types in permission checks
7. **Document all permissions** - Keep permission matrix up to date
8. **Follow principle of least privilege** - Default to deny, explicitly grant

---

**Next**: [Part 2: Database Schema →](./02-database-schema.md)
