# Part 4: Routing Architecture

**Last Updated**: October 17, 2025

---

## 🗺️ Complete Route Structure

This section documents the entire routing architecture for the multi-tenant SaaS application.

```
app/
├── page.tsx                              # 🔑 Smart entry point (root redirect logic)
├── layout.tsx                            # Root layout (theme provider, toast)
├── globals.css                           # Global styles
│
├── (admin)/                              # 🛡️ System Admin Portal
│   └── admin/
│       ├── layout.tsx                    # Admin layout + sidebar
│       ├── dashboard/
│       │   └── page.tsx                  # Platform-wide metrics
│       │
│       ├── organizations/                # CRUD Organizations
│       │   ├── page.tsx                  # List all orgs (table with search)
│       │   ├── new/
│       │   │   ├── page.tsx              # Create org form
│       │   │   └── _lib/
│       │   │       ├── actions.ts        # createOrganization
│       │   │       └── schema.ts         # Zod validation
│       │   └── [id]/
│       │       ├── page.tsx              # View org details
│       │       ├── edit/
│       │       │   ├── page.tsx          # Edit org form
│       │       │   └── _lib/
│       │       │       ├── actions.ts    # updateOrganization, deleteOrganization
│       │       │       └── schema.ts     # Zod validation
│       │       ├── modules/              # 🆕 Module management
│       │       │   ├── page.tsx          # Toggle module switches
│       │       │   ├── _components/
│       │       │   │   └── module-toggle.tsx
│       │       │   └── _lib/
│       │       │       └── actions.ts    # toggleOrganizationModule
│       │       └── subscription/         # 🆕 Subscription management
│       │           ├── page.tsx          # Manage subscription
│       │           ├── _components/
│       │           │   ├── plan-selector.tsx
│       │           │   └── usage-metrics.tsx
│       │           └── _lib/
│       │               └── actions.ts    # updateSubscription
│       │
│       └── users/                        # System-wide user management
│           ├── page.tsx                  # List all users
│           ├── new/
│           │   ├── page.tsx              # Create user form
│           │   └── _lib/
│           │       ├── actions.ts        # createUser
│           │       └── schema.ts         # Zod validation
│           └── [id]/
│               ├── page.tsx              # User details
│               └── edit/
│                   └── page.tsx          # Edit user
│
├── (organization)/                       # 👥 Organization Workspace (ALL users)
│   └── org/
│       └── [slug]/
│           ├── layout.tsx                # ✅ Org layout (membership check + permissions)
│           │
│           ├── dashboard/                # 📊 Organization dashboard
│           │   └── page.tsx              # Overview, stats, recent activity
│           │
│           ├── members/                  # 👥 Member management
│           │   ├── page.tsx              # List members (table)
│           │   ├── invite/
│           │   │   ├── page.tsx          # Invite form
│           │   │   └── _lib/
│           │   │       ├── actions.ts    # inviteMember, cancelInvitation
│           │   │       └── schema.ts     # Zod validation
│           │   └── [memberId]/
│           │       ├── page.tsx          # Member details
│           │       ├── edit/
│           │       │   ├── page.tsx      # Edit role
│           │       │   └── _lib/
│           │       │       └── actions.ts # updateMemberRole
│           │       └── remove/
│           │           └── page.tsx      # Remove member (confirmation)
│           │
│           ├── settings/                 # ⚙️ Organization settings
│           │   ├── layout.tsx            # Settings layout (sidebar)
│           │   ├── general/
│           │   │   ├── page.tsx          # View org details
│           │   │   └── edit/
│           │   │       └── page.tsx      # Edit org (permission check)
│           │   ├── modules/              # 🆕 View enabled modules
│           │   │   └── page.tsx          # List enabled modules (read-only)
│           │   └── billing/              # 🆕 Subscription info
│           │       └── page.tsx          # View plan, usage (read-only)
│           │
│           └── modules/                  # 🆕 Dynamic Modules (Conditional)
│               ├── _lib/
│               │   └── check-module.ts   # Middleware to verify module access
│               │
│               ├── visitors/             # ✅ Only if "visitor_management" enabled
│               │   ├── page.tsx          # List visitors (table with filters)
│               │   ├── new/
│               │   │   ├── page.tsx      # Add visitor form
│               │   │   └── _lib/
│               │   │       ├── actions.ts # createVisitor
│               │   │       └── schema.ts
│               │   ├── check-in/
│               │   │   └── page.tsx      # Quick check-in flow
│               │   └── [visitorId]/
│               │       ├── page.tsx      # Visitor details
│               │       └── _components/
│               │           ├── check-in-button.tsx
│               │           └── check-out-button.tsx
│               │
│               ├── tickets/              # ✅ Only if "ticket_management" enabled
│               │   ├── page.tsx          # List tickets (kanban or table)
│               │   ├── new/
│               │   │   ├── page.tsx      # Create ticket form
│               │   │   └── _lib/
│               │   │       ├── actions.ts # createTicket
│               │   │       └── schema.ts
│               │   └── [ticketId]/
│               │       ├── page.tsx      # Ticket details
│               │       ├── assign/
│               │       │   └── page.tsx  # Assign to member
│               │       ├── _components/
│               │       │   ├── status-badge.tsx
│               │       │   ├── comment-form.tsx
│               │       │   └── activity-log.tsx
│               │       └── _lib/
│               │           └── actions.ts # updateTicket, assignTicket, closeTicket
│               │
│               └── inventory/            # ✅ Only if "inventory" enabled
│                   ├── page.tsx          # List inventory items (grid or table)
│                   ├── new/
│                   │   ├── page.tsx      # Add item form
│                   │   └── _lib/
│                   │       ├── actions.ts # createInventoryItem
│                   │       └── schema.ts
│                   └── [itemId]/
│                       ├── page.tsx      # Item details
│                       ├── edit/
│                       │   └── page.tsx  # Edit item
│                       ├── transfer/
│                       │   └── page.tsx  # Transfer item
│                       └── _components/
│                           ├── stock-badge.tsx
│                           └── history-log.tsx
│
├── dashboard/                            # 🏠 User's Personal Dashboard
│   ├── layout.tsx                        # Dashboard layout
│   ├── page.tsx                          # Personal overview (redirect to orgs)
│   ├── organizations/
│   │   └── page.tsx                      # Switch between orgs
│   ├── profile/
│   │   └── page.tsx                      # User profile settings
│   └── settings/
│       └── page.tsx                      # Personal preferences
│
├── select-organization/                  # 🔀 Organization selector
│   └── page.tsx                          # Choose org (if no active org)
│
├── unauthorized/                         # 🚫 Access denied
│   └── page.tsx                          # Permission denied message
│
├── login/                                # 🔐 Authentication
│   └── page.tsx                          # Login form
│
├── signup/                               # ✍️ Registration
│   └── page.tsx                          # Signup form
│
└── api/                                  # 🔌 API Routes
    └── auth/
        └── [...all]/
            └── route.ts                  # Better Auth handler
```

