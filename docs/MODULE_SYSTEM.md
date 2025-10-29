# Module System Documentation

## Overview

The Module System provides a flexible, extensible architecture for adding feature modules to your SaaS application with organization-level isolation, custom permissions, and public access controls.

## Architecture

### Core Concepts

1. **Modules**: Reusable feature packages (e.g., TodoList, CRM, Invoicing)
2. **Organization Modules**: Module assignments to specific organizations
3. **Custom Roles & Permissions**: Fine-grained access control per module per organization
4. **Public Access**: Optional public-facing views for modules
5. **Organization Isolation**: Complete data separation between organizations

### Database Schema

```
Module
├── OrganizationModule (assigns module to organization)
│   ├── CustomRole (organization-specific roles for the module)
│   │   └── RolePermission (maps permissions to roles)
│   └── MemberModuleRole (assigns roles to members)
└── ModulePermission (available permissions for the module)
```

## Getting Started

### 1. Creating a New Module

#### Seed the Module in Database

Create a script in `scripts/seed-your-module.ts`:

```typescript
import { prisma } from "../lib/prisma";

async function seedYourModule() {
  const module = await prisma.module.upsert({
    where: { slug: "your-module" },
    update: {
      name: "Your Module",
      description: "Description of your module",
      icon: "IconName", // Lucide icon name
      isActive: true,
    },
    create: {
      slug: "your-module",
      name: "Your Module",
      description: "Description of your module",
      icon: "IconName",
      isActive: true,
    },
  });

  // Define permissions
  const permissions = [
    { resource: "item", action: "view", description: "View items" },
    { resource: "item", action: "create", description: "Create items" },
    { resource: "item", action: "update", description: "Update items" },
    { resource: "item", action: "delete", description: "Delete items" },
  ];

  for (const perm of permissions) {
    await prisma.modulePermission.upsert({
      where: {
        moduleId_resource_action: {
          moduleId: module.id,
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: { description: perm.description },
      create: {
        moduleId: module.id,
        ...perm,
      },
    });
  }
}

seedYourModule();
```

Run: `tsx scripts/seed-your-module.ts`

#### Create Module Structure

```
app/(organization)/org/[slug]/your-module/
├── page.tsx                    # Server component with permission checks
├── your-module-page-client.tsx # Client component with UI
lib/actions/
├── your-module.ts              # Server actions for module operations
components/modules/your-module/
├── your-component.tsx          # Reusable components
```

### 2. Implementing Module Actions

Create `lib/actions/your-module.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { checkMemberPermission } from "@/lib/actions/permissions";

const MODULE_SLUG = "your-module";

async function getMember(organizationId: string) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!member) {
    return { error: "Not a member of this organization" };
  }

  return { member, userId: session.user.id };
}

export async function createItem(data: {
  organizationId: string;
  title: string;
}) {
  const memberResult = await getMember(data.organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member, userId } = memberResult;

  // Check permission
  const hasPermission = await checkMemberPermission(
    member.id,
    data.organizationId,
    MODULE_SLUG,
    "item",
    "create"
  );

  if (!hasPermission) {
    return { error: "You don't have permission to perform this action" };
  }

  // Create item with organization isolation
  const [item, error] = await tryCatch(
    prisma.yourItem.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        createdBy: userId,
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: item };
}
```

### 3. Creating the Module Page

Create `app/(organization)/org/[slug]/your-module/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkMemberPermission } from "@/lib/actions/permissions";
import YourModulePageClient from "./your-module-page-client";

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
  });

  if (!organization) {
    redirect("/no-organization");
  }

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: organization.id,
    },
  });

  if (!member) {
    redirect("/unauthorized");
  }

  // Check if module is assigned
  const orgModule = await prisma.organizationModule.findFirst({
    where: {
      organizationId: organization.id,
      module: { slug: "your-module" },
      isEnabled: true,
    },
  });

  if (!orgModule) {
    return <div>Module Not Available</div>;
  }

  // Check permissions
  const canView = await checkMemberPermission(
    member.id,
    organization.id,
    "your-module",
    "item",
    "view"
  );

  const canCreate = await checkMemberPermission(
    member.id,
    organization.id,
    "your-module",
    "item",
    "create"
  );

  return (
    <YourModulePageClient
      organizationId={organization.id}
      permissions={{ canView, canCreate }}
    />
  );
}
```

### 4. Adding Public Access (Optional)

Create `app/public/[orgSlug]/your-module/page.tsx`:

```typescript
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PublicModulePage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const orgModule = await prisma.organizationModule.findFirst({
    where: {
      isPublic: true,
      isEnabled: true,
      organization: { slug: params.orgSlug },
      module: { slug: "your-module" },
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, logo: true },
      },
    },
  });

  if (!orgModule) {
    notFound();
  }

  // Fetch and display public data
  const items = await prisma.yourItem.findMany({
    where: {
      organizationId: orgModule.organization.id,
      // Add any public filters
    },
  });

  return <div>{/* Render public view */}</div>;
}
```

## Admin Operations

### Assigning Modules to Organizations

