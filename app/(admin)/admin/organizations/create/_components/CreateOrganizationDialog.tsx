"use client";

/**
 * CreateOrganizationDialog Component
 *
 * A dialog for creating new organizations with:
 * - React Hook Form + Zod v4 validation
 * - Auto-generated slugs from organization name
 * - Real-time input sanitization (no leading/trailing spaces)
 * - Field components (shadcn/ui recommended pattern)
 * - Inline validation error messages
 * - Toast notifications for feedback
 *
 * 📖 See CREATE_ORGANIZATION_GUIDE.md in this directory for:
 *    - Complete implementation details
 *    - Validation rules and customization
 *    - Testing checklist
 *    - Troubleshooting tips
 *    - Future enhancement ideas
 *
 * @see ./CREATE_ORGANIZATION_GUIDE.md
 */

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

/**
 * CreateOrganizationDialog Component (Simplified)
 *
 * Now acts as a navigation button to the dedicated create page.
 * This provides a shareable URL while maintaining the same UI/UX.
 *
 * Route: /admin/organizations/create
 */

export function CreateOrganizationDialog() {
  return (
    <Button asChild>
      <Link href="/admin/organizations/create">
        <Plus className="mr-2 h-4 w-4" />
        Add Organization
      </Link>
    </Button>
  );
}