---

## 🔑 Smart Entry Point Logic

### Root Page (`app/page.tsx`)

The root page implements **smart routing** based on user role and active organization:

```tsx
// app/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // ============================================
  // 1. NOT AUTHENTICATED → Login
  // ============================================
  if (!session?.user) {
  redirect("/auth/login");
  }

  // ============================================
  // 2. SYSTEM ADMIN → Admin Portal or Active Org
  // ============================================
  if (session.user.role === "admin") {
    // Check if admin has an active organization set
    if (session.session.activeOrganizationId) {
      const org = await auth.api.getFullOrganization({
        query: { organizationId: session.session.activeOrganizationId },
        headers: await headers(),
      });

      if (org?.slug) {
        // Admin viewing an org → Go to org dashboard (with admin powers)
        redirect(`/org/${org.slug}/dashboard`);
      }
    }

    // Default: Admin portal dashboard
    redirect("/admin/dashboard");
  }

  // ============================================
  // 3. REGULAR USER → Active Organization
  // ============================================
  if (session.session.activeOrganizationId) {
    const org = await auth.api.getFullOrganization({
      query: { organizationId: session.session.activeOrganizationId },
      headers: await headers(),
    });

    if (org?.slug) {
      redirect(`/org/${org.slug}/dashboard`);
    }
  }

  // ============================================
  // 4. NO ACTIVE ORG → Organization Selector
  // ============================================
  redirect("/select-organization");
}
```

