"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { createPredefinedRoles } from "@/lib/permissions/roles";

/**
 * Check if user is a system admin
 */
async function isSystemAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "admin";
}

/**
 * Check if user is an organization admin or owner
 */
async function isOrgAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
    select: { role: true },
  });

  return member?.role === "owner" || member?.role === "admin";
}

/**
 * Create a new module (System Admin only)
 */
export async function createModule(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  defaultPermissions?: Array<{ resource: string; action: string; description?: string }>;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isSystemAdmin(session.user.id);
  if (!isAdmin) {
    return { error: "Only system administrators can create modules" };
  }

  const [module, error] = await tryCatch(
    prisma.module.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        modulePermissions: data.defaultPermissions
          ? {
              create: data.defaultPermissions.map((perm) => ({
                resource: perm.resource,
                action: perm.action,
                description: perm.description,
              })),
            }
          : undefined,
      },
      include: {
        modulePermissions: true,
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: module };
}

/**
 * List all available modules
 */
export async function listModules() {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const [modules, error] = await tryCatch(
    prisma.module.findMany({
      where: { isActive: true },
      include: {
        modulePermissions: true,
        _count: {
          select: { organizationModules: true },
        },
      },
      orderBy: { name: "asc" },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: modules };
}

/**
 * Assign a module to an organization (System Admin or Org Admin)
 */
export async function assignModuleToOrganization(data: {
  organizationId: string;
  moduleId: string;
  settings?: Record<string, any>;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isSystemAdmin(session.user.id);
  const isOrgAdminUser = await isOrgAdmin(
    session.user.id,
    data.organizationId
  );

  if (!isAdmin && !isOrgAdminUser) {
    return {
      error:
        "Only system administrators or organization admins can assign modules",
    };
  }

  // Check if module exists
  const module = await prisma.module.findUnique({
    where: { id: data.moduleId },
  });

  if (!module) {
    return { error: "Module not found" };
  }

  // Check if already assigned
  const existing = await prisma.organizationModule.findUnique({
    where: {
      organizationId_moduleId: {
        organizationId: data.organizationId,
        moduleId: data.moduleId,
      },
    },
  });

  if (existing) {
    return { error: "Module already assigned to this organization" };
  }

  const [orgModule, error] = await tryCatch(
    prisma.organizationModule.create({
      data: {
        organizationId: data.organizationId,
        moduleId: data.moduleId,
        settings: data.settings,
        assignedBy: session.user.id,
      },
      include: {
        module: {
          include: {
            modulePermissions: true,
          },
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  // Automatically create predefined roles (Admin, Editor, Viewer)
  // This runs in the background and won't block the response
  if (orgModule && module.slug) {
    createPredefinedRoles({
      organizationModuleId: orgModule.id,
      moduleSlug: module.slug,
      createdBy: session.user.id,
    }).catch((err) => {
      console.error("Failed to create predefined roles:", err);
      // Don't fail the module assignment if role creation fails
    });
  }

  return { data: orgModule };
}

/**
 * Remove a module from an organization
 */
export async function removeModuleFromOrganization(data: {
  organizationId: string;
  moduleId: string;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isSystemAdmin(session.user.id);
  const isOrgAdminUser = await isOrgAdmin(
    session.user.id,
    data.organizationId
  );

  if (!isAdmin && !isOrgAdminUser) {
    return { error: "Unauthorized to remove module" };
  }

  const [result, error] = await tryCatch(
    prisma.organizationModule.delete({
      where: {
        organizationId_moduleId: {
          organizationId: data.organizationId,
          moduleId: data.moduleId,
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: result };
}

/**
 * Get modules assigned to an organization
 */
export async function getOrganizationModules(organizationId: string) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  // Check if user is a member of the organization
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!member) {
    return { error: "Not a member of this organization" };
  }

  const [modules, error] = await tryCatch(
    prisma.organizationModule.findMany({
      where: {
        organizationId,
        isEnabled: true,
      },
      include: {
        module: {
          include: {
            modulePermissions: true,
          },
        },
        customRoles: {
          include: {
            permissions: {
              include: {
                modulePermission: true,
              },
            },
          },
        },
      },
      orderBy: {
        module: {
          name: "asc",
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: modules };
}

/**
 * Check if user has access to a module in an organization
 */
export async function checkModuleAccess(
  userId: string,
  organizationId: string,
  moduleSlug: string
): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (!member) {
    return false;
  }

  const orgModule = await prisma.organizationModule.findFirst({
    where: {
      organizationId,
      isEnabled: true,
      module: {
        slug: moduleSlug,
        isActive: true,
      },
    },
  });

  return !!orgModule;
}
