"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";

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
 * Create a custom role for a module in an organization
 */
export async function createCustomRole(data: {
  organizationId: string;
  moduleId: string;
  name: string;
  description?: string;
  permissions: Array<{ modulePermissionId: string; granted: boolean }>;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isOrgAdmin(session.user.id, data.organizationId);
  if (!isAdmin) {
    return { error: "Only organization admins can create custom roles" };
  }

  // Get the organization module
  const orgModule = await prisma.organizationModule.findUnique({
    where: {
      organizationId_moduleId: {
        organizationId: data.organizationId,
        moduleId: data.moduleId,
      },
    },
  });

  if (!orgModule) {
    return { error: "Module not assigned to this organization" };
  }

  const [role, error] = await tryCatch(
    prisma.customRole.create({
      data: {
        organizationModuleId: orgModule.id,
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissions.map((perm) => ({
            modulePermissionId: perm.modulePermissionId,
            granted: perm.granted,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            modulePermission: true,
          },
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: role };
}

/**
 * Update a custom role
 */
export async function updateCustomRole(data: {
  roleId: string;
  organizationId: string;
  name?: string;
  description?: string;
  permissions?: Array<{ modulePermissionId: string; granted: boolean }>;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isOrgAdmin(session.user.id, data.organizationId);
  if (!isAdmin) {
    return { error: "Only organization admins can update custom roles" };
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  const [role, error] = await tryCatch(
    prisma.$transaction(async (tx) => {
      // Update role basic info
      const updated = await tx.customRole.update({
        where: { id: data.roleId },
        data: updateData,
      });

      // If permissions are provided, update them
      if (data.permissions) {
        // Delete existing permissions
        await tx.rolePermission.deleteMany({
          where: { customRoleId: data.roleId },
        });

        // Create new permissions
        await tx.rolePermission.createMany({
          data: data.permissions.map((perm) => ({
            customRoleId: data.roleId,
            modulePermissionId: perm.modulePermissionId,
            granted: perm.granted,
          })),
        });
      }

      return tx.customRole.findUnique({
        where: { id: data.roleId },
        include: {
          permissions: {
            include: {
              modulePermission: true,
            },
          },
        },
      });
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: role };
}

/**
 * Delete a custom role
 */
export async function deleteCustomRole(data: {
  roleId: string;
  organizationId: string;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isOrgAdmin(session.user.id, data.organizationId);
  if (!isAdmin) {
    return { error: "Only organization admins can delete custom roles" };
  }

  const [result, error] = await tryCatch(
    prisma.customRole.delete({
      where: { id: data.roleId },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: result };
}

/**
 * List custom roles for a module in an organization
 */
export async function listCustomRoles(
  organizationId: string,
  moduleId: string
) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  // Check if user is a member
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!member) {
    return { error: "Not a member of this organization" };
  }

  const orgModule = await prisma.organizationModule.findUnique({
    where: {
      organizationId_moduleId: {
        organizationId,
        moduleId,
      },
    },
  });

  if (!orgModule) {
    return { error: "Module not assigned to this organization" };
  }

  const [roles, error] = await tryCatch(
    prisma.customRole.findMany({
      where: {
        organizationModuleId: orgModule.id,
      },
      include: {
        permissions: {
          include: {
            modulePermission: true,
          },
        },
        _count: {
          select: {
            memberRoles: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: roles };
}

/**
 * Assign a custom role to a member
 */
export async function assignRoleToMember(data: {
  organizationId: string;
  memberId: string;
  roleId: string;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isOrgAdmin(session.user.id, data.organizationId);
  if (!isAdmin) {
    return { error: "Only organization admins can assign roles" };
  }

  // Check if member exists in organization
  const member = await prisma.member.findFirst({
    where: {
      id: data.memberId,
      organizationId: data.organizationId,
    },
  });

  if (!member) {
    return { error: "Member not found in organization" };
  }

  const [assignment, error] = await tryCatch(
    prisma.memberModuleRole.create({
      data: {
        memberId: data.memberId,
        customRoleId: data.roleId,
        assignedBy: session.user.id,
      },
      include: {
        customRole: {
          include: {
            permissions: {
              include: {
                modulePermission: true,
              },
            },
          },
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: assignment };
}

/**
 * Remove a role from a member
 */
export async function removeRoleFromMember(data: {
  organizationId: string;
  memberId: string;
  roleId: string;
}) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await isOrgAdmin(session.user.id, data.organizationId);
  if (!isAdmin) {
    return { error: "Only organization admins can remove roles" };
  }

  const [result, error] = await tryCatch(
    prisma.memberModuleRole.delete({
      where: {
        memberId_customRoleId: {
          memberId: data.memberId,
          customRoleId: data.roleId,
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
 * Get member's module roles
 */
export async function getMemberModuleRoles(
  organizationId: string,
  memberId: string,
  moduleId: string
) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  // Check if user is a member
  const userMember = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!userMember) {
    return { error: "Not a member of this organization" };
  }

  const orgModule = await prisma.organizationModule.findUnique({
    where: {
      organizationId_moduleId: {
        organizationId,
        moduleId,
      },
    },
  });

  if (!orgModule) {
    return { error: "Module not assigned to this organization" };
  }

  const [roles, error] = await tryCatch(
    prisma.memberModuleRole.findMany({
      where: {
        memberId,
        customRole: {
          organizationModuleId: orgModule.id,
        },
      },
      include: {
        customRole: {
          include: {
            permissions: {
              include: {
                modulePermission: true,
              },
            },
          },
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: roles };
}

/**
 * Check if a member has a specific permission
 */
export async function checkMemberPermission(
  memberId: string,
  organizationId: string,
  moduleSlug: string,
  resource: string,
  action: string
): Promise<boolean> {
  // First check if member is org admin (they have all permissions)
  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      organizationId,
    },
    select: { role: true },
  });

  if (!member) {
    return false;
  }

  if (member.role === "owner" || member.role === "admin") {
    return true;
  }

  // Get the organization module
  const orgModule = await prisma.organizationModule.findFirst({
    where: {
      organizationId,
      module: {
        slug: moduleSlug,
      },
    },
    include: {
      module: {
        include: {
          modulePermissions: {
            where: {
              resource,
              action,
            },
          },
        },
      },
    },
  });

  if (!orgModule || orgModule.module.modulePermissions.length === 0) {
    return false;
  }

  const permissionId = orgModule.module.modulePermissions[0].id;

  // Check if member has a role with this permission
  const hasPermission = await prisma.memberModuleRole.findFirst({
    where: {
      memberId,
      customRole: {
        organizationModuleId: orgModule.id,
        permissions: {
          some: {
            modulePermissionId: permissionId,
            granted: true,
          },
        },
      },
    },
  });

  return !!hasPermission;
}
