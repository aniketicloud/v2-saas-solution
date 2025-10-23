"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { organizationSchema } from "./schema";
import { tryCatch } from "@/utils/try-catch";

/**
 * Organization Server Actions
 *
 * Centralized server actions for organization CRUD operations.
 * All actions include server-side validation and proper error handling.
 */

/**
 * Create a new organization
 *
 * @param name - Organization name
 * @param slug - URL-friendly slug
 * @returns Success status with data or error message
 */
export async function createOrganization(name: string, slug: string) {
  // Server-side validation - CRITICAL for security
  const validationResult = organizationSchema.safeParse({ name, slug });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message, // Return only the first error message
    };
  }

  const [data, error] = await tryCatch(
    auth.api.createOrganization({
      body: {
        name: validationResult.data.name,
        slug: validationResult.data.slug,
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

  return { success: true, data };
}

/**
 * Update an existing organization
 *
 * @param id - Organization ID
 * @param name - Updated organization name
 * @param slug - Updated URL-friendly slug
 * @returns Success status with data or error message
 */
export async function updateOrganization(
  id: string,
  name: string,
  slug: string
) {
  // Server-side validation
  const validationResult = organizationSchema.safeParse({ name, slug });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message, // Return only the first error message
    };
  }

  // Better Auth doesn't expose direct organization update API
  // Use Prisma directly (common pattern for custom operations)
  const { prisma } = await import("@/lib/prisma");

  // Get current organization slug
  const [currentOrg, fetchError] = await tryCatch(
    prisma.organization.findUnique({
      where: { id },
      select: { slug: true },
    })
  );

  if (fetchError) {
    console.error("Error fetching organization:", fetchError);
    return {
      success: false,
      error: "Failed to fetch organization details",
    };
  }

  if (!currentOrg) {
    return {
      success: false,
      error: "Organization not found",
    };
  }

  // Check if slug is already taken by another organization
  if (validationResult.data.slug !== currentOrg.slug) {
    const [checkData, checkError] = await tryCatch(
      auth.api.checkOrganizationSlug({
        body: { slug: validationResult.data.slug },
        headers: await headers(),
      })
    );

    if (checkError) {
      console.error("Error checking slug availability:", checkError);
      return { success: false, error: "Failed to validate organization slug" };
    }

    if (!checkData.status) {
      return {
        success: false,
        error: "An organization with this slug already exists",
      };
    }
  }

  // Update the organization
  const [updatedOrg, updateError] = await tryCatch(
    prisma.organization.update({
      where: { id },
      data: {
        name: validationResult.data.name,
        slug: validationResult.data.slug,
      },
    })
  );

  if (updateError) {
    console.error("Error updating organization:", updateError);
    return {
      success: false,
      error: updateError.message || "Failed to update organization",
    };
  }

  return { success: true, data: updatedOrg };
}

/**
 * Delete an organization
 *
 * Permanently removes an organization and all associated data including:
 * - Organization members
 * - Teams
 * - Invitations
 * - Organization metadata
 *
 * @param id - Organization ID
 * @returns Success status with organization data or error message
 *
 * @security Admin-only operation (enforced by layout)
 *
 * THINGS TO IMPROVE (Future Implementation):
 * - TODO: Implement soft delete with grace period (30 days before permanent deletion)
 * - TODO: Send email notifications to all affected members
 * - TODO: Add audit trail logging for compliance
 * - TODO: Allow data export before deletion
 * - TODO: Check for active subscriptions/billing before allowing deletion
 * - TODO: Add option to transfer ownership instead of deleting
 * - TODO: Archive organization data for legal/compliance requirements
 */
export async function deleteOrganization(id: string) {
  // Validate organization ID
  if (!id || typeof id !== "string") {
    return {
      success: false,
      error: "Invalid organization ID",
    };
  }

  // Get organization details before deletion (for success message)
  // Using Prisma directly with _count to get accurate counts without fetching all members
  // This is more efficient than getFullOrganization which may have a membersLimit
  const { prisma } = await import("@/lib/prisma");
  const [organization, fetchError] = await tryCatch(
    prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            members: true,
            teams: true,
            invitations: true,
          },
        },
      },
    })
  );

  if (fetchError) {
    console.error("Error fetching organization before deletion:", fetchError);
    return {
      success: false,
      error: "Failed to fetch organization details",
    };
  }

  if (!organization) {
    return {
      success: false,
      error: "Organization not found",
    };
  }

  // Delete organization using Better Auth API
  // This automatically handles cascading deletes for members, invitations, etc.
  const [data, error] = await tryCatch(
    auth.api.deleteOrganization({
      body: {
        organizationId: id,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error deleting organization:", error);
    return {
      success: false,
      error: error.message || "Failed to delete organization",
    };
  }

  // Return success with organization details for toast message
  return {
    success: true,
    data: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      deletedCounts: {
        members: organization._count.members,
        teams: organization._count.teams,
        invitations: organization._count.invitations,
      },
    },
  };
}
