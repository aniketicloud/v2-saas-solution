/**
 * Permission Checker Utility
 * 
 * Core functions to check if a member has permission to perform actions on resources.
 * Implements a hierarchical permission system:
 * 
 * 1. Global Admin (User.role === "admin") - Can do anything
 * 2. Organization Owner (Member.role === "owner") - Full org access
 * 3. Organization Admin (Member.role === "admin") - Manage members & modules
 * 4. Custom Roles (MemberModuleRole) - Granular permissions
 * 5. Default Member - Basic view access
 */

import { prisma } from "@/lib/prisma";
import type { PermissionCheckInput, PermissionCheckResult } from "./types";

/**
 * Check if a member has permission for a specific action on a resource
 * 
 * @example
 * const result = await checkPermission({
 *   memberId: "member_123",
 *   organizationId: "org_123",
 *   moduleSlug: "todolist",
 *   resource: "todolist",
 *   action: "delete"
 * });
 * 
 * if (result.allowed) {
 *   // Proceed with action
 * }
 */
export async function checkPermission(
  input: PermissionCheckInput
): Promise<PermissionCheckResult> {
  const { memberId, organizationId, moduleSlug, resource, action } = input;

  try {
    // 1. Get member with user info
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!member) {
      return {
        allowed: false,
        reason: "Member not found",
      };
    }

    // 2. Check if user is global admin (can do anything)
    if (member.user.role === "admin") {
      return {
        allowed: true,
        source: "global_admin",
        reason: "Global admin has full access",
      };
    }

    // 3. Check if member is organization owner (full org access)
    if (member.role === "owner") {
      return {
        allowed: true,
        source: "org_owner",
        reason: "Organization owner has full access",
      };
    }

    // 4. Check if member is organization admin (manage members & modules)
    if (member.role === "admin") {
      return {
        allowed: true,
        source: "org_admin",
        reason: "Organization admin has full module access",
      };
    }

    // 5. Check custom role permissions
    const hasCustomPermission = await checkCustomRolePermission({
      memberId,
      organizationId,
      moduleSlug,
      resource,
      action,
    });

    if (hasCustomPermission) {
      return {
        allowed: true,
        source: "custom_role",
        reason: "Permission granted via custom role",
      };
    }

    // 6. Default: No permission
    return {
      allowed: false,
      source: "default",
      reason: "No permission found for this action",
    };
  } catch (error) {
    console.error("Error checking permission:", error);
    return {
      allowed: false,
      reason: "Error checking permission",
    };
  }
}

/**
 * Check if member has permission via custom roles
 * Looks up MemberModuleRole → CustomRole → RolePermission → ModulePermission
 */
