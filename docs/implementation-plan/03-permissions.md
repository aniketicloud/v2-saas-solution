# Part 3: Permission System

**Last Updated**: October 17, 2025

---

## 🔐 Better Auth Access Control Overview

Better Auth provides a **statement-based permission system** that allows you to:
1. Define **resources** (e.g., organization, member, invitation)
2. Define **actions** per resource (e.g., create, update, delete)
3. Create **roles** with specific permission grants
4. Check permissions both server-side and client-side

**Official Documentation**: https://better-auth.com/docs/plugins/organization#access-control

---

## 📋 Permission Statement Definition

The permission statement defines ALL possible resources and their actions in your application.

### Create `lib/permissions.ts`

```typescript
// lib/permissions.ts
import { createAccessControl } from "better-auth/plugins/access";

/**
 * Permission Statement
 * Defines all resources and their possible actions across the application
 */
export const statement = {
  // ==========================================
  // CORE RESOURCES (Better Auth Defaults)
  // ==========================================
  organization: ["create", "update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  
  // ==========================================
  // CUSTOM RESOURCES (Your Application)
  // ==========================================
  
  // Module Management (System-level)
  module: ["view", "enable", "disable", "configure"],
  
  // Subscription Management (System-level)
  subscription: ["view", "manage"],
  
  // ==========================================
  // MODULE-SPECIFIC PERMISSIONS
  // ==========================================
  
  // Visitor Management Module
  visitor: [
    "view",        // List all visitors
    "create",      // Add new visitor
    "update",      // Edit visitor details
    "delete",      // Remove visitor record
    "check_in",    // Check in visitor
    "check_out",   // Check out visitor
    "export",      // Export visitor logs
  ],
  
  // Ticket Management Module
  ticket: [
    "view",        // List all tickets
    "create",      // Create new ticket
    "update",      // Edit ticket details
    "delete",      // Delete ticket
    "assign",      // Assign ticket to member
    "resolve",     // Mark ticket as resolved
    "close",       // Close ticket
    "reopen",      // Reopen closed ticket
    "comment",     // Add comment to ticket
  ],
  
  // Inventory Management Module
  inventory: [
    "view",        // List inventory items
    "create",      // Add new item
    "update",      // Edit item details
    "delete",      // Remove item
    "transfer",    // Transfer item between locations
    "audit",       // Perform inventory audit
    "export",      // Export inventory report
  ],
  
  // ==========================================
  // FUTURE MODULES (Commented out until implemented)
  // ==========================================
  /*
  crm: ["view", "create", "update", "delete", "convert"],
  invoicing: ["view", "create", "update", "delete", "send", "void"],
  reports: ["view", "create", "export", "schedule"],
  integrations: ["view", "configure", "enable", "disable"],
  */
} as const;

// Create access control instance
export const ac = createAccessControl(statement);
```

---

## 👥 Role Definitions

Define three organizational roles with different permission levels:

