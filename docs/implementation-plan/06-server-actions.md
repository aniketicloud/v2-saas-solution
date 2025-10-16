# Part 6: Server Actions

**Last Updated**: October 17, 2025

---

## 🔧 Server Actions Overview

Server Actions handle all data mutations in the application. This part documents patterns and examples.

---

## 📐 Server Action Patterns

### Standard Pattern with tryCatch

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";

export async function actionName(param1: string, param2: string) {
  // 1. Get session
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Check permissions
  const permissionCheck = await auth.api.hasPermission({
    query: {
      organizationSlug: param1,
      permissions: {
        resource: ["action"],
      },
    },
    headers: await headers(),
  });

  if (!permissionCheck.success) {
    return { success: false, error: "Insufficient permissions" };
  }

  // 3. Perform action with tryCatch
  const [result, error] = await tryCatch(
    // Your async operation
    prisma.model.create({...})
  );

  if (error) {
    console.error("Error in actionName:", error);
    return { success: false, error: error.message };
  }

  // 4. Revalidate cache
  revalidatePath(`/org/${param1}/page`);

  return { success: true, data: result };
}
```

---

## 🆕 Module Management Actions

### Toggle Organization Module

```typescript
// app/(admin)/admin/organizations/[id]/modules/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";

export async function toggleOrganizationModule(
  organizationId: string,
  moduleKey: string,
  isEnabled: boolean
) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Only system admins can toggle modules
  if (session?.user?.role !== "admin") {
    return {
      success: false,
      error: "Only system administrators can manage organization modules",
    };
  }

  const [data, error] = await tryCatch(
    prisma.organizationModule.upsert({
      where: {
        organizationId_moduleKey: {
          organizationId,
          moduleKey,
        },
      },
      update: {
        isEnabled,
        ...(isEnabled
          ? { enabledAt: new Date(), enabledBy: session.user.id }
          : { disabledAt: new Date(), disabledBy: session.user.id }),
      },
      create: {
        organizationId,
        moduleKey,
        isEnabled,
        enabledBy: session.user.id,
      },
    })
  );

  if (error) {
    console.error("Error toggling module:", error);
    return { success: false, error: error.message || "Failed to toggle module" };
  }

  // Revalidate org pages
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { slug: true },
  });

  if (org?.slug) {
    revalidatePath(`/org/${org.slug}`);
    revalidatePath(`/admin/organizations/${organizationId}`);
  }

  return { success: true, data };
}

export async function getOrganizationModules(organizationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const [modules, error] = await tryCatch(
    prisma.organizationModule.findMany({
      where: { organizationId },
      orderBy: { enabledAt: "desc" },
    })
  );

  if (error) {
    return { success: false, error: error.message };
  }

  const availableModules = [
    {
      key: "visitor_management",
      name: "Visitor Management",
      description: "Track visitors, check-ins, and check-outs",
    },
    {
      key: "ticket_management",
      name: "Ticket Management",
      description: "Support tickets and issue tracking",
    },
    {
      key: "inventory",
      name: "Inventory Management",
      description: "Asset and stock management",
    },
  ];

  const modulesWithStatus = availableModules.map((availableModule) => {
    const enabledModule = modules?.find((m) => m.moduleKey === availableModule.key);
    return {
      ...availableModule,
      isEnabled: enabledModule?.isEnabled ?? false,
      enabledAt: enabledModule?.enabledAt,
      enabledBy: enabledModule?.enabledBy,
    };
  });

  return { success: true, data: modulesWithStatus };
}
```

---

## 👥 Member Management Actions

### Invite Member

```typescript
// app/(organization)/org/[slug]/members/invite/_lib/schema.ts
import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  role: z.enum(["owner", "admin", "member"], {
    required_error: "Role is required",
  }),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
