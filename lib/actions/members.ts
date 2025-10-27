"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkMemberPermission } from "@/lib/members";

/**
 * Member Management Actions
 *
 * Server actions for adding, removing, and updating organization members.
 * All actions include proper authorization checks.
 */

/**
 * Remove a member from an organization
 *
 * @param memberId - Member ID to remove
 * @param organizationId - Organization ID
 * @returns Success status and message
 */
export async function removeMemberAction(
  memberId: string,
  organizationId: string
) {
  try {
    // Get current session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the member to be removed
    const memberToRemove = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        organization: {
          select: {
            id: true,
            members: {
              where: { role: "owner" },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!memberToRemove) {
      return { success: false, error: "Member not found" };
    }

    // Verify the member belongs to the specified organization
    if (memberToRemove.organizationId !== organizationId) {
      return {
        success: false,
        error: "Member does not belong to this organization",
      };
    }

    // Check permissions
    const permission = await checkMemberPermission(
      session.user.id,
      organizationId
    );

    if (!permission.canEdit) {
      return {
        success: false,
        error: "You don't have permission to remove members",
      };
    }

    // Prevent removing yourself
    if (memberToRemove.userId === session.user.id) {
      return {
        success: false,
        error: "You cannot remove yourself from the organization",
      };
    }

    // Prevent removing the last owner
    if (
      memberToRemove.role === "owner" &&
      memberToRemove.organization.members.length <= 1
    ) {
      return {
        success: false,
        error: "Cannot remove the last owner of the organization",
      };
    }

    // Use Better Auth API to remove member
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: memberId,
        organizationId,
      },
      headers: await headers(),
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/organizations/${organizationId}`);
    revalidatePath(`/org/[slug]/members`, "page");

    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

/**
 * Update a member's role in an organization
 *
 * @param memberId - Member ID to update
 * @param organizationId - Organization ID
 * @param newRole - New role to assign
 * @returns Success status and message
 */
export async function updateMemberRoleAction(
  memberId: string,
  organizationId: string,
  newRole: "admin" | "member"
) {
  try {
    // Validate role (owner role cannot be assigned, only set at org creation)
    const validRoles = ["admin", "member"] as const;
    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        error:
          "Invalid role. Owner role cannot be assigned through member management.",
      };
    }

    // Get current session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the member to be updated
    const memberToUpdate = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        organization: {
          select: {
            id: true,
            members: {
              where: { role: "owner" },
              select: { id: true, role: true },
            },
          },
        },
      },
    });

    if (!memberToUpdate) {
      return { success: false, error: "Member not found" };
    }

    // Verify the member belongs to the specified organization
    if (memberToUpdate.organizationId !== organizationId) {
      return {
        success: false,
        error: "Member does not belong to this organization",
      };
    }

    // Check permissions
    const permission = await checkMemberPermission(
      session.user.id,
      organizationId
    );

    if (!permission.canEdit) {
      return {
        success: false,
        error: "You don't have permission to update member roles",
      };
    }

    // Prevent updating your own role
    if (
      memberToUpdate.userId === session.user.id &&
      !permission.isGlobalAdmin
    ) {
      return { success: false, error: "You cannot change your own role" };
    }

    // Prevent changing an owner's role (owners cannot be demoted through member management)
    if (memberToUpdate.role === "owner") {
      return {
        success: false,
        error: "Cannot change the role of an owner through member management",
      };
    }

    // Use Better Auth API to update member role
    await auth.api.updateMemberRole({
      body: {
        memberId,
        role: newRole,
        organizationId,
      },
      headers: await headers(),
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/organizations/${organizationId}`);
    revalidatePath(`/org/[slug]/members`, "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating member role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

/**
 * Invite a member to an organization
 *
 * @param email - Email of the user to invite
 * @param organizationId - Organization ID
 * @param role - Role to assign
 * @returns Success status and message
 */
export async function inviteMemberAction(
  email: string,
  organizationId: string,
  role: "admin" | "member" = "member"
) {
  try {
    // Validate role (owner cannot be invited, only set at org creation)
    const validRoles = ["admin", "member"] as const;
    if (!validRoles.includes(role)) {
      return { success: false, error: "Invalid role." };
    }

    // Get current session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check permissions
    const permission = await checkMemberPermission(
      session.user.id,
      organizationId
    );

    if (!permission.canEdit) {
      return {
        success: false,
        error: "You don't have permission to invite members",
      };
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this organization",
      };
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId,
        email,
        status: "pending",
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email",
      };
    }

    // Use Better Auth API to create invitation
    await auth.api.createInvitation({
      body: {
        email,
        organizationId,
        role,
      },
      headers: await headers(),
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/organizations/${organizationId}`);
    revalidatePath(`/org/[slug]/members`, "page");

    return { success: true };
  } catch (error) {
    console.error("Error inviting member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite member",
    };
  }
}

/**
 * Add a member directly to an organization (without invitation)
 *
 * @param email - Email of the user to add (must be existing user)
 * @param organizationId - Organization ID
 * @param role - Role to assign
 * @returns Success status and message
 */
export async function addMemberDirectlyAction(
  email: string,
  organizationId: string,
  role: "admin" | "member" = "member"
) {
  try {
    // Validate role (owner cannot be added, only set at org creation)
    const validRoles = ["admin", "member"] as const;
    if (!validRoles.includes(role)) {
      return { success: false, error: "Invalid role." };
    }

    // Get current session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check permissions
    const permission = await checkMemberPermission(
      session.user.id,
      organizationId
    );

    if (!permission.canEdit) {
      return {
        success: false,
        error: "You don't have permission to add members",
      };
    }

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!userToAdd) {
      return {
        success: false,
        error: "User not found. They need to create an account first.",
      };
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: userToAdd.id,
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this organization",
      };
    }

    // Use Better Auth API to add member directly
    await auth.api.addMember({
      body: {
        userId: userToAdd.id,
        organizationId,
        role,
      },
      headers: await headers(),
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/organizations/${organizationId}`);
    revalidatePath(`/org/[slug]/members`, "page");

    return { success: true, memberName: userToAdd.name };
  } catch (error) {
    console.error("Error adding member directly:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add member",
    };
  }
}
