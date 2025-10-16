"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";

/**
 * Organization Data Fetching Functions
 *
 * Centralized queries for fetching organization data.
 * These are server-only functions used in Server Components.
 */

/**
 * Get all organizations
 *
 * @returns Array of organizations or empty array on error
 */
export async function getOrganizations() {
  const [organizations, error] = await tryCatch(
    auth.api.listOrganizations({
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }

  return organizations || [];
}

/**
 * Get a single organization by ID
 *
 * @param id - Organization ID
 * @returns Organization data or null on error
 */
export async function getOrganization(id: string) {
  // TODO: Implement when Better Auth provides getOrganizationById
  // Currently Better Auth only has getFullOrganization by slug
  // May need to use Prisma directly

  return null;
}

/**
 * Get full organization details including members
 *
 * @param slug - Organization slug
 * @returns Full organization data with members or null on error
 */
export async function getFullOrganization(slug: string) {
  const [organization, error] = await tryCatch(
    auth.api.getFullOrganization({
      query: { organizationSlug: slug },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error fetching full organization:", error);
    return null;
  }

  return organization;
}
