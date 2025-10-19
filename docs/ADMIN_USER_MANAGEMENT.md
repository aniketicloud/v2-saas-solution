# Admin User Management Guide

This guide covers all methods for creating and managing admin users in the v2-saas-solution platform.

## 🔒 Security Overview

**Important**: Admin users have full access to all organizations and system settings. Only trusted personnel should be granted admin access.

**Role Assignment Rules**:
- ✅ Admin role can **ONLY** be assigned through:
  1. Database seeding (`pnpm db:seed`)
  2. Admin script (`pnpm admin:make`)
  3. Manual database update
- ❌ Admin role **CANNOT** be set through:
  - Public signup form
  - User profile updates
  - API endpoints
  - Client-side modifications

---

## 📋 Methods to Create Admin Users

### Method 1: Database Seed (Initial Setup)

**Best for**: First-time setup and development environments

**Command**:
```bash
pnpm db:seed
```

**What it does**:
- Creates initial admin user: `admin@email.com` / `11111111`
- Creates test regular user: `user@email.com` / `11111111`
- Safe to run multiple times (idempotent)

**Output**:
```
🌱 Starting database seed...
✓ Created admin user:
  Email: admin@email.com
  Password: 11111111
  Role: admin
✓ Created test user:
  Email: user@email.com
  Password: 11111111
  Role: user

🎉 Seeding completed successfully!

📝 Test Accounts:
   Admin: admin@email.com / 11111111
   User:  user@email.com / 11111111
```

**When to use**:
- ✅ Initial project setup
- ✅ After database reset
- ✅ Setting up development environment
- ✅ Creating consistent test data

---

### Method 2: Admin Script (Production-Ready) ⭐

**Best for**: Promoting existing users to admin role in any environment

**Command**:
```bash
pnpm admin:make <email>
```

**Examples**:
```bash
# Promote an existing user to admin
pnpm admin:make john@company.com

# Alternative syntax
npx tsx scripts/make-admin.ts john@company.com
```

**Requirements**:
- ✅ User must already exist (signed up via `/signup`)
- ✅ User must have valid email address
- ✅ You must have database access (server/terminal access)

**Workflow**:

1. **User signs up** normally via `/signup`:
   - Email: `john@company.com`
   - Password: `securepassword123`
   - Role: `null` (regular user)

2. **Run admin script**:
   ```bash
   pnpm admin:make john@company.com
   ```

3. **Output**:
   ```
   🔍 Looking for user: john@company.com...
   
   ✅ Success! User "john@company.com" is now an admin.
   
   Updated User Details:
     Name: John Doe
     Email: john@company.com
     Role: admin
   
   🎉 The user can now access admin routes at /admin/dashboard
   ```

4. **User can now**:
   - Sign in normally with their password
   - Access `/admin/dashboard`
   - Create and manage organizations
   - Access all admin features

**Error Handling**:

**User not found**:
```bash
$ pnpm admin:make nonexistent@email.com

🔍 Looking for user: nonexistent@email.com...

❌ Error: User with email "nonexistent@email.com" not found.

💡 Tip: Make sure the user has signed up first, then run this script.
```

**Already an admin**:
```bash
$ pnpm admin:make admin@email.com

🔍 Looking for user: admin@email.com...

✓ User "admin@email.com" is already an admin.

User Details:
  Name: Admin User
  Email: admin@email.com
  Role: admin
```

**Invalid email**:
```bash
$ pnpm admin:make invalid-email

❌ Error: "invalid-email" is not a valid email address.
```

**No email provided**:
```bash
$ pnpm admin:make

❌ Error: Email address is required.

Usage:
  pnpm admin:make <email>
  npx tsx scripts/make-admin.ts <email>

Example:
  pnpm admin:make admin@company.com
```

**When to use**:
- ✅ **Recommended for production**
- ✅ Promoting existing users to admin
- ✅ Adding new admin users (after they sign up)
- ✅ Auditable process (can be logged)
- ✅ Safe and validated

---

### Method 3: Prisma Studio (Visual Interface)

**Best for**: Quick manual updates during development

**Command**:
```bash
pnpm db:studio
```

**Steps**:
1. Opens Prisma Studio in browser (usually `http://localhost:5555`)
2. Navigate to `user` table
3. Find the user you want to promote
4. Click on the user row to edit
5. Set `role` field to `"admin"`
6. Click "Save 1 change"

**When to use**:
- ✅ Development environment
- ✅ Quick visual inspection
- ✅ One-off manual changes
- ❌ **Not recommended for production** (direct database access)

---

### Method 4: SQL Query (Direct Database)

**Best for**: Scripted deployments or bulk operations

**PostgreSQL Example**:
```sql
-- Promote single user
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'newadmin@company.com';

-- Verify the change
SELECT id, name, email, role 
FROM "user" 
WHERE email = 'newadmin@company.com';
```

