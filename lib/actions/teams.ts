"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, "Office name is required").max(100),
  organizationId: z.string(),
});

const updateTeamSchema = z.object({
  teamId: z.string(),
  name: z.string().min(1, "Office name is required").max(100),
  organizationId: z.string(),
});

const deleteTeamSchema = z.object({
  teamId: z.string(),
  organizationId: z.string(),
});

const addTeamMemberSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
  organizationId: z.string(),
});

const removeTeamMemberSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
  organizationId: z.string(),
});

// Helper to check if user can create/delete offices (global admin only)
async function canCreateOrDeleteTeam(): Promise<{
  allowed: boolean;
  userId: string | null;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { allowed: false, userId: null };
  }

  // Only global admin users can create/delete offices
  return {
    allowed: session.user.role === "admin",
    userId: session.user.id,
  };
}

// Helper to check if user can update/manage offices (global admin or org admin/owner)
async function canManageTeam(organizationId: string): Promise<{
  allowed: boolean;
  userId: string | null;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { allowed: false, userId: null };
  }

  // Global admins can manage
  if (session.user.role === "admin") {
    return { allowed: true, userId: session.user.id };
  }

  // Check if user is org admin or owner
  const member = await prisma.member.findFirst({
    where: {
      organizationId,
      userId: session.user.id,
    },
  });

  const allowed = member?.role === "admin" || member?.role === "owner";
  return { allowed, userId: session.user.id };
}

// Get all teams for an organization
export async function getOrganizationTeams(organizationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is a member of the organization
    const member = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!member && session.user.role !== "admin") {
      return { success: false, error: "Not a member of this organization" };
    }

    const teams = await prisma.team.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { teammembers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: teams };
  } catch (error) {
    console.error("Error fetching teams:", error);
    return { success: false, error: "Failed to fetch teams" };
  }
}

// Get a single team with its members
export async function getTeam(teamId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        organization: true,
        teammembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    // Check if user is a member of the organization
    const member = await prisma.member.findFirst({
      where: {
        organizationId: team.organizationId,
        userId: session.user.id,
      },
    });

    if (!member && session.user.role !== "admin") {
      return { success: false, error: "Not a member of this organization" };
    }

    return { success: true, data: team };
  } catch (error) {
    console.error("Error fetching team:", error);
    return { success: false, error: "Failed to fetch team" };
  }
}

// Create a new team (global admin only)
export async function createTeam(input: z.infer<typeof createTeamSchema>) {
  try {
    const validated = createTeamSchema.parse(input);
    const { name, organizationId } = validated;

    // Check permission - only global admin can create
    const permission = await canCreateOrDeleteTeam();
    if (!permission.allowed) {
      return {
        success: false,
        error: "Only admin users can create offices",
      };
    }

    // Use Better Auth's API to create team
    const team = await auth.api.createTeam({
      body: {
        name,
        organizationId,
      },
      headers: await headers(),
    });

    revalidatePath(`/org/[slug]/teams`, "page");
    return { success: true, data: team };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error creating team:", error);
    // Extract error message if it's from Better Auth hooks
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create office";
    return { success: false, error: errorMessage };
  }
}

// Update a team (global admin and org admin/owner)
export async function updateTeam(input: z.infer<typeof updateTeamSchema>) {
  try {
    const validated = updateTeamSchema.parse(input);
    const { teamId, name, organizationId } = validated;

    // Check permission - global admin or org admin/owner can update
    const permission = await canManageTeam(organizationId);
    if (!permission.allowed) {
      return {
        success: false,
        error: "Only admin users and organization admins can update offices",
      };
    }

    // Verify team belongs to organization
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam || existingTeam.organizationId !== organizationId) {
      return { success: false, error: "Office not found" };
    }

    // Use Better Auth's API to update team
    const team = await auth.api.updateTeam({
      body: {
        teamId,
        data: {
          name,
        },
      },
      headers: await headers(),
    });

    revalidatePath(`/org/[slug]/teams`, "page");
    revalidatePath(`/org/[slug]/teams/[teamId]`, "page");
    return { success: true, data: team };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error updating team:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update office";
    return { success: false, error: errorMessage };
  }
}

