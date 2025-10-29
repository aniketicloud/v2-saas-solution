# Permission System

A flexible, hierarchical role-based access control (RBAC) system for managing permissions across modules and organizations.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Permission Hierarchy](#permission-hierarchy)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Examples](#examples)

## 🎯 Overview

The permission system allows fine-grained control over what users can do within each module of an organization. It supports:

- **Hierarchical Permissions**: Global Admin > Org Owner > Org Admin > Custom Roles > Member
- **Module-Specific Permissions**: Different permissions for each module
- **Predefined Roles**: Admin, Editor, Viewer roles created automatically
- **Custom Roles**: Create organization-specific roles with custom permissions
- **Flexible Permission Checks**: Check permissions programmatically

## 🏗️ Architecture

### Database Schema

```
Organization
    └── OrganizationModule (Module assigned to org)
            ├── CustomRole (e.g., "Project Manager")
            │       └── RolePermission (links to ModulePermission)
            └── Module
                    └── ModulePermission (e.g., "todolist.create")

Member (User in Org)
    └── MemberModuleRole (assigned custom roles)
```

### File Structure

```
lib/permissions/
├── index.ts           # Main exports
├── types.ts           # TypeScript types and constants
├── checker.ts         # Permission checking functions
└── roles.ts           # Role management functions

scripts/
└── seed-todolist-permissions.ts  # Seed script for TodoList permissions
```

## 🔐 Permission Hierarchy

Permissions are checked in this order (first match wins):

1. **Global Admin** (`User.role === "admin"`)
   - Full access to everything
   - Can manage all organizations and modules

2. **Organization Owner** (`Member.role === "owner"`)
   - Full access within their organization
   - Can manage all modules assigned to the org

3. **Organization Admin** (`Member.role === "admin"`)
   - Can manage members and modules
   - Full access to assigned modules

4. **Custom Roles** (`MemberModuleRole`)
   - Granular permissions per module
   - Assigned by org admins

5. **Default Member** (`Member.role === "member"`)
   - No default permissions
   - Must be assigned a custom role

## 🚀 Usage

### 1. Seed Module Permissions

First, create permissions for your module:

\`\`\`bash
npx tsx scripts/seed-todolist-permissions.ts
\`\`\`

This creates 10 permissions for the TodoList module:
- `todolist.view`, `todolist.create`, `todolist.update`, `todolist.delete`, `todolist.manage`
- `todoitem.view`, `todoitem.create`, `todoitem.update`, `todoitem.delete`, `todoitem.complete`

### 2. Assign Module to Organization

When a module is assigned to an organization, 3 predefined roles are automatically created:

- **Admin**: Full access to all module features
- **Editor**: Can create and edit (no delete/manage)
- **Viewer**: Read-only access

\`\`\`typescript
import { assignModuleToOrganization } from "@/lib/actions/modules";

await assignModuleToOrganization({
  organizationId: "org_123",
  moduleId: "module_todolist",
});
// Admin, Editor, Viewer roles created automatically
\`\`\`

### 3. Assign Roles to Members

\`\`\`typescript
import { assignRoleToMember } from "@/lib/permissions";

await assignRoleToMember({
  memberId: "member_123",
  customRoleId: "role_editor_id",
  assignedBy: "admin_user_id",
});
\`\`\`

### 4. Check Permissions in Your Code

#### Server-Side (Recommended)

\`\`\`typescript
import { checkPermission, checkPermissions } from "@/lib/permissions";

// Single permission check
const result = await checkPermission({
  memberId: "member_123",
  organizationId: "org_123",
  moduleSlug: "todolist",
  resource: "todolist",
  action: "delete",
});

if (result.allowed) {
  // User can delete todo lists
  console.log(\`Allowed by: \${result.source}\`); // "org_admin" or "custom_role"
}

// Multiple permissions at once
const permissions = await checkPermissions({
  memberId: "member_123",
  organizationId: "org_123",
  moduleSlug: "todolist",
  permissions: [
    { resource: "todolist", action: "view" },
    { resource: "todolist", action: "create" },
    { resource: "todolist", action: "delete" },
  ],
});

// Returns: { "todolist.view": true, "todolist.create": true, "todolist.delete": false }
\`\`\`

#### In Page Components

\`\`\`typescript
import { checkPermissions, TodoListPermissions } from "@/lib/permissions";

export default async function TodoListPage({ params }) {
  // ... get member and organization ...

  const permissions = await checkPermissions({
    memberId: member.id,
    organizationId: organization.id,
    moduleSlug: "todolist",
    permissions: [
      TodoListPermissions.TODOLIST_VIEW,
      TodoListPermissions.TODOLIST_CREATE,
      TodoListPermissions.TODOLIST_DELETE,
    ],
  });

  return (
    <TodoListClient
      canCreate={permissions["todolist.create"]}
      canDelete={permissions["todolist.delete"]}
    />
  );
}
\`\`\`

#### Server Actions

\`\`\`typescript
"use server";

import { checkPermission } from "@/lib/permissions";

export async function deleteTodoList(todoListId: string) {
  // Get current member...
  
  const result = await checkPermission({
    memberId: member.id,
    organizationId: organization.id,
    moduleSlug: "todolist",
    resource: "todolist",
    action: "delete",
  });

  if (!result.allowed) {
    throw new Error("Insufficient permissions to delete todo lists");
  }

  // Proceed with deletion...
}
\`\`\`

## 📚 API Reference

### Permission Checker Functions

#### `checkPermission(input)`

Check if a member has a specific permission.

**Parameters:**
- `memberId` (string): Member ID
- `organizationId` (string): Organization ID
- `moduleSlug` (string): Module slug (e.g., "todolist")
- `resource` (string): Resource name (e.g., "todolist", "todoitem")
- `action` (string): Action name (e.g., "view", "create", "delete")

**Returns:** `Promise<PermissionCheckResult>`
```typescript
{
  allowed: boolean;
  reason?: string;
  source?: "global_admin" | "org_owner" | "org_admin" | "custom_role" | "default";
}
```

#### `checkPermissions(input)`

Check multiple permissions at once.

**Parameters:**
- `memberId` (string)
- `organizationId` (string)
- `moduleSlug` (string)
- `permissions` (Array<{ resource: string; action: string }>)

**Returns:** `Promise<Record<string, boolean>>`

Example: `{ "todolist.view": true, "todolist.create": false }`

#### `getMemberPermissions(input)`

Get all permissions for a member in a module.

**Returns:** 
```typescript
{
  isGlobalAdmin: boolean;
  isOrgOwner: boolean;
  isOrgAdmin: boolean;
  customRoles: Array<{
    roleId: string;
    roleName: string;
    permissions: Array<{ resource: string; action: string }>;
  }>;
  effectivePermissions: Array<{ resource: string; action: string }>;
}
```

### Role Management Functions

#### `createPredefinedRoles(input)`

Create Admin, Editor, Viewer roles for a module.

#### `assignRoleToMember(input)`

Assign a custom role to a member.

#### `removeRoleFromMember(input)`

Remove a role from a member.

#### `getCustomRoles(organizationModuleId)`

Get all custom roles for an organization module.

#### `createCustomRole(input)`

Create a new custom role with specific permissions.

#### `updateRolePermissions(input)`

Update permissions for an existing role.

#### `deleteCustomRole(customRoleId)`

Delete a custom role (only if no members assigned).

## 🧪 Testing

### Test Permission Checks

\`\`\`typescript
// Test as different user types
const globalAdminResult = await checkPermission({
  memberId: "admin_member_id",
  organizationId: "org_123",
  moduleSlug: "todolist",
  resource: "todolist",
  action: "delete",
});
// Should be: { allowed: true, source: "global_admin" }

const viewerResult = await checkPermission({
  memberId: "viewer_member_id",
  organizationId: "org_123",
  moduleSlug: "todolist",
  resource: "todolist",
  action: "delete",
});
// Should be: { allowed: false, reason: "No permission found" }
\`\`\`

## 📖 Examples

### TodoList Module Permissions

```typescript
// All TodoList permissions defined in types.ts
export const TodoListPermissions = {
  TODOLIST_VIEW: { resource: "todolist", action: "view" },
  TODOLIST_CREATE: { resource: "todolist", action: "create" },
  TODOLIST_UPDATE: { resource: "todolist", action: "update" },
  TODOLIST_DELETE: { resource: "todolist", action: "delete" },
  TODOLIST_MANAGE: { resource: "todolist", action: "manage" },
  
  TODOITEM_VIEW: { resource: "todoitem", action: "view" },
  TODOITEM_CREATE: { resource: "todoitem", action: "create" },
  TODOITEM_UPDATE: { resource: "todoitem", action: "update" },
  TODOITEM_DELETE: { resource: "todoitem", action: "delete" },
  TODOITEM_COMPLETE: { resource: "todoitem", action: "complete" },
};
```

### Predefined Role Permissions

**Admin Role:**
- All 10 permissions (full access)

**Editor Role:**
- todolist: view, create, update
- todoitem: view, create, update, complete

**Viewer Role:**
- todolist: view
- todoitem: view

## 🔮 Future Enhancements

1. **Permission Audit Log**: Track who checked/used permissions
2. **Conditional Permissions**: Time-based, resource-based conditions
3. **Permission Templates**: Pre-built role templates for common use cases
4. **UI for Role Management**: Admin UI to create/edit roles visually
5. **Bulk Permission Operations**: Assign/revoke permissions in bulk
6. **Permission Inheritance**: Roles that inherit from parent roles

## 📝 Notes

- Global admins always have full access (performance optimization)
- Org owners/admins always have full access to their org's modules
- Custom roles are module-specific and organization-specific
- Permissions are checked on every request (consider caching for high-traffic apps)
- The system is designed to be secure by default (no permission = denied)

## 🤝 Contributing

When adding a new module:

1. Create permissions in `ModulePermission` table
2. Add permission constants to `types.ts`
3. Create seed script (follow `seed-todolist-permissions.ts` pattern)
4. Update `RoleTemplates` in `types.ts` if needed
5. Use `checkPermission()` in your pages and actions

---

**Created:** October 29, 2025  
**Last Updated:** October 29, 2025