1. Navigate to `/admin/modules`
2. Click "Assign to Organization" on a module card
3. Select organization and configure:
   - **Public Access**: Enable public viewing
   - **Settings**: Module-specific configuration (JSON)
4. Click "Assign Module"

### Managing Custom Permissions

Organization admins can create custom roles with specific permissions:

```typescript
import { createCustomRole } from "@/lib/actions/permissions";

// Create a role with specific permissions
await createCustomRole({
  organizationId: "org-id",
  moduleId: "module-id",
  name: "Editor",
  description: "Can create and update items",
  permissions: [
    { modulePermissionId: "perm-view-id", granted: true },
    { modulePermissionId: "perm-create-id", granted: true },
    { modulePermissionId: "perm-update-id", granted: true },
    { modulePermissionId: "perm-delete-id", granted: false },
  ],
});
```

### Assigning Roles to Members

```typescript
import { assignRoleToMember } from "@/lib/actions/permissions";

await assignRoleToMember({
  organizationId: "org-id",
  memberId: "member-id",
  roleId: "custom-role-id",
});
```

## Permission System

### How Permissions Work

1. **Org-level Roles**: Owner and Admin have full access to all module operations
2. **Custom Module Roles**: Fine-grained permissions per module
3. **Permission Checking**: Automatic validation in server actions

```typescript
// Org admins bypass permission checks
if (member.role === "owner" || member.role === "admin") {
  // Allowed
}

// Check custom module permissions
const hasPermission = await checkMemberPermission(
  memberId,
  organizationId,
  moduleSlug,
  resource,
  action
);
```

### Permission Resources and Actions

Define what users can do with each resource:

```typescript
// Example: TodoList module
{
  resource: "todolist",
  actions: ["view", "create", "update", "delete"]
},
{
  resource: "todoitem",
  actions: ["create", "update", "delete"]
}
```

## Organization Isolation

All module data MUST be scoped to organizations:

```typescript
// ✅ CORRECT: Filtered by organizationId
const items = await prisma.yourItem.findMany({
  where: {
    organizationId: userOrganizationId,
  },
});

// ❌ WRONG: No organization filter (data leak!)
const items = await prisma.yourItem.findMany();
```

## Public Routes

Public routes are accessible without authentication at:
```
/public/{organizationSlug}/{moduleSlug}
```

Requirements:
1. Module must be assigned to organization
2. `isPublic` flag must be `true`
3. `proxy.ts` includes `/public` in `PUBLIC_PREFIXES`

## Testing Your Module

### 1. Seed the Module
```bash
tsx scripts/seed-your-module.ts
```

### 2. Assign to Organization
1. Login as system admin
2. Go to `/admin/modules`
3. Assign module to test organization

### 3. Create Custom Roles (Optional)
Organization admin creates roles with specific permissions

### 4. Test Permissions
- Test as org owner (full access)
- Test as org admin (full access)
- Test as member with custom role (limited access)
- Test as non-member (no access)

### 5. Test Public Access
Visit `/public/{org-slug}/{module-slug}` without authentication

## Best Practices

1. **Always Check Permissions**: Use `checkMemberPermission` in all server actions
2. **Organization Isolation**: Always filter by `organizationId`
3. **Consistent Naming**: Follow `module-slug`, `resource`, `action` patterns
4. **Error Handling**: Return `{ error: string }` for failures, `{ data: T }` for success
5. **Public Data**: Only expose necessary data in public routes
6. **Admin Checks**: Org admins should have full module access by default

## Example: TodoList Module

See the complete implementation:
- Database: `prisma/schema.prisma` (TodoList, TodoItem tables)
- Actions: `lib/actions/todolist.ts`
- Permissions: `lib/actions/permissions.ts`
- UI: `app/(organization)/org/[slug]/todolist/`
- Public: `app/public/[orgSlug]/todolist/page.tsx`
- Seed: `scripts/seed-todolist-module.ts`

## Troubleshooting

### Module Not Showing in Sidebar
- Check module is assigned to organization
- Verify `isEnabled: true` in OrganizationModule
- Ensure module has `isActive: true`

### Permission Denied Errors
- Verify member has appropriate role
- Check custom role has required permissions
- Org owners/admins should always have access

### Data Visible to Wrong Organization
- Always filter queries by `organizationId`
- Verify organization ID in server actions
- Never trust client-provided organization IDs without validation

## API Reference

### Module Management
- `createModule(data)` - Create new module (admin only)
- `assignModuleToOrganization(data)` - Assign module to org
- `removeModuleFromOrganization(data)` - Remove module from org
- `getOrganizationModules(organizationId)` - List org's modules
- `toggleModulePublicAccess(data)` - Enable/disable public access

### Permission Management
- `createCustomRole(data)` - Create custom role
- `updateCustomRole(data)` - Update role permissions
- `deleteCustomRole(data)` - Delete custom role
- `assignRoleToMember(data)` - Assign role to member
- `removeRoleFromMember(data)` - Remove role from member
- `checkMemberPermission(...)` - Check if member has permission

## Next Steps

1. Create your first module following this guide
2. Define appropriate permissions for your use case
3. Build public views if needed
4. Test with different permission levels
5. Document your module's specific features

For questions or issues, refer to the TodoList module implementation as a reference.