```

```typescript
// app/(organization)/org/[slug]/members/invite/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { inviteMemberSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function inviteMember(
  organizationSlug: string,
  email: string,
  role: string
) {
  // Server-side validation
  const validationResult = inviteMemberSchema.safeParse({ email, role });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { email: validEmail, role: validRole } = validationResult.data;

  // Check permissions
  const permissionCheck = await auth.api.hasPermission({
    query: {
      organizationSlug,
      permissions: {
        invitation: ["create"],
      },
    },
    headers: await headers(),
  });

  if (!permissionCheck.success) {
    return {
      success: false,
      error: "You don't have permission to invite members",
    };
  }

  // Send invitation
  const [result, error] = await tryCatch(
    auth.api.inviteToOrganization({
      body: {
        organizationSlug,
        email: validEmail,
        role: validRole,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error inviting member:", error);
    return {
      success: false,
      error: error.message || "Failed to send invitation",
    };
  }

  revalidatePath(`/org/${organizationSlug}/members`);

  return { success: true, data: result };
}
```

### Remove Member

```typescript
// app/(organization)/org/[slug]/members/[memberId]/remove/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";

export async function removeMember(
  organizationSlug: string,
  memberId: string
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check permissions
  const permissionCheck = await auth.api.hasPermission({
    query: {
      organizationSlug,
      permissions: {
        member: ["delete"],
      },
    },
    headers: await headers(),
  });

  if (!permissionCheck.success) {
    return {
      success: false,
      error: "You don't have permission to remove members",
    };
  }

  // Prevent removing yourself
  const org = await auth.api.getFullOrganization({
    query: { organizationSlug },
    headers: await headers(),
  });

  const memberToRemove = org.members?.find((m) => m.id === memberId);
  if (memberToRemove?.userId === session.user.id) {
    return {
      success: false,
      error: "Cannot remove yourself. Transfer ownership first.",
    };
  }

  // Remove member
  const [result, error] = await tryCatch(
    auth.api.removeMember({
      body: {
        organizationSlug,
        memberId,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      error: error.message || "Failed to remove member",
    };
  }

  revalidatePath(`/org/${organizationSlug}/members`);

  return { success: true, data: result };
}
```

### Update Member Role

```typescript
// app/(organization)/org/[slug]/members/[memberId]/edit/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";

export async function updateMemberRole(
  organizationSlug: string,
  memberId: string,
  newRole: string
) {
  // Check permissions
  const permissionCheck = await auth.api.hasPermission({
    query: {
      organizationSlug,
      permissions: {
        member: ["update"],
      },
    },
    headers: await headers(),
  });

  if (!permissionCheck.success) {
    return {
      success: false,
      error: "You don't have permission to update member roles",
    };
  }

  // Update role
  const [result, error] = await tryCatch(
    auth.api.updateMemberRole({
      body: {
        organizationSlug,
        memberId,
        role: newRole,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error updating member role:", error);
    return {
      success: false,
      error: error.message || "Failed to update member role",
    };
  }

  revalidatePath(`/org/${organizationSlug}/members`);

  return { success: true, data: result };
}
```

---

## 🏢 Organization Actions

### Create Organization

```typescript
// app/(admin)/admin/organizations/new/_lib/schema.ts
import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must not exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
```

```typescript
// app/(admin)/admin/organizations/new/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { createOrganizationSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrganization(name: string, slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Only system admins can create organizations
  if (session?.user?.role !== "admin") {
    return {
      success: false,
      error: "Only system administrators can create organizations",
    };
  }

  // Validate input
  const validationResult = createOrganizationSchema.safeParse({ name, slug });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { name: validName, slug: validSlug } = validationResult.data;

  // Create organization
  const [result, error] = await tryCatch(
    auth.api.createOrganization({
      body: {
        name: validName,
        slug: validSlug,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error creating organization:", error);
    return {
      success: false,
      error: error.message || "Failed to create organization",
    };
  }

  revalidatePath("/admin/organizations");

  return { success: true, data: result };
}
```

### Delete Organization

```typescript
// app/(admin)/admin/organizations/[id]/edit/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteOrganization(organizationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Only system admins can delete organizations
  if (session?.user?.role !== "admin") {
    return {
      success: false,
      error: "Only system administrators can delete organizations",
    };
  }

  // Delete organization (cascades to members, modules, subscription)
  const [result, error] = await tryCatch(
    prisma.organization.delete({
      where: { id: organizationId },
    })
  );

  if (error) {
    console.error("Error deleting organization:", error);
    return {
      success: false,
      error: error.message || "Failed to delete organization",
    };
  }

  revalidatePath("/admin/organizations");

  return { success: true, data: result };
}
```

---

## 💳 Subscription Actions

### Update Subscription

```typescript
// app/(admin)/admin/organizations/[id]/subscription/_lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";

export async function updateSubscription(
  organizationId: string,
  plan: string
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.role !== "admin") {
    return {
      success: false,
      error: "Only system administrators can manage subscriptions",
    };
  }

  // Validate plan
  const validPlans = ["free", "monthly", "yearly"];
  if (!validPlans.includes(plan)) {
    return {
      success: false,
      error: `Invalid plan. Must be one of: ${validPlans.join(", ")}`,
    };
  }

  // Calculate period dates
  const now = new Date();
  const periodEnd = new Date(
    plan === "monthly"
      ? now.setMonth(now.getMonth() + 1)
      : now.setFullYear(now.getFullYear() + 1)
  );

  // Update or create subscription
  const [result, error] = await tryCatch(
    prisma.organizationSubscription.upsert({
      where: { organizationId },
      update: {
        plan,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
      create: {
        organizationId,
        plan,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    })
  );

  if (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error: error.message || "Failed to update subscription",
    };
  }

  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath(`/admin/organizations/${organizationId}/subscription`);

  return { success: true, data: result };
}
```

---

## ✅ Action Response Pattern

All actions follow this consistent response structure:

```typescript
type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

**Usage in Client**:
```tsx
const handleSubmit = async (data) => {
  const result = await inviteMember(orgSlug, data.email, data.role);
  
  if (result.success) {
    toast.success("Member invited successfully!");
    router.push(`/org/${orgSlug}/members`);
  } else {
    toast.error(result.error);
  }
};
```

---

## 🔒 Security Checklist for Actions

- [ ] **Always** validate on server (never trust client)
- [ ] **Always** check permissions with `hasPermission`
- [ ] **Always** check authentication (get session)
- [ ] **Always** use Zod for input validation
- [ ] **Always** use `tryCatch` for error handling
- [ ] **Always** sanitize user input
- [ ] **Always** use parameterized queries (Prisma does this)
- [ ] **Always** revalidate cache after mutations
- [ ] **Never** expose sensitive data in error messages
- [ ] **Never** trust route parameters directly

---

**Next**: [Part 7: Page Examples →](./07-page-examples.md)