// Delete a team (global admin only)
export async function deleteTeam(input: z.infer<typeof deleteTeamSchema>) {
  try {
    const validated = deleteTeamSchema.parse(input);
    const { teamId, organizationId } = validated;

    // Check permission - only global admin can delete
    const permission = await canCreateOrDeleteTeam();
    if (!permission.allowed) {
      return {
        success: false,
        error: "Only admin users can delete offices",
      };
    }

    // Verify team belongs to organization
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam || existingTeam.organizationId !== organizationId) {
      return { success: false, error: "Office not found" };
    }

    // Use Better Auth's API to delete team
    await auth.api.removeTeam({
      body: {
        teamId,
      },
      headers: await headers(),
    });

    revalidatePath(`/org/[slug]/teams`, "page");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error deleting team:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete office";
    return { success: false, error: errorMessage };
  }
}

// Add a member to a team (global admin and org admin/owner)
export async function addTeamMember(
  input: z.infer<typeof addTeamMemberSchema>
) {
  try {
    const validated = addTeamMemberSchema.parse(input);
    const { teamId, userId, organizationId } = validated;

    // Check permission - global admin or org admin/owner can manage
    const permission = await canManageTeam(organizationId);
    if (!permission.allowed) {
      return {
        success: false,
        error: "Only admin users and organization admins can add office members",
      };
    }

    // Verify team belongs to organization
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.organizationId !== organizationId) {
      return { success: false, error: "Office not found" };
    }

    // Verify user is a member of the organization
    const orgMember = await prisma.member.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (!orgMember) {
      return {
        success: false,
        error: "User is not a member of this organization",
      };
    }

    // Check if already a team member
    const existingTeamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (existingTeamMember) {
      return {
        success: false,
        error: "User is already a member of this office",
      };
    }

    // Use Better Auth's API to add team member
    const teamMember = await auth.api.addTeamMember({
      body: {
        teamId,
        userId,
      },
      headers: await headers(),
    });

    revalidatePath(`/org/[slug]/teams/[teamId]`, "page");
    revalidatePath(`/org/[slug]/teams/[teamId]/members`, "page");
    return { success: true, data: teamMember };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error adding team member:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add office member";
    return { success: false, error: errorMessage };
  }
}

// Remove a member from a team (global admin and org admin/owner)
export async function removeTeamMember(
  input: z.infer<typeof removeTeamMemberSchema>
) {
  try {
    const validated = removeTeamMemberSchema.parse(input);
    const { teamId, userId, organizationId } = validated;

    // Check permission - global admin or org admin/owner can manage
    const permission = await canManageTeam(organizationId);
    if (!permission.allowed) {
      return {
        success: false,
        error:
          "Only admin users and organization admins can remove office members",
      };
    }

    // Verify team belongs to organization
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.organizationId !== organizationId) {
      return { success: false, error: "Office not found" };
    }

    // Find team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!teamMember) {
      return { success: false, error: "User is not a member of this office" };
    }

    // Use Better Auth's API to remove team member
    await auth.api.removeTeamMember({
      body: {
        teamId,
        userId,
      },
      headers: await headers(),
    });

    revalidatePath(`/org/[slug]/teams/[teamId]`, "page");
    revalidatePath(`/org/[slug]/teams/[teamId]/members`, "page");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error removing team member:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to remove office member";
    return { success: false, error: errorMessage };
  }
}

// Get available organization members to add to a team
export async function getAvailableTeamMembers(
  teamId: string,
  organizationId: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all organization members
    const orgMembers = await prisma.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Get current team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true },
    });

    const teamMemberIds = new Set(teamMembers.map((tm) => tm.userId));

    // Filter out users already in the team
    const availableMembers = orgMembers
      .filter((member) => !teamMemberIds.has(member.userId))
      .map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: member.role,
      }));

    return { success: true, data: availableMembers };
  } catch (error) {
    console.error("Error fetching available members:", error);
    return { success: false, error: "Failed to fetch available members" };
  }
}
