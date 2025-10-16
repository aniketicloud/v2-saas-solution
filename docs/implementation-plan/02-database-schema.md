# Part 2: Database Schema

**Last Updated**: October 17, 2025

---

## 📊 Current Schema Analysis

### Existing Models (From Better Auth)

Your current Prisma schema already includes these Better Auth models:

```prisma
✅ User              # System-level users
✅ Session           # Authentication sessions  
✅ Account           # OAuth/email accounts
✅ Organization      # Organizations (tenants)
✅ Member            # Organization membership
✅ Invitation        # Pending invitations
✅ Team              # Sub-teams within orgs
✅ TeamMember        # Team membership
✅ Verification      # Email verification
```

### Current Relationships

```
User (1) ──────┬───────> (N) Session
               ├───────> (N) Account
               ├───────> (N) Member
               ├───────> (N) Invitation (as inviter)
               └───────> (N) TeamMember

Organization (1) ──┬───> (N) Member
                   ├───> (N) Invitation
                   └───> (N) Team

Team (1) ──────────────> (N) TeamMember
```

---

## 🆕 Required Schema Extensions

We need to add **2 new models** and **update 1 existing model**:

1. **OrganizationSubscription** - Track billing and plan details
2. **OrganizationModule** - Feature flags for enabled modules
3. **Update Organization** - Add relations to new models

---

## 📝 New Schema Models

### 1. OrganizationSubscription Model

**Purpose**: Track subscription plans, billing cycles, and payment status for each organization.