**Flow Diagram**:
```
User Visits "/"
      ↓
  Authenticated?
      ↓
    ┌─No─→ /login
    │
    Yes
    ↓
  System Admin?
    ↓
  ┌─Yes─→ Has Active Org? ─Yes─→ /org/[slug]/dashboard
  │           ↓
  │          No
  │           ↓
  │       /admin/dashboard
  │
  No (Regular User)
  ↓
Has Active Org?
  ↓
┌─Yes─→ /org/[slug]/dashboard
│
No
↓
/select-organization
```

---

## 🛡️ Admin Layout

### Admin Layout (`app/(admin)/admin/layout.tsx`)

```tsx
// app/(admin)/admin/layout.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Verify system admin role
  if (!session?.user || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}
```

**Key Points**:
- ✅ Verifies `User.role === "admin"` on EVERY page
- ✅ Redirects non-admins to `/unauthorized`
- ✅ Provides admin sidebar navigation
- ✅ Consistent layout across all admin pages

---

## 👥 Organization Layout

### Organization Layout (`app/(organization)/org/[slug]/layout.tsx`)

This is the **most important layout** - it handles both system admins and org members:

```tsx
// app/(organization)/org/[slug]/layout.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrgNav } from "@/components/org-nav";
import { PermissionsProvider } from "@/components/permissions-provider";

interface Params {
  slug: string;
}

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  // ============================================
  // 1. Check Authentication
  // ============================================
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
  redirect("/auth/login");
  }

  // ============================================
  // 2. Fetch Organization
  // ============================================
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: await headers(),
  });

  if (!organization) {
    notFound();
  }

  // ============================================
  // 3. Check System Admin Status
  // ============================================
  const isSystemAdmin = session.user.role === "admin";

  // ============================================
  // 4. Find Member Record
  // ============================================
  const member = organization.members?.find(
    (m) => m.userId === session.user.id
  );

  // ============================================
  // 5. Grant System Admins Virtual Owner Role
  // ============================================
  const effectiveMember = isSystemAdmin
    ? {
        id: "system-admin",
        userId: session.user.id,
        organizationId: organization.id,
        role: "owner", // Virtual owner role = full permissions
        createdAt: new Date(),
        user: session.user,
      }
    : member;

  // ============================================
  // 6. Verify Access (Regular users must be members)
  // ============================================
  if (!isSystemAdmin && !member) {
    redirect("/unauthorized");
  }

  // ============================================
  // 7. Fetch Enabled Modules
  // ============================================
  const modules = await prisma.organizationModule.findMany({
    where: {
      organizationId: organization.id,
      isEnabled: true,
    },
  });

  // ============================================
  // 8. Fetch Subscription (Optional)
  // ============================================
  const subscription = await prisma.organizationSubscription.findUnique({
    where: {
      organizationId: organization.id,
    },
  });

  // ============================================
  // 9. Render Layout with Context
  // ============================================
  return (
    <PermissionsProvider
      member={effectiveMember!}
      organization={organization}
      isSystemAdmin={isSystemAdmin}
    >
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <OrgNav
          organization={organization}
          user={session.user}
          member={effectiveMember!}
          modules={modules}
          subscription={subscription}
          isSystemAdmin={isSystemAdmin}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </PermissionsProvider>
  );
}
```

