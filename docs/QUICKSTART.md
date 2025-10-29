# Quick Start: Module System with TodoList

## What Was Implemented

A comprehensive module system that allows you to:
- Create reusable feature modules (starting with TodoList)
- Assign modules to specific organizations
- Define custom roles and permissions per module per organization
- Enable public access to modules (optional)
- Maintain complete data isolation between organizations

## Quick Start

### 1. Seed the TodoList Module

```bash
tsx scripts/seed-todolist-module.ts
```

This creates the TodoList module with 7 default permissions:
- todolist: view, create, update, delete
- todoitem: create, update, delete

### 2. Assign TodoList to an Organization

**As System Admin:**

1. Login with an admin account (user with `role: "admin"`)
2. Navigate to `/admin/modules`
3. Find the "TodoList" module card
4. Click "Assign to Organization"
5. Select an organization
6. (Optional) Enable "Make module public" for public access
7. Click "Assign Module"

### 3. Access TodoList

**As Organization Member:**

1. Login and navigate to your organization
2. You'll see "TodoList" in the sidebar under "Modules"
3. Click to access the TodoList interface

**Permissions:**
- Organization owners/admins have full access
- Other members need custom roles assigned

### 4. Create Custom Roles (Optional)

Organization admins can create roles with specific permissions:

```typescript
// Example: Create a "Viewer" role that can only view todo lists
import { createCustomRole } from "@/lib/actions/permissions";

const result = await createCustomRole({
  organizationId: "your-org-id",
  moduleId: "todolist-module-id",
  name: "Viewer",
  description: "Can only view todo lists",
  permissions: [
    {
      modulePermissionId: "view-permission-id",
      granted: true
    },
    // Other permissions set to false
  ],
});
```

### 5. Enable Public Access

**As Organization Admin:**

1. Go to `/admin/modules`
2. Find your organization's TodoList assignment
3. Click the eye icon to toggle public access
4. Public URL: `/public/{your-org-slug}/todolist`

## File Structure Created

```
prisma/
├── schema.prisma                    # Module tables added
└── migrations/
    └── XXXXXX_add_module_system/    # Migration

scripts/
└── seed-todolist-module.ts          # Seed script

lib/actions/
├── modules.ts                       # Module management
├── permissions.ts                   # Custom permissions
└── todolist.ts                      # TodoList operations

app/
├── (admin)/admin/modules/           # Admin module management
│   ├── page.tsx
│   └── modules-page-client.tsx
├── (organization)/org/[slug]/
│   ├── layout.tsx                   # Updated with modules
│   ├── todolist/                    # TodoList module
│   │   ├── page.tsx
│   │   └── todolist-page-client.tsx
│   └── _components/
│       └── org-sidebar.tsx          # Updated with modules
└── public/[orgSlug]/todolist/       # Public todolist view
    └── page.tsx

components/
├── modules/todolist/                # TodoList components
│   ├── todo-list-card.tsx
│   ├── create-todolist-dialog.tsx
│   └── create-todoitem-dialog.tsx
└── org-nav-client.tsx               # Dynamic navigation

docs/
├── MODULE_SYSTEM.md                 # Full documentation
└── QUICKSTART.md                    # This file
```

## Testing the Implementation

### Test 1: System Admin Flow

```bash
# 1. Ensure you have an admin user
tsx scripts/make-admin.ts

# 2. Seed TodoList module
tsx scripts/seed-todolist-module.ts

# 3. Login as admin
# Navigate to /admin/modules

# 4. Assign TodoList to an organization
# 5. Toggle public access on/off
```

### Test 2: Organization Admin Flow

```bash
# 1. Login as organization owner/admin
# 2. See TodoList in sidebar
# 3. Create todo lists and items
# 4. All operations should work
```

### Test 3: Organization Member Flow

```bash
# 1. Login as regular member
# 2. See TodoList in sidebar
# 3. If no custom role: Limited or no access
# 4. Create custom role and assign to member
# 5. Member now has role-specific access
```

### Test 4: Public Access

```bash
# 1. Enable public access for TodoList in an org
# 2. Visit /public/{org-slug}/todolist (without login)
# 3. Should see public todo lists (read-only)
```

### Test 5: Organization Isolation

```bash
# 1. Create todo lists in Org A
# 2. Switch to Org B
# 3. Should NOT see Org A's todo lists
# 4. Data completely isolated
```

## Common Tasks

### Make a User Admin

```bash
tsx scripts/make-admin.ts
# Enter user email when prompted
```

### Create a Custom Permission Role

```typescript
// In a server action or API route
import { createCustomRole, assignRoleToMember } from "@/lib/actions/permissions";

// 1. Get module and organization IDs from database
const orgModule = await prisma.organizationModule.findFirst({
  where: {
    organizationId: "org-id",
    module: { slug: "todolist" }
  },
  include: {
    module: {
      include: { modulePermissions: true }
    }
  }
});

// 2. Create role
const role = await createCustomRole({
  organizationId: "org-id",
  moduleId: orgModule.moduleId,
  name: "Editor",
  description: "Can create and edit, but not delete",
  permissions: orgModule.module.modulePermissions.map(perm => ({
    modulePermissionId: perm.id,
    granted: perm.action !== "delete" // Grant all except delete
  }))
});

// 3. Assign to member
await assignRoleToMember({
  organizationId: "org-id",
  memberId: "member-id",
  roleId: role.data.id
});
```

### Remove a Module from Organization

```bash
# As admin at /admin/modules
# Click trash icon next to module assignment
```

## Key Features

### ✅ Module System
- Reusable feature modules
- Easy to add new modules
- Module marketplace ready

### ✅ Organization Isolation
- Complete data separation
- Each org has own module data
- No cross-org data leaks

### ✅ Custom Permissions
- Per-module, per-organization roles
- Fine-grained access control
- Org admins manage permissions

### ✅ Public Access
- Optional public views
- Configurable per organization
- No authentication required

### ✅ Dynamic Navigation
- Modules appear in sidebar automatically
- Public badge for public modules
- Icon support

## Next Steps

1. **Test the Implementation**: Follow test scenarios above
2. **Create More Modules**: Use TodoList as template
3. **Build UI for Role Management**: Add org admin UI for creating/assigning roles
4. **Add Module Settings**: Extend OrganizationModule.settings for module-specific config
5. **Module Marketplace**: Build discovery and installation flow

## Troubleshooting

### Module Not Showing
- Check module is seeded: Query `Module` table
- Verify assignment: Query `OrganizationModule` table
- Check `isEnabled` and `isActive` flags

### Permission Denied
- Org owners/admins should have full access
- Check member has custom role assigned
- Verify role has required permissions granted

### Public Access Not Working
- Check `isPublic` flag in OrganizationModule
- Verify `/public` in proxy.ts PUBLIC_PREFIXES
- Confirm module is assigned and enabled

## Documentation

For comprehensive documentation, see:
- **Full Guide**: `docs/MODULE_SYSTEM.md`
- **BetterAuth Admin**: `.vscode/admin.mdx`
- **BetterAuth Org**: `.vscode/organization.mdx`
- **Prisma Schema**: `prisma/schema.prisma`

## Support

For issues or questions:
1. Check `docs/MODULE_SYSTEM.md` for detailed documentation
2. Review TodoList implementation as reference
3. Examine test scenarios above

---

**Congratulations!** You now have a fully functional module system with organization isolation, custom permissions, and public access support. 🎉
