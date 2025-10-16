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
      error: validationResult.error.issues.map((e) => e.message).join(", "),
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
      error: validationResult.error.issues.map((e) => e.message).join(", "),
    };
  }

  // Better Auth doesn't expose direct organization update API
  // Use Prisma directly (common pattern for custom operations)
  const { prisma } = await import("@/lib/prisma");

  // Check if slug is already taken by another organization
  const [existingOrg, checkError] = await tryCatch(
    prisma.organization.findFirst({
      where: {
        slug: validationResult.data.slug,
        NOT: { id },
      },
    })
  );

  if (checkError) {
    console.error("Error checking slug uniqueness:", checkError);
    return {
      success: false,
      error: "Failed to validate organization slug",
    };
  }

  if (existingOrg) {
    return {
      success: false,
      error: "An organization with this slug already exists",
    };
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
 * @param id - Organization ID
 * @returns Success status or error message
 *
 * @todo Implement when delete functionality is ready
 */
export async function deleteOrganization(id: string) {
  // TODO: Implement delete logic
  // Consider soft delete vs hard delete
  // Need to handle cascading deletes (members, invitations, etc.)

  return {
    success: false,
    error: "Delete functionality not yet implemented",
  };
}