**Key Features**:
- ✅ System admins get virtual "owner" permissions
- ✅ Regular users must be members to access
- ✅ Fetches enabled modules for navigation
- ✅ Provides permission context to all child pages
- ✅ Shows system admin badge in UI
- ✅ Consistent layout across all org pages

---

## 🔒 Module Access Middleware

### Check Module Access (`app/(organization)/org/[slug]/modules/_lib/check-module.ts`)

```typescript
// app/(organization)/org/[slug]/modules/_lib/check-module.ts
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

/**
 * Verify that a module is enabled for an organization
 * Returns 404 if module is not enabled
 * 
 * @param organizationId - Organization ID
 * @param moduleKey - Module key (e.g., "visitor_management")
 */
export async function checkModuleAccess(
  organizationId: string,
  moduleKey: string
): Promise<void> {
  const module = await prisma.organizationModule.findUnique({
    where: {
      organizationId_moduleKey: {
        organizationId,
        moduleKey,
      },
    },
  });

  // Module not found or disabled → 404
  if (!module || !module.isEnabled) {
    notFound();
  }
}

/**
 * Check if organization's subscription allows module access
 * (Future enhancement for plan-based restrictions)
 */
export async function checkSubscriptionLimit(
  organizationId: string,
  moduleKey: string
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await prisma.organizationSubscription.findUnique({
    where: { organizationId },
  });

  if (!subscription) {
    return { allowed: false, reason: "No active subscription" };
  }

  // Plan-based restrictions (example)
  if (subscription.plan === "free") {
    const enabledCount = await prisma.organizationModule.count({
      where: {
        organizationId,
        isEnabled: true,
      },
    });

    if (enabledCount >= 2) {
      return {
        allowed: false,
        reason: "Free plan allows max 2 modules. Upgrade to enable more.",
      };
    }
  }

  return { allowed: true };
}
```

---

### Usage in Module Pages

```tsx
// app/(organization)/org/[slug]/modules/visitors/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkModuleAccess } from "../_lib/check-module";
import { VisitorsList } from "./_components/visitors-list";

export default async function VisitorsPage({
  params,
}: {
  params: { slug: string };
}) {
  // Get organization
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: await headers(),
  });

  // ✅ Verify visitor module is enabled
  await checkModuleAccess(organization.id, "visitor_management");

  // Module is enabled, render the page
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Visitor Management</h1>
        <p className="text-sm text-gray-600">
          Track and manage visitor check-ins and check-outs
        </p>
      </div>

      <VisitorsList organizationId={organization.id} />
    </div>
  );
}
```

**What Happens**:
1. User navigates to `/org/nike/modules/visitors`
2. Organization layout verifies membership
3. `checkModuleAccess` verifies module is enabled
4. If disabled → Returns 404 (module not found)
5. If enabled → Renders visitor management page

---

## 🔀 Organization Selector

### Select Organization Page (`app/select-organization/page.tsx`)

```tsx
// app/select-organization/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SelectOrganizationPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
  redirect("/auth/login");
  }

  // Fetch user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // If only one org, go directly to it
  if (organizations?.length === 1) {
    redirect(`/org/${organizations[0].slug}/dashboard`);
  }

  // No organizations
  if (!organizations || organizations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Organizations</h1>
          <p className="text-gray-600 mb-6">
            You are not a member of any organization yet.
          </p>
          <p className="text-sm text-gray-500">
            Contact your system administrator to be added to an organization.
          </p>
        </Card>
      </div>
    );
  }

  // Multiple organizations - show selector
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Select Organization
        </h1>

        <div className="grid gap-4 md:grid-cols-2">
          {organizations.map((org) => (
            <Card key={org.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="h-12 w-12 rounded-lg"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{org.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {org.role} • {org.memberCount} members
                  </p>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href={`/org/${org.slug}/dashboard`}>
                  Open Workspace
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🚫 Unauthorized Page

### Unauthorized Access Page (`app/unauthorized/page.tsx`)

```tsx
// app/unauthorized/page.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 text-center">
        <div className="mb-4 flex justify-center">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              Go to Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/select-organization">
              Switch Organization
            </Link>
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you believe this is an error, contact your organization administrator.
        </p>
      </Card>
    </div>
  );
}
```

---

## 🔄 Navigation Between Contexts

### Admin → Organization

System admins can navigate from admin portal to any organization:

```tsx
// app/(admin)/admin/organizations/[id]/page.tsx
<Button asChild>
  <Link href={`/org/${organization.slug}/dashboard`}>
    View Organization Workspace
  </Link>
