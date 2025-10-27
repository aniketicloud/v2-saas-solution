"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";

/**
 * Member Management Functions
 *
 * Provides centralized functions for managing organization members with proper
 * authorization checks. Supports both admin (global access) and organization-level
 * permissions.
 */

/**
 * Check if a user has permission to manage members of an organization
 *
 * @param userId - User ID to check
 * @param organizationId - Organization ID
 * @returns Object with permission status and role
 */
export async function checkMemberPermission(
  userId: string,
  organizationId: string
) {
  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Global admins can manage any organization
  if (user?.role === "admin") {
    return {
      canManage: true,
      canEdit: true,
      role: "admin",
      isGlobalAdmin: true,
    };
  }

  // Check organization membership
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
    select: { role: true },
  });

  if (!member) {
    return {
      canManage: false,
      canEdit: false,
      role: null,
      isGlobalAdmin: false,
    };
  }

  // Organization admins can manage members
  const canEdit = member.role === "admin";
  const canManage = member.role === "admin" || member.role === "member";

  return {
    canManage, // Can view members
    canEdit, // Can add/remove/update members
    role: member.role,
    isGlobalAdmin: false,
  };
}

/**
 * Get members of an organization with authorization check
 *
 * @param organizationId - Organization ID
 * @returns Array of members with user details or null if unauthorized
 */
export async function getOrganizationMembers(organizationId: string) {
  // Get current session
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  // Check permissions
  const permission = await checkMemberPermission(
    session.user.id,
    organizationId
  );

  if (!permission.canManage) {
    return null;
  }

  // Fetch members
  const [members, error] = await tryCatch(
    prisma.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // Admins first
        { createdAt: "asc" },
      ],
    })
  );

  if (error) {
    console.error("Error fetching members:", error);
    return null;
  }

  return {
    members: members || [],
    permission,
  };
}

/**
 * Get member details by member ID with authorization check
 *
 * @param memberId - Member ID
 * @returns Member details or null if not found/unauthorized
 */
export async function getMemberById(memberId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  const [member, error] = await tryCatch(
    prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
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
    })
  );

  if (error || !member) {
    return null;
  }

  // Check if user has permission to view this member
  const permission = await checkMemberPermission(
    session.user.id,
    member.organizationId
  );

  if (!permission.canManage) {
    return null;
  }

  return {
    member,
    permission,
  };
}

/**
 * Get members for admin view (global access)
 * Only accessible by global admins
 *
 * @param organizationId - Organization ID
 * @returns Array of members or null if unauthorized
 */
export async function getOrganizationMembersForAdmin(organizationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  const [members, error] = await tryCatch(
    prisma.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            role: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    })
  );

  if (error) {
    console.error("Error fetching members for admin:", error);
    return null;
  }

  return members || [];
}
