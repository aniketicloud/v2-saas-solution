import { PageHeader } from "@/components/page-header";
import {
  OrganizationsEmpty,
  OrganizationCard,
  CreateOrganizationButton,
} from "./_components";
import { getOrganizations } from "./_lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizations | Admin Portal",
  description: "Manage all organizations in your platform",
};

export default async function AdminOrganizationsPage() {
  // Layout already validates admin role, no need to check again
  const organizations = await getOrganizations();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Manage all organizations and their members"
        action={<CreateOrganizationButton />}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {organizations.length === 0 ? (
          <OrganizationsEmpty />
        ) : (
          organizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))
        )}
      </div>
    </div>
  );
}
