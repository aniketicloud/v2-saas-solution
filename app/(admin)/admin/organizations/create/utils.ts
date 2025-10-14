/**
 * Utility functions for organization creation
 */

/**
 * Generates a URL-friendly slug from an organization name
 * 
 * @param name - The organization name to convert to a slug
 * @returns A lowercase slug with hyphens, suitable for URLs
 * 
 * @example
 * generateSlug("My Organization") // "my-organization"
 * generateSlug("Test & Company!") // "test-company"
 * generateSlug("---Start---") // "start"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "");      // Remove leading/trailing hyphens
}
