import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

/**
 * CreateOrganizationButton Component
 *
 * Navigation button to the organization creation page.
 * Uses shareable URL: /admin/organizations/new
 */
export function CreateOrganizationButton() {
  return (
    <Button asChild>
      <Link href="/admin/organizations/new">
        <Plus className="mr-2 h-4 w-4" />
        Create Organization
      </Link>
    </Button>
  );
}