async function checkCustomRolePermission(input: PermissionCheckInput): Promise<boolean> {
  const { memberId, organizationId, moduleSlug, resource, action } = input;

  try {
    // Get the organization module
    const orgModule = await prisma.organizationModule.findFirst({
      where: {
        organizationId,
        module: {
          slug: moduleSlug,
        },
        isEnabled: true,
      },
      select: {
        id: true,
      },
    });

    if (!orgModule) {
      return false;
    }

    // Check if member has any custom roles with this permission
    const memberRoles = await prisma.memberModuleRole.findMany({
      where: {
        memberId,
      },
      include: {
        customRole: {
          include: {
            organizationModule: {
              select: {
                id: true,
                moduleId: true,
              },
            },
            permissions: {
              include: {
                modulePermission: {
                  select: {
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Check if any role grants this permission
    for (const memberRole of memberRoles) {
      // Ensure role belongs to the correct organization module
      if (memberRole.customRole.organizationModule.id !== orgModule.id) {
        continue;
      }

      // Check if role has the permission
      const hasPermission = memberRole.customRole.permissions.some(
        (rolePermission) =>
          rolePermission.granted &&
          rolePermission.modulePermission.resource === resource &&
          rolePermission.modulePermission.action === action
      );

      if (hasPermission) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking custom role permission:", error);
    return false;
  }
}

/**
 * Check multiple permissions at once
 * Useful for checking a set of permissions for UI rendering
 * 
 * @example
 * const permissions = await checkPermissions({
 *   memberId: "member_123",
 *   organizationId: "org_123",
 *   moduleSlug: "todolist",
 *   permissions: [
 *     { resource: "todolist", action: "view" },
 *     { resource: "todolist", action: "create" },
 *     { resource: "todolist", action: "delete" },
 *   ]
 * });
 * 
 * // Returns: { "todolist.view": true, "todolist.create": true, "todolist.delete": false }
 */
export async function checkPermissions(input: {
  memberId: string;
  organizationId: string;
  moduleSlug: string;
  permissions: Array<{ resource: string; action: string }>;
}): Promise<Record<string, boolean>> {
  const { memberId, organizationId, moduleSlug, permissions } = input;

  const results: Record<string, boolean> = {};

  // Check all permissions in parallel
  const checks = await Promise.all(
    permissions.map((perm) =>
      checkPermission({
        memberId,
        organizationId,
        moduleSlug,
        resource: perm.resource,
        action: perm.action,
      })
    )
  );

  // Map results
  permissions.forEach((perm, index) => {
    const key = `${perm.resource}.${perm.action}`;
    results[key] = checks[index].allowed;
  });

  return results;
}

/**
 * Get all permissions for a member in a specific module
 * Returns the effective permissions combining all sources
 */
export async function getMemberPermissions(input: {
  memberId: string;
  organizationId: string;
  moduleSlug: string;
}): Promise<{
  isGlobalAdmin: boolean;
  isOrgOwner: boolean;
  isOrgAdmin: boolean;
  customRoles: Array<{
    roleId: string;
    roleName: string;
    permissions: Array<{ resource: string; action: string }>;
  }>;
  effectivePermissions: Array<{ resource: string; action: string }>;
}> {
  const { memberId, organizationId, moduleSlug } = input;

  try {
    // Get member with user info
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!member) {
      return {
        isGlobalAdmin: false,
        isOrgOwner: false,
        isOrgAdmin: false,
        customRoles: [],
        effectivePermissions: [],
      };
    }

    const isGlobalAdmin = member.user.role === "admin";
    const isOrgOwner = member.role === "owner";
    const isOrgAdmin = member.role === "admin";

    // If admin/owner, they have all permissions
    if (isGlobalAdmin || isOrgOwner || isOrgAdmin) {
      // Get all module permissions
      const allPermissions = await prisma.modulePermission.findMany({
        where: {
          module: {
            slug: moduleSlug,
          },
        },
        select: {
          resource: true,
          action: true,
        },
      });

      return {
        isGlobalAdmin,
        isOrgOwner,
        isOrgAdmin,
        customRoles: [],
        effectivePermissions: allPermissions,
      };
    }

    // Get custom roles and their permissions
    const orgModule = await prisma.organizationModule.findFirst({
      where: {
        organizationId,
        module: {
          slug: moduleSlug,
        },
        isEnabled: true,
      },
      select: {
        id: true,
      },
    });

    if (!orgModule) {
      return {
        isGlobalAdmin,
        isOrgOwner,
        isOrgAdmin,
        customRoles: [],
        effectivePermissions: [],
      };
    }

    const memberRoles = await prisma.memberModuleRole.findMany({
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
              where: {
                granted: true,
              },
              include: {
                modulePermission: {
                  select: {
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Collect unique permissions
    const permissionSet = new Set<string>();
    const customRoles = memberRoles.map((memberRole) => {
      const permissions = memberRole.customRole.permissions.map((p) => {
        const perm = p.modulePermission;
        permissionSet.add(`${perm.resource}.${perm.action}`);
        return perm;
      });

      return {
        roleId: memberRole.customRole.id,
        roleName: memberRole.customRole.name,
        permissions,
      };
    });

    // Convert set back to array of objects
    const effectivePermissions = Array.from(permissionSet).map((key) => {
      const [resource, action] = key.split(".");
      return { resource, action };
    });

    return {
      isGlobalAdmin,
      isOrgOwner,
      isOrgAdmin,
      customRoles,
      effectivePermissions,
    };
  } catch (error) {
    console.error("Error getting member permissions:", error);
    return {
      isGlobalAdmin: false,
      isOrgOwner: false,
      isOrgAdmin: false,
      customRoles: [],
      effectivePermissions: [],
    };
  }
}