```prisma
model OrganizationSubscription {
  id                     String       @id @default(cuid())
  organizationId         String       @unique
  organization           Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Plan & Status
  plan                   String       // "free", "monthly", "yearly"
  status                 String       // "active", "trial", "canceled", "expired", "past_due"
  
  // Billing Periods
  currentPeriodStart     DateTime
  currentPeriodEnd       DateTime
  trialEndsAt            DateTime?
  canceledAt             DateTime?
  cancelAtPeriodEnd      Boolean      @default(false)
  
  // Payment Provider Integration (Stripe)
  stripeCustomerId       String?      @unique
  stripeSubscriptionId   String?      @unique
  stripePriceId          String?
  stripePaymentMethodId  String?
  
  // Usage Tracking (for future usage-based billing)
  currentPeriodUsage     Json?        // { "api_calls": 1500, "storage_gb": 25 }
  
  // Metadata
  metadata               Json?        // Additional plan-specific data
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt
  
  @@map("organizationSubscription")
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `plan` | String | Plan tier: "free", "monthly", "yearly" |
| `status` | String | Subscription status: "active", "trial", "canceled", "expired", "past_due" |
| `currentPeriodStart` | DateTime | Start of current billing period |
| `currentPeriodEnd` | DateTime | End of current billing period |
| `trialEndsAt` | DateTime? | When trial expires (null if not on trial) |
| `canceledAt` | DateTime? | When subscription was canceled |
| `cancelAtPeriodEnd` | Boolean | If true, subscription ends at period end |
| `stripeCustomerId` | String? | Stripe customer ID for billing |
| `stripeSubscriptionId` | String? | Stripe subscription ID |
| `stripePriceId` | String? | Stripe price ID (monthly/yearly) |
| `currentPeriodUsage` | Json? | Track usage metrics for billing |

**Plan Definitions** (to be defined in code):

```typescript
// lib/subscription-plans.ts
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      modules: 2,
      members: 10,
      storage_gb: 1,
      api_calls_per_month: 1000,
    },
    features: [
      "Basic visitor management",
      "Email support",
      "1GB storage",
    ],
  },
  monthly: {
    name: "Professional",
    price: 29,
    interval: "month",
    limits: {
      modules: 5,
      members: 50,
      storage_gb: 50,
      api_calls_per_month: 50000,
    },
    features: [
      "All modules available",
      "Priority support",
      "50GB storage",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  yearly: {
    name: "Enterprise",
    price: 290,
    interval: "year",
    limits: {
      modules: 999,
      members: 999,
      storage_gb: 500,
      api_calls_per_month: 999999,
    },
    features: [
      "Unlimited modules",
      "Unlimited members",
      "24/7 phone support",
      "500GB storage",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
} as const;
```

---

### 2. OrganizationModule Model

**Purpose**: Control which features (modules) are enabled for each organization.

```prisma
model OrganizationModule {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Module Identification
  moduleKey      String       // "visitor_management", "ticket_management", "inventory"
  isEnabled      Boolean      @default(true)
  
  // Module Configuration (JSON)
  settings       Json?        // Module-specific settings
  // Example for visitor_management:
  // {
  //   "maxDailyVisitors": 100,
  //   "requirePhoto": true,
  //   "requireIdScan": false,
  //   "notificationEmail": "security@nike.com",
  //   "autoCheckoutHours": 8
  // }
  
  // Audit Fields
  enabledAt      DateTime     @default(now())
  enabledBy      String?      // User ID who enabled it
  disabledAt     DateTime?
  disabledBy     String?      // User ID who disabled it
  
  @@unique([organizationId, moduleKey])
  @@map("organizationModule")
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `moduleKey` | String | Unique identifier for the module |
| `isEnabled` | Boolean | Whether module is currently active |
| `settings` | Json? | Module-specific configuration |
| `enabledBy` | String? | User ID of admin who enabled module |
| `disabledBy` | String? | User ID of admin who disabled module |

**Available Modules** (initial set):

```typescript
// lib/modules.ts
export const AVAILABLE_MODULES = {
  visitor_management: {
    key: "visitor_management",
    name: "Visitor Management",
    description: "Track visitors, check-ins, and check-outs",
    icon: "UserCheck",
    category: "Operations",
    defaultSettings: {
      maxDailyVisitors: 100,
      requirePhoto: false,
      requireIdScan: false,
      autoCheckoutHours: 8,
    },
  },
  ticket_management: {
    key: "ticket_management",
    name: "Ticket Management",
    description: "Support tickets and issue tracking",
    icon: "Ticket",
    category: "Support",
    defaultSettings: {
      autoAssignTickets: false,
      ticketCategories: ["Technical", "Billing", "General"],
      slaHours: 24,
    },
  },
  inventory: {
    key: "inventory",
    name: "Inventory Management",
    description: "Asset and stock management",
    icon: "Package",
    category: "Operations",
    defaultSettings: {
      lowStockThreshold: 10,
      enableBarcodeScanning: false,
      trackSerialNumbers: true,
    },
  },
  // Future modules
  crm: {
    key: "crm",
    name: "CRM",
    description: "Customer relationship management",
    icon: "Users",
    category: "Sales",
  },
  invoicing: {
    key: "invoicing",
    name: "Invoicing",
    description: "Create and manage invoices",
    icon: "FileText",
    category: "Finance",
  },
} as const;
```

---

### 3. Update Organization Model

Add relations to the two new models:

```prisma
model Organization {
  id          String       @id
  name        String
  slug        String       @unique
  logo        String?
  createdAt   DateTime
  metadata    String?
  
  // 👇 Existing Relations
  members     Member[]
  invitations Invitation[]
  teams       Team[]
  
  // 🆕 NEW: Add these relations
  subscription OrganizationSubscription?
  modules      OrganizationModule[]
  
  @@map("organization")
}
```

---

## 🔧 Migration Steps

### Step 1: Update schema.prisma

Add the complete new models to your `prisma/schema.prisma` file:

```prisma
// Add after the existing models

model OrganizationSubscription {
  id                     String       @id @default(cuid())
  organizationId         String       @unique
  organization           Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  plan                   String
  status                 String
  currentPeriodStart     DateTime
  currentPeriodEnd       DateTime
  trialEndsAt            DateTime?
  canceledAt             DateTime?
  cancelAtPeriodEnd      Boolean      @default(false)
  
  stripeCustomerId       String?      @unique
  stripeSubscriptionId   String?      @unique
  stripePriceId          String?
  stripePaymentMethodId  String?
  
  currentPeriodUsage     Json?
  metadata               Json?
  
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt
  
  @@map("organizationSubscription")
}

model OrganizationModule {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  moduleKey      String
  isEnabled      Boolean      @default(true)
  settings       Json?
  
  enabledAt      DateTime     @default(now())
  enabledBy      String?
  disabledAt     DateTime?
  disabledBy     String?
  
  @@unique([organizationId, moduleKey])
  @@map("organizationModule")
}

// Update Organization model (find existing and add these lines)
model Organization {
  // ...existing fields...
  
  subscription OrganizationSubscription?
  modules      OrganizationModule[]
  
  // ...rest of model...
}
```

---

### Step 2: Create Migration

Run the Prisma migration command:

```bash
npx prisma migrate dev --name add_subscriptions_and_modules
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "v2_saas", schema "public" at "localhost:5432"

Applying migration `20251017_add_subscriptions_and_modules`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251017000000_add_subscriptions_and_modules/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client to ./generated/prisma
```

---

### Step 3: Verify Migration SQL

Check the generated SQL file:

```sql
-- prisma/migrations/XXXXXX_add_subscriptions_and_modules/migration.sql

-- CreateTable
CREATE TABLE "organizationSubscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripePaymentMethodId" TEXT,
    "currentPeriodUsage" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationModule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabledBy" TEXT,
    "disabledAt" TIMESTAMP(3),
    "disabledBy" TEXT,

    CONSTRAINT "organizationModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizationSubscription_organizationId_key" 
  ON "organizationSubscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationSubscription_stripeCustomerId_key" 
  ON "organizationSubscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationSubscription_stripeSubscriptionId_key" 
  ON "organizationSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationModule_organizationId_moduleKey_key" 
  ON "organizationModule"("organizationId", "moduleKey");

-- AddForeignKey
ALTER TABLE "organizationSubscription" ADD CONSTRAINT 
  "organizationSubscription_organizationId_fkey" 
  FOREIGN KEY ("organizationId") 
  REFERENCES "organization"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationModule" ADD CONSTRAINT 
  "organizationModule_organizationId_fkey" 
  FOREIGN KEY ("organizationId") 
  REFERENCES "organization"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;
```

---

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

**Verify**: Check that `generated/prisma/index.d.ts` includes the new models.

---

### Step 5: Test in Prisma Studio

```bash
npx prisma studio
```

Navigate to `http://localhost:5555` and verify:
- ✅ `organizationSubscription` table exists
- ✅ `organizationModule` table exists
- ✅ Relationships are shown correctly

---

## 🌱 Optional: Seed Data

Create a seed script to populate initial data:

```typescript
// prisma/seed.ts
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Get all organizations
  const organizations = await prisma.organization.findMany();

  for (const org of organizations) {
    // Create free subscription for each org (if not exists)
    const existingSub = await prisma.organizationSubscription.findUnique({
      where: { organizationId: org.id },
    });

    if (!existingSub) {
      await prisma.organizationSubscription.create({
        data: {
          organizationId: org.id,
          plan: "free",
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
          ),
        },
      });
      console.log(`✅ Created free subscription for ${org.name}`);
    }

    // Enable visitor_management module by default
    const existingModule = await prisma.organizationModule.findUnique({
      where: {
        organizationId_moduleKey: {
          organizationId: org.id,
          moduleKey: "visitor_management",
        },
      },
    });

    if (!existingModule) {
      await prisma.organizationModule.create({
        data: {
          organizationId: org.id,
          moduleKey: "visitor_management",
          isEnabled: true,
          settings: {
            maxDailyVisitors: 100,
            requirePhoto: false,
            autoCheckoutHours: 8,
          },
        },
      });
      console.log(`✅ Enabled visitor_management for ${org.name}`);
    }
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run Seed**:
```bash
npx tsx prisma/seed.ts
```

---

## 📊 Updated ERD (Entity Relationship Diagram)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   Session   │       │   Account   │
└─────────────┘       └─────────────┘
       │
       ▼
┌─────────────┐       ┌──────────────────────┐
│   Member    │◄──────┤   Organization       │
└─────────────┘       ├──────────────────────┤
       │              │ - subscription (1:1) │
       ▼              │ - modules (1:N)      │
┌─────────────┐       └──────┬───────────────┘
│ Invitation  │              │
└─────────────┘              │
                             ├──────────────────┐
                             │                  │
                             ▼                  ▼
                  ┌────────────────────┐  ┌──────────────────┐
                  │ OrgSubscription    │  │  OrgModule       │
                  ├────────────────────┤  ├──────────────────┤
                  │ - plan             │  │ - moduleKey      │
                  │ - status           │  │ - isEnabled      │
                  │ - stripeCustomerId │  │ - settings (JSON)│
                  └────────────────────┘  └──────────────────┘
```

---

## 🔍 Querying Examples

### Example 1: Get Organization with Subscription and Modules

```typescript
const org = await prisma.organization.findUnique({
  where: { slug: "nike" },
  include: {
    subscription: true,
    modules: {
      where: { isEnabled: true },
    },
    members: {
      include: {
        user: true,
      },
    },
  },
});

// Result:
// {
//   id: "org_123",
//   name: "Nike",
//   slug: "nike",
//   subscription: {
//     plan: "monthly",
//     status: "active",
//     currentPeriodEnd: "2025-11-17T00:00:00.000Z"
//   },
//   modules: [
//     { moduleKey: "visitor_management", isEnabled: true },
//     { moduleKey: "ticket_management", isEnabled: true }
//   ],
//   members: [...]
// }
```

---

### Example 2: Check if Module is Enabled

```typescript
const module = await prisma.organizationModule.findUnique({
  where: {
    organizationId_moduleKey: {
      organizationId: "org_123",
      moduleKey: "visitor_management",
    },
  },
});

if (!module || !module.isEnabled) {
  throw new Error("Module not enabled");
}
```

---

### Example 3: Get Organizations with Expired Subscriptions

```typescript
const expiredOrgs = await prisma.organization.findMany({
  where: {
    subscription: {
      currentPeriodEnd: {
        lt: new Date(), // Less than now
      },
      status: "active",
    },
  },
  include: {
    subscription: true,
  },
});

// Process expired subscriptions
for (const org of expiredOrgs) {
  await prisma.organizationSubscription.update({
    where: { organizationId: org.id },
    data: { status: "expired" },
  });
  
  // Send notification email
  // Disable modules if needed
}
```

---

### Example 4: Get Module Usage Statistics

```typescript
const moduleStats = await prisma.organizationModule.groupBy({
  by: ["moduleKey"],
  where: {
    isEnabled: true,
  },
  _count: {
    moduleKey: true,
  },
});

// Result:
// [
//   { moduleKey: "visitor_management", _count: { moduleKey: 45 } },
//   { moduleKey: "ticket_management", _count: { moduleKey: 32 } },
//   { moduleKey: "inventory", _count: { moduleKey: 18 } }
// ]
```

---

## 🛡️ Data Integrity Constraints

### Constraints Enforced by Prisma

1. **Unique Organization Subscription**
   - Each organization can have only one subscription
   - Enforced by `@unique` on `organizationId`

2. **Unique Module per Organization**
   - Each organization can have each module only once
   - Enforced by `@@unique([organizationId, moduleKey])`

3. **Cascade Deletes**
   - Deleting organization deletes its subscription
   - Deleting organization deletes its modules
   - Prevents orphaned records

4. **Unique Stripe IDs**
   - Each Stripe customer/subscription ID can only belong to one org
   - Prevents double-billing

---

### Application-Level Validations

```typescript
// Example validation before enabling module
async function validateModuleEnable(orgId: string, moduleKey: string) {
  // 1. Check subscription limits
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      subscription: true,
      modules: {
        where: { isEnabled: true },
      },
    },
  });

  const plan = SUBSCRIPTION_PLANS[org.subscription.plan];
  if (org.modules.length >= plan.limits.modules) {
    throw new Error(
      `Plan limit reached. Upgrade to enable more modules.`
    );
  }

  // 2. Check if module exists
  if (!AVAILABLE_MODULES[moduleKey]) {
    throw new Error(`Module '${moduleKey}' does not exist`);
  }

  // 3. Check if already enabled
  const existing = await prisma.organizationModule.findUnique({
    where: {
      organizationId_moduleKey: {
        organizationId: orgId,
        moduleKey,
      },
    },
  });

  if (existing && existing.isEnabled) {
    throw new Error(`Module '${moduleKey}' is already enabled`);
  }

  return true;
}
```

---

## 📝 Migration Checklist

- [ ] **Backup database** before running migration
- [ ] **Review migration SQL** to understand changes
- [ ] **Test migration on development database** first
- [ ] **Run migration on staging** and verify
- [ ] **Generate Prisma client** after migration
- [ ] **Update TypeScript types** if needed
- [ ] **Test queries** in Prisma Studio
- [ ] **Run seed script** if needed
- [ ] **Update API documentation** with new models
- [ ] **Notify team** of schema changes

---

## 🔄 Rollback Plan

If migration fails or causes issues:

```bash
# 1. Revert to previous migration
npx prisma migrate resolve --rolled-back 20251017000000_add_subscriptions_and_modules

# 2. Restore database from backup
pg_restore -d v2_saas backup_20251017.dump

# 3. Reset migrations (nuclear option)
npx prisma migrate reset
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Migration Fails with Foreign Key Error
**Cause**: Existing organizations have no subscription record  
**Solution**: Create default subscriptions before running migration

### Issue 2: JSON Field Not Supported
**Cause**: Using SQLite instead of PostgreSQL  
**Solution**: Switch to PostgreSQL or use String field with JSON.parse()

### Issue 3: Generated Client Not Updated
**Cause**: Prisma generate not run after migration  
**Solution**: Run `npx prisma generate` manually

### Issue 4: TypeScript Errors After Migration
**Cause**: Old Prisma client cached in node_modules  
**Solution**: Delete `node_modules` and `pnpm-lock.yaml`, then `pnpm install`

---

**Next**: [Part 3: Permission System →](./03-permissions.md)