</Button>
```

### Organization → Admin Portal

System admins see a link back to admin portal in org navigation:

```tsx
// components/org-nav.tsx
{isSystemAdmin && (
  <div className="border-t p-4">
    <Link
      href="/admin/dashboard"
      className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
    >
      ← Admin Portal
    </Link>
  </div>
)}
```

### Between Organizations

Users with multiple organizations can switch:

```tsx
// components/org-nav.tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    {organization.name} ▼
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {userOrganizations.map((org) => (
      <DropdownMenuItem key={org.id}>
        <Link href={`/org/${org.slug}/dashboard`}>
          {org.name}
        </Link>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 📱 Responsive Layouts

### Mobile Navigation

```tsx
// components/mobile-nav.tsx
"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { OrgNav } from "./org-nav";

export function MobileNav({ ...props }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <OrgNav {...props} />
      </SheetContent>
    </Sheet>
  );
}
```

---

## 🧭 Breadcrumb Navigation

```tsx
// components/breadcrumb-nav.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function BreadcrumbNav({ organization }: { organization: { name: string; slug: string } }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [
    { label: organization.name, href: `/org/${organization.slug}/dashboard` },
  ];

  // Parse path segments
  if (segments.includes("members")) {
    breadcrumbs.push({ label: "Members", href: `/org/${organization.slug}/members` });
  }
  if (segments.includes("settings")) {
    breadcrumbs.push({ label: "Settings", href: `/org/${organization.slug}/settings/general` });
  }
  if (segments.includes("modules")) {
    const moduleIndex = segments.indexOf("modules");
    const moduleName = segments[moduleIndex + 1];
    if (moduleName) {
      breadcrumbs.push({
        label: moduleName.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        href: `/org/${organization.slug}/modules/${moduleName}`,
      });
    }
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-gray-900">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-gray-900">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

---

## 🔍 Route Protection Summary

| Route Pattern | Access Control | Redirect If Denied |
|---------------|----------------|-------------------|
| `/` | None | `/auth/login` if not authenticated |
| `/admin/*` | `User.role === "admin"` | `/unauthorized` |
| `/org/[slug]/*` | System admin OR member | `/unauthorized` |
| `/org/[slug]/modules/*` | Module enabled + permissions | 404 |
| `/org/[slug]/settings/general/edit` | `organization.update` permission | `/org/[slug]/settings/general` |
| `/org/[slug]/members/invite` | `invitation.create` permission | `/org/[slug]/members` |
| `/dashboard/*` | Authenticated | `/auth/login` |

---

## 🚀 Performance Optimizations

### 1. Parallel Data Fetching

```tsx
// Fetch multiple resources in parallel
const [organization, modules, subscription] = await Promise.all([
  auth.api.getFullOrganization({...}),
  prisma.organizationModule.findMany({...}),
  prisma.organizationSubscription.findUnique({...}),
]);
```

### 2. Route Caching

```tsx
// Enable static generation where possible
export const revalidate = 60; // Revalidate every 60 seconds

// Or dynamic with specific cache
export const dynamic = "force-dynamic";
export const fetchCache = "force-cache";
```

### 3. Loading States

```tsx
// app/(organization)/org/[slug]/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

---

**Next**: [Part 5: UI Components →](./05-ui-components.md)
