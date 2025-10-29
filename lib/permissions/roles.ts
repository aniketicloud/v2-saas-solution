/**
 * Role Management Utilities
 * 
 * Functions to create and manage custom roles and their permissions
 */

import { prisma } from "@/lib/prisma";
import { RoleTemplates, PredefinedRole, formatPermissionKey } from "./types";

/**
 * Create predefined roles for a module when it's assigned to an organization
 * Creates Admin, Editor, and Viewer roles with appropriate permissions
 * 
 * @example
 * await createPredefinedRoles({
 *   organizationModuleId: "orgmod_123",
 *   moduleSlug: "todolist",
 *   createdBy: "user_123"
 * });
 */
export async function createPredefinedRoles(input: {
  organizationModuleId: string;
  moduleSlug: string;
  createdBy: string;
}): Promise<{
  success: boolean;
  roles?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  const { organizationModuleId, moduleSlug, createdBy } = input;

  try {
    // Get the module with its permissions
    const module = await prisma.module.findUnique({
      where: { slug: moduleSlug },
      include: {
        modulePermissions: true,
      },
    });

    if (!module) {
      return { success: false, error: "Module not found" };
    }

    const createdRoles = [];

    // Create each predefined role
    for (const [roleKey, roleTemplate] of Object.entries(RoleTemplates)) {
      // Create the custom role
      const customRole = await prisma.customRole.create({
        data: {
          organizationModuleId,
          name: roleTemplate.name,
          description: roleTemplate.description,
          isPredefined: true,
          isActive: true,
        },
      });

      // Map permission keys to module permission IDs
      const permissionIds = module.modulePermissions
        .filter((mp) => {
          const permKey = formatPermissionKey(mp.resource, mp.action);
          return (roleTemplate.permissions as readonly string[]).includes(permKey);
        })
        .map((mp) => mp.id);

      // Create role permissions (link custom role to module permissions)
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          customRoleId: customRole.id,
          modulePermissionId: permissionId,
          granted: true,
        })),
      });

      createdRoles.push({
        id: customRole.id,
        name: customRole.name,
      });
    }

    return {
      success: true,
      roles: createdRoles,
    };
  } catch (error) {
    console.error("Error creating predefined roles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Assign a role to a member
 * 
 * @example
 * await assignRoleToMember({
 *   memberId: "member_123",
 *   customRoleId: "role_123",
 *   assignedBy: "admin_user_123"
 * });
 */
export async function assignRoleToMember(input: {
  memberId: string;
  customRoleId: string;
  assignedBy: string;
}): Promise<{ success: boolean; error?: string }> {
  const { memberId, customRoleId, assignedBy } = input;

  try {
    await prisma.memberModuleRole.create({
      data: {
        memberId,
        customRoleId,
        assignedBy,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error assigning role to member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove a role from a member
 */
export async function removeRoleFromMember(input: {
  memberId: string;
  customRoleId: string;
}): Promise<{ success: boolean; error?: string }> {
  const { memberId, customRoleId } = input;

  try {
    await prisma.memberModuleRole.deleteMany({
      where: {
        memberId,
        customRoleId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing role from member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all custom roles for an organization module
 */
export async function getCustomRoles(organizationModuleId: string) {
  return await prisma.customRole.findMany({
    where: {
      organizationModuleId,
    },
    include: {
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
      _count: {
        select: {
          memberRoles: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Create a custom role with specific permissions
 */
export async function createCustomRole(input: {
  organizationModuleId: string;
  name: string;
  description?: string;
  permissionIds: string[]; // Module permission IDs
}): Promise<{
  success: boolean;
  role?: { id: string; name: string };
  error?: string;
}> {
  const { organizationModuleId, name, description, permissionIds } = input;

  try {
    const customRole = await prisma.customRole.create({
      data: {
        organizationModuleId,
        name,
        description,
        permissions: {
          create: permissionIds.map((permissionId) => ({
            modulePermissionId: permissionId,
            granted: true,
          })),
        },
      },
    });

    return {
      success: true,
      role: {
        id: customRole.id,
        name: customRole.name,
      },
    };
  } catch (error) {
    console.error("Error creating custom role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update role permissions
 */
export async function updateRolePermissions(input: {
  customRoleId: string;
  permissionIds: string[]; // New set of module permission IDs
}): Promise<{ success: boolean; error?: string }> {
  const { customRoleId, permissionIds } = input;

  try {
    // Delete existing permissions
    await prisma.rolePermission.deleteMany({
      where: {
        customRoleId,
      },
    });

    // Create new permissions
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        customRoleId,
        modulePermissionId: permissionId,
        granted: true,
      })),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a custom role (only if no members are assigned)
 */
export async function deleteCustomRole(
  customRoleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if any members have this role
    const memberCount = await prisma.memberModuleRole.count({
      where: {
        customRoleId,
      },
    });

    if (memberCount > 0) {
      return {
        success: false,
        error: `Cannot delete role: ${memberCount} member(s) are assigned to this role`,
      };
    }

    // Delete the role (permissions will be cascade deleted)
    await prisma.customRole.delete({
      where: {
        id: customRoleId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting custom role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
