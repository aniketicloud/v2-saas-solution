# Scripts Directory

This directory contains utility scripts for managing the application.

## Available Scripts

### 📝 make-admin.ts

**Purpose**: Promote existing users to admin role

**Usage**:
```bash
pnpm admin:make <email>
```

**Example**:
```bash
pnpm admin:make john@company.com
```

**Documentation**: See [Admin User Management](../docs/ADMIN_USER_MANAGEMENT.md)

**Requirements**:
- User must already exist in database
- Requires database access
- Must have valid email address

**What it does**:
1. Validates email format
2. Checks if user exists
3. Checks if user is already admin
4. Updates user role to "admin"
5. Displays success message with user details

---

### 🌱 seed-todolist-module.ts

**Purpose**: Create the TodoList module in the database

**Usage**:
```bash
npx tsx scripts/seed-todolist-module.ts
```

**What it does**:
1. Creates TodoList module
2. Sets up module metadata
3. Prepares module for organization assignment

---

### 🔐 seed-todolist-permissions.ts

**Purpose**: Populate TodoList module permissions

**Usage**:
```bash
npx tsx scripts/seed-todolist-permissions.ts
```

**Documentation**: See [Permission System](../docs/PERMISSIONS_SYSTEM.md)

**Requirements**:
- TodoList module must exist (run `seed-todolist-module.ts` first)

**What it does**:
1. Creates 10 module permissions:
   - `todolist`: view, create, update, delete, manage
   - `todoitem`: view, create, update, delete, complete
2. Updates descriptions if permissions already exist
3. Displays summary of created/updated permissions

---

### 🔄 backfill-predefined-roles.ts

**Purpose**: Create predefined roles for existing organization modules

**Usage**:
```bash
npx tsx scripts/backfill-predefined-roles.ts
```

**When to use**:
- After upgrading to the new permission system
- When organization modules exist but don't have predefined roles
- To ensure all modules have Admin, Editor, Viewer roles

**What it does**:
1. Finds all organization modules
2. Checks if they have predefined roles (Admin, Editor, Viewer)
3. Creates missing roles with appropriate permissions
4. Displays summary of created roles

**Note**: New module assignments automatically create these roles.

---

### 🧪 test-permissions.ts

**Purpose**: Test and verify the permission system is working

**Usage**:
```bash
npx tsx scripts/test-permissions.ts
```

**What it does**:
1. Finds an organization with TodoList module
2. Lists all custom roles and their permissions
3. Tests permission checks for a member
4. Displays effective permissions
5. Verifies hierarchical permission system

**Use this to**:
- Verify permission system setup
- Debug permission issues
- See which permissions are granted to members

---

## Adding New Scripts

When creating new scripts:

1. **Use TypeScript**: All scripts should be `.ts` files
2. **Add shebang**: Include `#!/usr/bin/env tsx` at the top
3. **Add npm script**: Add to `package.json` scripts section
4. **Document here**: Add entry to this README
5. **Error handling**: Use try-catch and meaningful error messages
6. **Help text**: Show usage when run without arguments

### Template

```typescript
#!/usr/bin/env tsx

/**
 * Script Name
 * 
 * Description of what the script does
 * 
 * Usage:
 *   pnpm script:name <args>
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Your script logic here
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Running Scripts

### With pnpm (Recommended)
```bash
pnpm admin:make user@email.com
```

### With npx
```bash
npx tsx scripts/make-admin.ts user@email.com
```

### Directly with tsx
```bash
tsx scripts/make-admin.ts user@email.com
```

---

## Future Script Ideas

- `scripts/remove-admin.ts` - Demote admin users back to regular users
- `scripts/list-admins.ts` - List all current admin users
- `scripts/bulk-import-users.ts` - Import users from CSV
- `scripts/cleanup-orphaned-data.ts` - Database cleanup utilities
- `scripts/generate-api-keys.ts` - Generate API keys for integrations
