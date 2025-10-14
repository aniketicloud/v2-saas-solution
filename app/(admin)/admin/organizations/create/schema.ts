import { z } from "zod";

/**
 * Shared validation schema for organization creation
 * 
 * This schema is used on both client and server to ensure consistent validation.
 * 
 * Security Note: Never trust client-side validation alone. Always validate on the server.
 * 
 * @see ./CREATE_ORGANIZATION_GUIDE.md for implementation details
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
 * TypeScript type inferred from the schema
 */
export type OrganizationFormData = z.infer<typeof organizationSchema>;
