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
 *
 * @todo Implement when edit functionality is ready
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

  // TODO: Implement update logic with Better Auth
  // Currently Better Auth doesn't expose direct organization update
  // May need to use Prisma directly or wait for Better Auth API update

  return {
    success: false,
    error: "Update functionality not yet implemented",
  };
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
