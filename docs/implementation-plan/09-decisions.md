# Part 9: Key Decisions & FAQ

**Last Updated**: October 17, 2025

---

## 🎯 Architecture Decisions

Critical choices made during planning with rationale.

---

## 1️⃣ Better Auth Access Control vs. Custom System

### Decision
Use Better Auth's built-in `createAccessControl` instead of building a custom permission system.

### Rationale
- ✅ **Already Integrated**: Part of organization plugin
- ✅ **Battle-Tested**: Used in production by Better Auth users
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Maintainable**: Updates come with Better Auth
- ✅ **Less Code**: Eliminates custom permission tables

### Alternative Considered
Custom `OrganizationMemberPermission` table with resource/action columns.

**Why Rejected:**
- Requires custom middleware
- More code to maintain
- Duplicates Better Auth functionality
- No built-in caching

### Implementation
```typescript
import { createAccessControl } from "better-auth";

const ac = createAccessControl({
  statement: {
    organization: ["create", "update", "delete"],
    member: ["create", "update", "delete"],
    // ... 8 more resources
  },
});
```

---

## 2️⃣ System Admin Role Override

### Decision
Grant system admins (user.role === "admin") a virtual "owner" role in organization context.

### Rationale
- ✅ **Simplicity**: No need for separate system admin permissions
- ✅ **Consistency**: Uses same permission checks as org owners
- ✅ **Visibility**: Clear in UI with system admin badge
- ✅ **Flexibility**: Can be toggled per organization if needed

### Implementation Location
```tsx
// app/(organization)/org/[slug]/layout.tsx
const effectiveRole = session.user.role === "admin" 
  ? "owner" 
  : userMember.role;
```

### Edge Cases Handled
- System admin not in member table → still gets access
- Mixed permissions → system role always wins
- Audit logs → tagged with "system_admin_access"

---

## 3️⃣ Module Settings Storage

### Decision
Use JSON column (`settings`) in `OrganizationModule` table instead of separate settings tables.

### Rationale
- ✅ **Flexibility**: Each module can have different settings schema
- ✅ **Fast Iteration**: No migrations needed for new settings
- ✅ **Simple Queries**: All module data in one row
- ✅ **PostgreSQL JSON**: Full query support with `jsonb`

### Schema
```prisma
model OrganizationModule {
  settings Json? // { maxVisitors: 100, allowWalkIns: true }
}
```

### Query Example
```typescript
// Get modules with specific setting
const modules = await prisma.organizationModule.findMany({
  where: {
    settings: {
      path: ["allowWalkIns"],
      equals: true,
    },
  },
});
```

### Alternative Considered
Separate tables: `VisitorSettings`, `TicketSettings`, `InventorySettings`.

**Why Rejected:**
- Too many tables (3+ per module)
- Complex joins
- Migration needed for every new setting
- Overkill for simple key-value pairs

### When to Reconsider
If a module's settings become extremely complex (> 20 fields) or require indexing, move to dedicated table.

---

## 4️⃣ Subscription Limits Enforcement

### Decision
Enforce limits at **action time** (server actions) rather than UI-only.

### Rationale
- ✅ **Security**: Cannot be bypassed by tampering with client
- ✅ **Consistent**: Same logic for API and UI
- ✅ **Clear Errors**: User gets specific message about limit
- ✅ **Future-Proof**: Works with webhooks/API endpoints

### Pattern
```typescript
export async function inviteMember(slug: string, email: string) {
  // 1. Get subscription
  const subscription = await getSubscription(organizationId);
  
  // 2. Check current usage
  const memberCount = await prisma.member.count({
    where: { organizationId },
  });
  
  // 3. Enforce limit
  if (memberCount >= subscription.plan.maxMembers) {
    return {
      success: false,
      error: `Member limit reached. Upgrade to add more members.`,
    };
  }
  
  // 4. Proceed with action
}
```

### UI Enhancement
Disable buttons when at limit + show tooltip explaining why.

---

## 5️⃣ Teams Feature: Opt-Out for Now

### Decision
Do **NOT** implement teams/groups within organizations in initial release.

### Rationale
- ✅ **YAGNI**: Not required by user stories
- ✅ **Complexity**: Adds significant database/permission overhead
- ✅ **Focus**: Better to perfect core features first
- ✅ **Future-Ready**: Can be added later without breaking changes

### What Teams Would Enable
- Group members into departments/projects
- Assign permissions at team level
- Filter resources by team

