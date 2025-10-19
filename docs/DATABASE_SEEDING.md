# Database Seeding

This document explains how to seed your database with initial test data.

## Seed Script

The seed script (`prisma/seed.ts`) creates test accounts for local development:

### Test Accounts Created

| Role  | Email              | Password   | Purpose                          |
|-------|-------------------|------------|----------------------------------|
| Admin | admin@email.com   | 11111111   | Full admin access, can create orgs |
| User  | user@email.com    | 11111111   | Regular user account             |

## Running the Seed Script

### First Time Setup

```bash
# After migrations, seed the database
pnpm db:migrate
pnpm db:seed
```

### Reset and Reseed

If you need to reset the database and reseed:

```bash
# Full reset (deletes all data and reseeds)
pnpm db:reset
```

The `db:reset` command will:
1. Drop all tables
2. Run all migrations
3. Automatically run the seed script

### Manual Seeding

```bash
# Just run the seed (won't duplicate if users exist)
pnpm db:seed
```

The seed script is idempotent - it checks if users already exist before creating them.

## Customizing Seed Data

To add more seed data, edit `prisma/seed.ts`:

```typescript
// Example: Add an organization
const org = await prisma.organization.create({
  data: {
    id: crypto.randomUUID(),
    name: "Acme Inc",
    slug: "acme-inc",
    createdAt: new Date(),
  },
});
```

## How It Works

The seed script uses Better Auth's native API to create users:

```typescript
await auth.api.signUpEmail({
  body: {
    email: "admin@email.com",
    password: "11111111",
    name: "Admin User",
  },
});
```

### Benefits of This Approach:
- ✅ **Automatic password hashing** - Better Auth handles it using scrypt
- ✅ **Always compatible** - Uses the same hashing as login
- ✅ **No manual crypto** - Cleaner, more maintainable code
- ✅ **Future-proof** - Updates with Better Auth automatically

### Password Requirements

Passwords must meet Better Auth's requirements:
- Minimum 8 characters
- Any combination of characters is allowed

**Development Note:** The test passwords (`11111111`) are intentionally simple for local development convenience.

## Production Warning

⚠️ **Never use these test accounts in production!**

For production:
1. Use strong, randomly generated passwords
2. Use environment variables for credentials
3. Consider using a separate seeding strategy
4. Remove or disable the seed script in production builds

## Creating Additional Admin Users

The seed script creates one admin user for initial setup. To promote existing users to admin role:

```bash
# Promote an existing user to admin
pnpm admin:make user@email.com
```

See **[Admin User Management](./ADMIN_USER_MANAGEMENT.md)** for complete documentation on creating and managing admin users.

## Troubleshooting

### "User already exists" error

This is normal! The seed script skips users that already exist. If you want to recreate users:

```bash
pnpm db:reset  # Resets everything and reseeds
```

### Password doesn't work

Make sure you're using the correct credentials:
- Admin: `admin@email.com` / `11111111`
- User: `user@email.com` / `11111111`

If still having issues, reset the database:

```bash
pnpm db:reset
```
