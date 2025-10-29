"use server";

/**
 * Server Actions for Role Management
 * 
 * These actions handle creating, updating, deleting custom roles
 * and assigning/removing roles to/from members.
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createCustomRole as createRoleUtil,
  updateRolePermissions as updateRolePermissionsUtil,
  deleteCustomRole as deleteRoleUtil,
  assignRoleToMember as assignRoleUtil,
  removeRoleFromMember as removeRoleUtil,
} from "@/lib/permissions/roles";

/**
 * Check if user is org admin or owner
 */
async function requireOrgAdmin(organizationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check if user is global admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "admin") {
    return session.user.id;
  }

  // Check if user is org admin or owner
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
    select: { role: true },
  });

  if (!member || (member.role !== "admin" && member.role !== "owner")) {
    throw new Error("Only organization admins can manage roles");
  }

  return session.user.id;
}

/**
 * Get all custom roles for an organization's module
 */
export async function getOrganizationModuleRoles(input: {
  organizationId: string;
  moduleSlug: string;
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const orgModule = await prisma.organizationModule.findFirst({
      where: {
        organizationId: input.organizationId,
        module: {
          slug: input.moduleSlug,
        },
      },
      include: {
        module: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customRoles: {
          include: {
            permissions: {
              include: {
                modulePermission: {
                  select: {
                    id: true,
                    resource: true,
                    action: true,
                    description: true,
                  },
                },
              },
            },
            _count: {
              select: {
                memberRoles: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!orgModule) {
      return {
        success: false,
        error: "Module not assigned to this organization",
      };
    }

    return {
      success: true,
      data: {
        module: orgModule.module,
        roles: orgModule.customRoles,
      },
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch roles",
    };
  }
}

/**
 * Get all modules assigned to an organization with their roles
 */
export async function getOrganizationModules(organizationId: string) {
  try {
    await requireOrgAdmin(organizationId);

    const orgModules = await prisma.organizationModule.findMany({
      where: {
        organizationId,
        isEnabled: true,
      },
      include: {
        module: {
          include: {
            modulePermissions: {
              orderBy: [{ resource: "asc" }, { action: "asc" }],
            },
          },
        },
        customRoles: {
          select: {
            id: true,
            name: true,
            description: true,
            isPredefined: true,
            isActive: true,
            _count: {
              select: {
                memberRoles: true,
                permissions: true,
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
    });

    return {
      success: true,
      data: orgModules,
    };
  } catch (error) {
    console.error("Error fetching organization modules:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch modules",
    };
  }
}

/**
 * Create a new custom role
 */
export async function createCustomRoleAction(input: {
  organizationId: string;
  moduleSlug: string;
  name: string;
  description?: string;
  permissionIds: string[];
}) {
  try {
    const userId = await requireOrgAdmin(input.organizationId);

    // Get the organization module
    const orgModule = await prisma.organizationModule.findFirst({
      where: {
        organizationId: input.organizationId,
        module: {
          slug: input.moduleSlug,
        },
      },
      select: {
        id: true,
      },
    });

    if (!orgModule) {
      return {
        success: false,
        error: "Module not assigned to this organization",
      };
    }

    // Create the role
    const result = await createRoleUtil({
      organizationModuleId: orgModule.id,
      name: input.name,
      description: input.description,
      permissionIds: input.permissionIds,
    });

    if (result.success) {
      revalidatePath(`/org/${input.organizationId}/roles`);
    }

    return result;
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create role",
    };
  }
}

/**
 * Update role permissions
 */
export async function updateRolePermissionsAction(input: {
  organizationId: string;
  roleId: string;
  permissionIds: string[];
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const result = await updateRolePermissionsUtil({
      customRoleId: input.roleId,
      permissionIds: input.permissionIds,
    });

    if (result.success) {
      revalidatePath(`/org/${input.organizationId}/roles`);
    }

    return result;
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update role permissions",
    };
  }
}

/**
 * Update role details (name, description)
 */
export async function updateRoleDetailsAction(input: {
  organizationId: string;
  roleId: string;
  name: string;
  description?: string;
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const role = await prisma.customRole.update({
      where: {
        id: input.roleId,
      },
      data: {
        name: input.name,
        description: input.description,
      },
    });

    revalidatePath(`/org/${input.organizationId}/roles`);

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Error updating role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

/**
 * Delete a custom role
 */
export async function deleteCustomRoleAction(input: {
  organizationId: string;
  roleId: string;
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const result = await deleteRoleUtil(input.roleId);

    if (result.success) {
      revalidatePath(`/org/${input.organizationId}/roles`);
    }

    return result;
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete role",
    };
  }
}

/**
 * Assign a role to a member
 */
export async function assignRoleToMemberAction(input: {
  organizationId: string;
  memberId: string;
  roleId: string;
}) {
  try {
    const userId = await requireOrgAdmin(input.organizationId);

    const result = await assignRoleUtil({
      memberId: input.memberId,
      customRoleId: input.roleId,
      assignedBy: userId,
    });

    if (result.success) {
      revalidatePath(`/org/${input.organizationId}/members`);
      revalidatePath(`/org/${input.organizationId}/roles`);
    }

    return result;
  } catch (error) {
    console.error("Error assigning role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign role",
    };
  }
}

/**
 * Remove a role from a member
 */
export async function removeRoleFromMemberAction(input: {
  organizationId: string;
  memberId: string;
  roleId: string;
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const result = await removeRoleUtil({
      memberId: input.memberId,
      customRoleId: input.roleId,
    });

    if (result.success) {
      revalidatePath(`/org/${input.organizationId}/members`);
      revalidatePath(`/org/${input.organizationId}/roles`);
    }

    return result;
  } catch (error) {
    console.error("Error removing role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove role",
    };
  }
}

/**
 * Get member's assigned roles
 */
export async function getMemberRoles(input: {
  organizationId: string;
  memberId: string;
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const memberRoles = await prisma.memberModuleRole.findMany({
      where: {
        memberId: input.memberId,
      },
      include: {
        customRole: {
          include: {
            organizationModule: {
              include: {
                module: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            permissions: {
              include: {
                modulePermission: {
                  select: {
                    resource: true,
                    action: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return {
      success: true,
      data: memberRoles,
    };
  } catch (error) {
    console.error("Error fetching member roles:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch member roles",
    };
  }
}

/**
 * Get a single role's details with permissions
 */
export async function getRoleDetails(input: {
  organizationId: string;
  roleId: string;
}) {
  try {
    await requireOrgAdmin(input.organizationId);

    const role = await prisma.customRole.findUnique({
      where: {
        id: input.roleId,
      },
      include: {
        organizationModule: {
          include: {
            module: {
              include: {
                modulePermissions: {
                  orderBy: [{ resource: "asc" }, { action: "asc" }],
                },
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        permissions: {
          include: {
            modulePermission: {
              select: {
                id: true,
                resource: true,
                action: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            memberRoles: true,
          },
        },
      },
    });

    if (!role) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    // Verify role belongs to this organization
    if (role.organizationModule.organizationId !== input.organizationId) {
      return {
        success: false,
        error: "Role does not belong to this organization",
      };
    }

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Error fetching role details:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch role details",
    };
  }
}

/**
 * Get all available roles for an organization (for role assignment)
 */
export async function getAllOrganizationRoles(organizationId: string) {
  try {
    await requireOrgAdmin(organizationId);

    const roles = await prisma.customRole.findMany({
      where: {
        organizationModule: {
          organizationId,
          isEnabled: true,
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPredefined: true,
        organizationModule: {
          select: {
            module: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { organizationModule: { module: { name: "asc" } } },
        { isPredefined: "desc" },
        { name: "asc" },
      ],
    });

    // Transform to simpler structure
    const transformedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isPredefined: role.isPredefined,
      module: {
        id: role.organizationModule.module.id,
        name: role.organizationModule.module.name,
      },
    }));

    return {
      success: true,
      data: transformedRoles,
    };
  } catch (error) {
    console.error("Error fetching organization roles:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch organization roles",
    };
  }
}

/**
 * Get all effective permissions for a member across all their assigned roles
 * Returns permissions grouped by role with details
 */
export async function getMemberPermissionsAction(
  organizationId: string,
  memberId: string
): Promise<{
  success: boolean;
  data?: {
    memberName: string;
    organizationRole: "owner" | "admin" | "member";
    roles: Array<{
      roleName: string;
      isPredefined: boolean;
      moduleName: string;
      permissions: Array<{
        resource: string;
        action: string;
        description: string | null;
      }>;
    }>;
  };
  error?: string;
}> {
  try {
    // Get session and verify organization access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get member data
    const [member, memberRoles] = await Promise.all([
      prisma.member.findFirst({
        where: {
          id: memberId,
          organizationId,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.memberModuleRole.findMany({
        where: {
          memberId,
        },
        include: {
          customRole: {
            include: {
              permissions: {
                include: {
                  modulePermission: true,
                },
              },
              organizationModule: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    // Transform data
    const roles = memberRoles.map((mr) => ({
      roleName: mr.customRole.name,
      isPredefined: mr.customRole.isPredefined,
      moduleName: mr.customRole.organizationModule.module.name,
      permissions: mr.customRole.permissions.map((rp) => ({
        resource: rp.modulePermission.resource,
        action: rp.modulePermission.action,
        description: rp.modulePermission.description,
      })),
    }));

    return {
      success: true,
      data: {
        memberName: member.user.name || "Unknown",
        organizationRole: member.role as "owner" | "admin" | "member",
        roles,
      },
    };
  } catch (error) {
    console.error("Error fetching member permissions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch member permissions",
    };
  }
}