### Future Implementation Path
If needed later:
1. Add `Team` model with `organizationId`
2. Add `teamId` to `Member` table
3. Extend permission statement with team resource
4. Update permission checks to consider team membership

### Timeline
Re-evaluate in 3-6 months based on user feedback.

---

## 6️⃣ Module Access Pattern

### Decision
Check module status with **dual validation**: database enabled + permission check.

### Rationale
- ✅ **Security**: Permission check prevents unauthorized access
- ✅ **Flexibility**: Module can be enabled but user lacks permission
- ✅ **Clear Errors**: Different messages for disabled vs. unauthorized

### Implementation
```typescript
// middleware in module routes
export async function checkModuleAccess(
  organizationId: string,
  moduleKey: string
) {
  // 1. Check if module is enabled
  const module = await prisma.organizationModule.findFirst({
    where: { organizationId, moduleKey, isEnabled: true },
  });
  
  if (!module) {
    return { 
      allowed: false, 
      reason: "Module is not enabled for this organization" 
    };
  }
  
  // 2. Check user permission
  const hasPermission = await checkPermission("module", ["view"]);
  
  if (!hasPermission) {
    return { 
      allowed: false, 
      reason: "You don't have permission to access this module" 
    };
  }
  
  return { allowed: true };
}
```

### Why Both Checks?
- Module disabled → Admin should enable it
- Module enabled but no permission → Contact org admin for role change

---

## 7️⃣ Member Invitation Flow

### Decision
Use Better Auth's **built-in invitation system** with `auth.api.inviteUser()`.

### Rationale
- ✅ **Email Sending**: Built-in template system
- ✅ **Token Security**: Handled by Better Auth
- ✅ **Expiration**: Automatic token invalidation
- ✅ **Role Assignment**: Pass role in invitation metadata

### Alternative Considered
Custom invitation table with manual email sending.

**Why Rejected:**
- Reinvents the wheel
- More security risks (token generation, expiration)
- No email templates
- Duplicates Better Auth functionality

### Implementation
```typescript
await auth.api.inviteUser({
  body: {
    email,
    organizationId,
    role, // "owner" | "admin" | "member"
    invitedBy: session.user.id,
  },
  headers: await headers(),
});
```

---

## 8️⃣ Subscription Plan Storage

### Decision
Store plan details in **application code** (TypeScript constants), not database.

### Rationale
- ✅ **Type Safety**: Plan features defined in code
- ✅ **Version Control**: Changes tracked in git
- ✅ **Performance**: No extra database queries
- ✅ **Simplicity**: Plans rarely change

### Implementation
```typescript
// lib/subscription-plans.ts
export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    maxModules: 2,
    maxMembers: 10,
    price: 0,
  },
  MONTHLY: {
    id: "monthly",
    name: "Monthly",
    maxModules: 5,
    maxMembers: 50,
    price: 4900, // cents
  },
  YEARLY: {
    id: "yearly",
    name: "Yearly",
    maxModules: 999,
    maxMembers: 999,
    price: 49000,
  },
} as const;
```

### Database Storage
Only store **which plan** organization is on:
```prisma
model OrganizationSubscription {
  plan String // "free" | "monthly" | "yearly"
}
```

### When to Reconsider
If you need:
- Dynamic pricing per organization
- Custom plans negotiated with customers
- Frequent plan changes (more than 1/month)

Then move plan definitions to database.

---

## 9️⃣ Custom Permissions Per Member

### Decision
Do **NOT** support custom permissions per member in v1.

### Rationale
- ✅ **Complexity**: Requires permission overrides table
- ✅ **UX Confusion**: Hard to explain "partial admin" roles
- ✅ **Maintenance**: Difficult to debug permission issues
- ✅ **Sufficient**: 3 roles cover 90% of use cases

### What This Means
All members with "admin" role have the **same** permissions. No customization per individual.

### Alternative Solution
If specific permissions needed:
- Create custom role names in code (e.g., "billing_admin")
- Add to Better Auth role definitions
- Assign role to specific members

### Future Implementation
If users demand it, add:
```prisma
model MemberPermissionOverride {
  memberId     String
  resource     String
  actions      String[] // ["view", "update"]
}
```

---

## ❓ Frequently Asked Questions

### Q1: Can a user be in multiple organizations?
**Yes.** Better Auth supports this by default. A user can have multiple `Member` records with different `organizationId` values.