```typescript
// lib/permissions.ts (continued)

/**
 * ROLE: Owner
 * 
 * Full permissions across the organization.
 * Typically the organization creator or primary admin.
 * 
 * CAN:
 * - Everything an admin can do
 * - Delete the organization
 * - Manage subscription/billing
 * - Enable/disable modules (via system admin)
 */
export const owner = ac.newRole({
  // Core Permissions
  organization: ["create", "update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  
  // Module & Subscription
  module: ["view", "enable", "disable", "configure"],
  subscription: ["view", "manage"],
  
  // Visitor Management
  visitor: ["view", "create", "update", "delete", "check_in", "check_out", "export"],
  
  // Ticket Management
  ticket: ["view", "create", "update", "delete", "assign", "resolve", "close", "reopen", "comment"],
  
  // Inventory Management
  inventory: ["view", "create", "update", "delete", "transfer", "audit", "export"],
});

/**
 * ROLE: Admin
 * 
 * Can manage members and use all enabled modules.
 * CANNOT delete org, manage subscription, or enable/disable modules.
 * 
 * This is the role that John (from requirements) will have.
 * 
 * CAN:
 * - Invite and remove members
 * - Change member roles
 * - Full access to enabled modules
 * - View organization settings
 * 
 * CANNOT:
 * - Delete organization
 * - Edit organization name/slug
 * - Manage subscription
 * - Enable/disable modules
 */
export const admin = ac.newRole({
  // Core Permissions (Limited)
  organization: ["update"],  // ❌ Cannot delete
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  
  // Module & Subscription (View Only)
  module: ["view", "configure"],  // ❌ Cannot enable/disable
  subscription: ["view"],         // ❌ Cannot manage
  
  // Visitor Management (Full Access)
  visitor: ["view", "create", "update", "delete", "check_in", "check_out", "export"],
  
  // Ticket Management (Full Access)
  ticket: ["view", "create", "update", "delete", "assign", "resolve", "close", "reopen", "comment"],
  
  // Inventory Management (Full Access)
  inventory: ["view", "create", "update", "delete", "transfer", "audit", "export"],
});

/**
 * ROLE: Member
 * 
 * Basic access to enabled modules.
 * CANNOT manage members or organization settings.
 * 
 * This is the default role for new members.
 * 
 * CAN:
 * - View organization members
 * - Use enabled modules with limited permissions
 * - View their own profile
 * 
 * CANNOT:
 * - Invite or remove members
 * - Edit organization settings
 * - Delete records in most modules
 */
export const member = ac.newRole({
  // Core Permissions (None)
  organization: [],   // ❌ No org management
  member: [],         // ❌ Cannot manage members
  invitation: [],     // ❌ Cannot send invitations
  
  // Module & Subscription (View Only)
  module: ["view"],
  subscription: ["view"],
  
  // Visitor Management (Limited)
  visitor: ["view", "create", "check_in", "check_out"],  // ❌ Cannot delete
  
  // Ticket Management (Limited)
  ticket: ["view", "create", "update", "comment"],  // ❌ Cannot assign, close, delete
  
  // Inventory Management (Read Only)
  inventory: ["view"],  // ❌ Cannot modify
});
```

---

## 🔌 Integrating with Better Auth

### Update `lib/auth.ts`

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma";