**Using psql**:
```bash
# Connect to database
psql $DATABASE_URL

# Run query
UPDATE "user" SET role = 'admin' WHERE email = 'newadmin@company.com';

# Exit
\q
```

**When to use**:
- ✅ Automated deployment scripts
- ✅ Bulk operations
- ✅ Database migrations
- ⚠️ **Use with caution** - direct database access

---

## 🔄 Recommended Workflow for Production

### New Organization Setup

1. **Admin signs up** a new employee:
   ```
   Employee signs up at: https://yourapp.com/signup
   Email: employee@company.com
   Password: (their secure password)
   ```

2. **System admin promotes** the user:
   ```bash
   # SSH into production server
   ssh user@production-server
   
   # Navigate to project
   cd /var/www/v2-saas-solution
   
   # Run admin script
   pnpm admin:make employee@company.com
   ```

3. **Notify the employee**:
   ```
   Subject: Admin Access Granted
   
   Hi [Name],
   
   Your account has been upgraded to admin access.
   You can now access the admin dashboard at:
   https://yourapp.com/admin/dashboard
   
   Use your existing login credentials.
   ```

4. **Employee signs in** normally:
   - They will automatically be redirected to `/admin/dashboard`
   - Full admin access granted

---

## 🔐 Security Best Practices

### Do's ✅

1. **Use the admin script** (`pnpm admin:make`) for production
   - Auditable
   - Validated
   - Safe error handling

2. **Require pre-signup** before promoting to admin
   - User sets their own secure password
   - Email verification completed
   - User profile created

3. **Document admin promotions**
   - Keep a log of who was made admin and when
   - Include business justification
   - Track by whom (which admin performed the action)

4. **Use strong passwords** for admin accounts
   - Minimum 12 characters
   - Mix of upper/lower/numbers/symbols
   - Consider password manager

5. **Enable 2FA** (future enhancement)
   - Additional security layer for admin accounts
   - Reduces risk of compromised credentials

### Don'ts ❌

1. **Don't allow self-promotion** to admin
   - Never expose admin assignment in public APIs
   - Never allow users to set their own role

2. **Don't hardcode admin emails** in application code
   - Use environment variables or database
   - Allows flexibility without code changes

3. **Don't share admin credentials**
   - Each admin should have their own account
   - Use admin script to create multiple admins

4. **Don't use seed file in production**
   - Seed passwords are public in repo
   - Use admin script for production users

5. **Don't forget to revoke access**
   - Remove admin role when employees leave
   - Regular access reviews

---

## 🔧 Troubleshooting

### Script won't run

**Problem**: `tsx: command not found`

**Solution**:
```bash
# Install tsx if not already installed
pnpm add -D tsx

# Or use npx
npx tsx scripts/make-admin.ts email@example.com
```

---

### Database connection error

**Problem**: `Can't reach database server`

**Solution**:
```bash
# Check if database is running
pnpm docker:up

# Check DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL

# Test connection
pnpm db:studio
```

---

### User can't access admin routes after promotion

**Problem**: User promoted but still sees "Unauthorized"

**Solutions**:

1. **User needs to log out and log back in**:
   ```
   Session caches role at login time.
   Force refresh by signing out and signing back in.
   ```

2. **Clear browser cookies**:
   ```
   Sometimes old session cookies persist.
   Clear cookies for your domain and try again.
   ```

3. **Verify role was actually updated**:
   ```bash
   pnpm db:studio
   # Check user table for role field
   ```

---

## 📊 Comparison Matrix

| Method | Ease of Use | Production Safe | Auditable | Recommended |
|--------|-------------|-----------------|-----------|-------------|
| **Admin Script** | ⭐⭐⭐⭐⭐ | ✅ Yes | ✅ Yes | ⭐ **Best** |
| Database Seed | ⭐⭐⭐⭐ | ⚠️ Dev Only | ❌ No | Dev Only |
| Prisma Studio | ⭐⭐⭐⭐⭐ | ⚠️ Dev Only | ❌ No | Dev Only |
| SQL Query | ⭐⭐⭐ | ✅ Yes | ⚠️ Manual | Advanced |

---

## 📝 Related Documentation

- [Access Control & Authorization](./ACCESS_CONTROL.md) - Complete access control system
- [Database Seeding](./DATABASE_SEEDING.md) - Database seed file documentation
- [Project Setup](./PROJECT_SETUP.md) - Initial project configuration

---

## 🎓 Quick Reference

```bash
# Create initial admin (development)
pnpm db:seed

# Promote existing user to admin (production)
pnpm admin:make user@email.com

# View database (development)
pnpm db:studio

# Reset everything (development only!)
pnpm db:reset
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0