### Q2: Can system admins create organizations for users?
**Yes.** System admins can create organizations and assign ownership to any user via the admin portal.

### Q3: What happens when an organization is deleted?
All related records cascade delete:
- Members
- Invitations
- Modules
- Subscription
- Organization-specific data (visitors, tickets, etc.)

### Q4: Can organization owners downgrade their own subscription?
**Not directly.** Only system admins can change subscriptions to prevent accidental downgrades. Future versions may add self-service downgrade with confirmation.

### Q5: How are module limits enforced on Free plan?
When toggling a module, server action checks:
```typescript
const enabledCount = await prisma.organizationModule.count({
  where: { organizationId, isEnabled: true },
});

if (enabledCount >= subscription.plan.maxModules) {
  return { error: "Module limit reached" };
}
```

### Q6: Can members see other members' details?
**Yes, basic info.** All members can view the members list (names, roles) but only admins/owners can see emails or manage members.

### Q7: What if a module is disabled mid-session?
- Module links disappear from nav on next page load
- Direct navigation to module route → error page
- No data loss → re-enabling module restores access

### Q8: How do system admins appear in org member list?
They don't appear unless explicitly added. System admins access orgs via override, not membership.

### Q9: Can organizations have multiple owners?
**Yes.** Multiple members can have "owner" role. Useful for shared ownership.

### Q10: Are subscription limits enforced in real-time?
**At action time.** When inviting a member or enabling a module, the limit is checked. Existing usage is grandfathered until next action.

---

## 🔮 Future Enhancements

Features deferred to v2/v3:

### 1. Stripe Integration
Replace placeholder subscription actions with real Stripe API calls:
- Checkout sessions
- Webhook handlers
- Invoice management
- Usage-based billing

### 2. Advanced Module Settings
Module-specific configuration pages:
- Visitor module: Business hours, capacity limits
- Ticket module: SLA rules, priority levels
- Inventory module: Reorder thresholds

### 3. Audit Logs
Track all permission-sensitive actions:
- Who enabled/disabled modules
- Member invitations and removals
- Role changes
- Settings updates

### 4. API Access
Public API for organization data:
- OAuth 2.0 authentication
- Rate limiting per subscription tier
- Webhook subscriptions

### 5. Teams/Departments
Group members within organizations:
- Team-based permissions
- Department-specific modules
- Hierarchical access control

### 6. Email Customization
Branded invitation emails:
- Custom templates per organization
- Logo upload
- Color scheme matching

### 7. SSO Integration
Enterprise authentication:
- SAML 2.0 support
- Azure AD integration
- Google Workspace sync

### 8. Multi-Factor Authentication
Enhanced security:
- TOTP (Google Authenticator)
- SMS codes
- WebAuthn (passkeys)

---

## 📝 Documentation Index

Complete navigation:

1. [README](./README.md) - Overview and quick start
2. [Requirements](./01-requirements.md) - User stories and personas
3. [Database Schema](./02-database-schema.md) - Models and migrations
4. [Permissions](./03-permissions.md) - Better Auth AC integration
5. [Routing](./04-routing.md) - Route structure and layouts
6. [UI Components](./05-ui-components.md) - Reusable components
7. [Server Actions](./06-server-actions.md) - Action patterns
8. [Page Examples](./07-page-examples.md) - Complete page implementations
9. [Roadmap](./08-roadmap.md) - 6-week implementation timeline
10. **Decisions & FAQ** (this file)

---

## 🎓 Key Takeaways

### Most Important Decisions

1. **Leverage Better Auth**: Use built-in features instead of reinventing
2. **System Admin Override**: Grant virtual "owner" role in org context
3. **JSON Settings**: Flexible module configuration without migrations
4. **Action-Time Enforcement**: Validate limits in server actions, not UI
5. **Dual Validation**: Check both module enabled AND permissions

### Implementation Philosophy

- Start simple, add complexity when needed
- Security in server actions, not client
- Type safety throughout with TypeScript/Zod
- User feedback over perfection

### When to Revisit Decisions

- **Teams**: If 3+ users request department grouping
- **Custom Permissions**: If role system feels too rigid
- **Plan Storage**: If dynamic pricing becomes requirement
- **Module Settings**: If any module exceeds 20 settings

---

**End of Documentation**

**🎉 You now have a complete implementation plan!**

For questions or modifications, refer back to the relevant part using the index above.