// 👇 Import your custom permissions
import { ac, owner, admin, member } from "./permissions";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  
  emailAndPassword: {
    enabled: true,
  },
  
  plugins: [
    adminPlugin(),
    organization({
      // 🔑 Apply access control with custom roles
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      
      // Only system admins (User.role === "admin") can create organizations
      allowUserToCreateOrganization: async (user) => {
        return user.role === "admin";
      },
      
      // Default role when creating an organization
      creatorRole: "owner",
      
      // Optional: Customize organization creation
      async onCreate(data, request) {
        console.log(`Organization created: ${data.name}`);
        // Could send notification, create default resources, etc.
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
```

---

### Update `lib/auth-client.ts`

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";

// 👇 Import same permissions for client-side checks
import { ac, owner, admin, member } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  
  plugins: [
    adminClient(),
    organizationClient({
      // 🔑 Same AC and roles on client
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
  ],
});

// Export commonly used methods
export const { signIn, signUp, signOut, useSession } = authClient;
```

---

## ✅ Permission Checking Patterns

### Pattern 1: Server-Side Permission Check (Server Actions)

```typescript
// app/(organization)/org/[slug]/members/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function removeMember(organizationSlug: string, memberId: string) {
  // 🔑 Check permission using Better Auth API
  const permissionCheck = await auth.api.hasPermission({
    query: {
      organizationSlug,
      permissions: {
        member: ["delete"],  // Check if user can delete members
      },
    },
    headers: await headers(),
  });

  // If permission denied, return error
  if (!permissionCheck.success) {
    return {
      success: false,
      error: "You don't have permission to remove members",
    };
  }

  // Permission granted, proceed with action
  const result = await auth.api.removeMember({
    body: {
      organizationSlug,
      memberId,
    },
    headers: await headers(),
  });

  return { success: true, data: result };
}
```

**Key Points**:
- ✅ Always check permissions on server
- ✅ Use `auth.api.hasPermission()` with Better Auth
- ✅ Return structured response with success/error
- ✅ Never trust client-side permission checks alone

---

### Pattern 2: Server Component Permission Check

```typescript
// app/(organization)/org/[slug]/settings/general/edit/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function EditOrgSettingsPage({
  params,
}: {
  params: { slug: string };
}) {
  // Check permission before rendering
  const permissionCheck = await auth.api.hasPermission({
    query: {
      organizationSlug: params.slug,
      permissions: {
        organization: ["update"],
      },
    },
    headers: await headers(),
  });

  // Redirect if permission denied
  if (!permissionCheck.success) {
    redirect(`/org/${params.slug}/settings/general`);
  }

  // Render edit form
  return (
    <div>
      <h1>Edit Organization Settings</h1>
      {/* Edit form here */}
    </div>
  );
}
```

---

### Pattern 3: Client-Side Permission Check (UI Rendering)

```typescript
// components/delete-org-button.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function DeleteOrgButton({ organizationSlug }: { organizationSlug: string }) {
  // 🔑 Client-side role permission check (for UI only)
  const { data: activeMember } = authClient.organization.getActiveMember();

  // Check if user's role has permission
  const canDelete = authClient.organization.checkRolePermission({
    permissions: {
      organization: ["delete"],
    },
    role: activeMember?.role || "member",
  });

  // Don't render button if no permission
  if (!canDelete) {
    return null;
  }

  const handleDelete = async () => {
    // Server will verify permission again
    const result = await deleteOrganization(organizationSlug);
    
    if (!result.success) {
      toast.error(result.error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete Organization
    </Button>
  );
}
```

**Key Points**:
- ✅ Use for **UI rendering only** (hide/show buttons)
- ✅ Server MUST verify permissions again in action
- ✅ Never skip server-side validation
- ✅ Improves UX by hiding unavailable actions

---

### Pattern 4: Custom Hook for Permissions

Create a reusable hook for permission checks:

```typescript
// hooks/use-org-permissions.ts
"use client";

import { authClient } from "@/lib/auth-client";
import { useCallback } from "react";

export function useOrgPermissions() {
  const { data: session } = authClient.useSession();
  const { data: activeMember } = authClient.organization.getActiveMember();

  // Check if user is system admin (bypasses all org permissions)
  const isSystemAdmin = session?.user?.role === "admin";

  /**
   * Async permission check - Verifies with server
   * Use this for actions/mutations
   */
  const hasPermission = useCallback(
    async (resource: string, actions: string[]) => {
      // System admins always have permission
      if (isSystemAdmin) return true;

      // Check with Better Auth API
      const result = await authClient.organization.hasPermission({
        permissions: {
          [resource]: actions,
        },
      });

      return result.success;
    },
    [isSystemAdmin]
  );

  /**
   * Sync permission check - Client-side only
   * Use this for UI rendering (show/hide elements)
   */
  const checkPermission = useCallback(
    (resource: string, actions: string[]) => {
      // System admins always have permission
      if (isSystemAdmin) return true;

      // No active member = no permission
      if (!activeMember) return false;

      // Check role permissions
      return authClient.organization.checkRolePermission({
        permissions: {
          [resource]: actions,
        },
        role: activeMember.role,
      });
    },
    [isSystemAdmin, activeMember]
  );

  return {
    isSystemAdmin,
    hasPermission,      // Async - Use in actions
    checkPermission,    // Sync - Use in UI
    member: activeMember,
    role: activeMember?.role,
  };
}
```

**Usage Example**:

```tsx
// app/(organization)/org/[slug]/members/page.tsx
"use client";

import { useOrgPermissions } from "@/hooks/use-org-permissions";
import { Button } from "@/components/ui/button";

export function MembersPage() {
  const { checkPermission, isSystemAdmin } = useOrgPermissions();

  const canInvite = checkPermission("invitation", ["create"]);
  const canRemove = checkPermission("member", ["delete"]);

  return (
    <div>
      {isSystemAdmin && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            🛡️ Viewing as system administrator
          </p>
        </div>
      )}

      <h1>Members</h1>

      {canInvite && (
        <Button>
          Invite Member
        </Button>
      )}

      {/* Member list */}
      <div>
        {members.map((member) => (
          <div key={member.id}>
            <span>{member.user.name}</span>
            {canRemove && (
              <Button variant="destructive" size="sm">
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🛡️ System Admin Override

**Special Case**: System admins (User.role === "admin") should have full access to ANY organization, even if they're not a member.

### Implementation in Organization Layout

```typescript
// app/(organization)/org/[slug]/layout.tsx
export default async function OrganizationLayout({ params, children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: await headers(),
  });

  // 🔑 Check if user is system admin
  const isSystemAdmin = session.user.role === "admin";

  // Find user's member record
  const member = organization.members?.find(
    (m) => m.userId === session.user.id
  );

  // 🛡️ System admins get virtual "owner" role
  const effectiveMember = isSystemAdmin
    ? {
        id: "system-admin",
        userId: session.user.id,
        organizationId: organization.id,
        role: "owner", // Full permissions
        createdAt: new Date(),
        user: session.user,
      }
    : member;

  // Regular users MUST be members
  if (!isSystemAdmin && !member) {
    redirect("/unauthorized");
  }

  return (
    <PermissionsProvider
      member={effectiveMember!}
      organization={organization}
      isSystemAdmin={isSystemAdmin}
    >
      {children}
    </PermissionsProvider>
  );
}
```

**Why This Works**:
- System admin checks happen BEFORE org-level permission checks
- Virtual "owner" role gives full permissions within org context
- All Better Auth permission checks will pass for system admins
- Audit trail still tracks actual user (not "system-admin")

---

## 🧪 Testing Permission System

### Test Checklist

```typescript
// tests/permissions.test.ts

describe("Permission System", () => {
  describe("Owner Role", () => {
    it("should allow deleting organization", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { organization: ["delete"] },
        },
        headers: mockHeaders({ role: "owner" }),
      });
      expect(result.success).toBe(true);
    });

    it("should allow managing subscription", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { subscription: ["manage"] },
        },
        headers: mockHeaders({ role: "owner" }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Admin Role", () => {
    it("should NOT allow deleting organization", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { organization: ["delete"] },
        },
        headers: mockHeaders({ role: "admin" }),
      });
      expect(result.success).toBe(false);
    });

    it("should allow inviting members", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { invitation: ["create"] },
        },
        headers: mockHeaders({ role: "admin" }),
      });
      expect(result.success).toBe(true);
    });

    it("should NOT allow managing subscription", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { subscription: ["manage"] },
        },
        headers: mockHeaders({ role: "admin" }),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Member Role", () => {
    it("should NOT allow inviting members", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { invitation: ["create"] },
        },
        headers: mockHeaders({ role: "member" }),
      });
      expect(result.success).toBe(false);
    });

    it("should allow viewing visitors", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { visitor: ["view"] },
        },
        headers: mockHeaders({ role: "member" }),
      });
      expect(result.success).toBe(true);
    });

    it("should NOT allow deleting visitors", async () => {
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { visitor: ["delete"] },
        },
        headers: mockHeaders({ role: "member" }),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("System Admin Override", () => {
    it("should grant full permissions even without membership", async () => {
      // System admin not in organization
      const session = { user: { role: "admin", id: "admin_123" } };
      
      const result = await auth.api.hasPermission({
        query: {
          organizationId: "org_123",
          permissions: { organization: ["delete"] },
        },
        headers: mockHeaders(session),
      });
      
      // Should still pass because system admin
      expect(result.success).toBe(true);
    });
  });
});
```

---

## 📊 Permission Matrix

| Action | Owner | Admin | Member | System Admin |
|--------|-------|-------|--------|--------------|
| **Organization** |
| Create Org | ❌ | ❌ | ❌ | ✅ |
| Update Org Name | ✅ | ❌ | ❌ | ✅ |
| Delete Org | ✅ | ❌ | ❌ | ✅ |
| **Members** |
| Invite Member | ✅ | ✅ | ❌ | ✅ |
| Remove Member | ✅ | ✅ | ❌ | ✅ |
| Update Member Role | ✅ | ✅ | ❌ | ✅ |
| **Modules** |
| Enable Module | ❌ | ❌ | ❌ | ✅ |
| Disable Module | ❌ | ❌ | ❌ | ✅ |
| Configure Module | ✅ | ✅ | ❌ | ✅ |
| View Modules | ✅ | ✅ | ✅ | ✅ |
| **Subscription** |
| View Subscription | ✅ | ✅ | ✅ | ✅ |
| Manage Subscription | ✅ | ❌ | ❌ | ✅ |
| **Visitors** |
| View Visitors | ✅ | ✅ | ✅ | ✅ |
| Create Visitor | ✅ | ✅ | ✅ | ✅ |
| Update Visitor | ✅ | ✅ | ❌ | ✅ |
| Delete Visitor | ✅ | ✅ | ❌ | ✅ |
| Check In/Out | ✅ | ✅ | ✅ | ✅ |
| Export Visitors | ✅ | ✅ | ❌ | ✅ |
| **Tickets** |
| View Tickets | ✅ | ✅ | ✅ | ✅ |
| Create Ticket | ✅ | ✅ | ✅ | ✅ |
| Update Ticket | ✅ | ✅ | ✅ | ✅ |
| Delete Ticket | ✅ | ✅ | ❌ | ✅ |
| Assign Ticket | ✅ | ✅ | ❌ | ✅ |
| Close Ticket | ✅ | ✅ | ❌ | ✅ |
| **Inventory** |
| View Inventory | ✅ | ✅ | ✅ | ✅ |
| Create Item | ✅ | ✅ | ❌ | ✅ |
| Update Item | ✅ | ✅ | ❌ | ✅ |
| Delete Item | ✅ | ✅ | ❌ | ✅ |
| Transfer Item | ✅ | ✅ | ❌ | ✅ |
| Audit Inventory | ✅ | ✅ | ❌ | ✅ |

---

## 🔒 Security Best Practices

1. **Always Verify on Server**
   ```typescript
   // ❌ DON'T rely only on client checks
   if (clientSaysAllowed) {
     deleteOrganization();
   }
   
   // ✅ DO verify on server
   const allowed = await auth.api.hasPermission({...});
   if (allowed.success) {
     deleteOrganization();
   }
   ```

2. **Use TypeScript Strictly**
   ```typescript
   // ❌ DON'T use any
   const resource: any = "organization";
   
   // ✅ DO use proper types
   const resource: keyof typeof statement = "organization";
   ```

3. **Log Permission Denials**
   ```typescript
   if (!permissionCheck.success) {
     console.warn(`Permission denied: ${userId} tried to ${action} ${resource}`);
     // Send to monitoring service
   }
   ```

4. **Handle Permission Changes**
   ```typescript
   // When role changes, clear cached permissions
   authClient.organization.clearCache();
   ```

5. **Test Edge Cases**
   - User removed from org while logged in
   - Role changed during active session
   - Organization deleted while user browsing
   - Module disabled while user on module page

---

**Next**: [Part 4: Routing Architecture →](./04-routing.md)
