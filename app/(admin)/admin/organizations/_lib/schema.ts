import { z } from "zod";

/**
 * Organization Validation Schemas
 *
 * Centralized Zod schemas for organization-related operations.
 * Used on both client and server for consistent validation.
 *
 * Security Note: Always validate on the server - client validation can be bypassed.
 */

/**
 * Schema for creating and updating organizations
 */
export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Organization name cannot be only whitespace",
    }),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

/**
 * TypeScript types inferred from schemas
 */
export type OrganizationFormData = z.infer<typeof organizationSchema>;
