import { PageHeader } from "@/components/page-header";
import { OrganizationForm } from "../../_components";
import { getOrganization } from "../../_lib/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Organization | Admin Portal",
  description: "Update organization details",
};

interface EditOrganizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditOrganizationPage({
  params,
}: EditOrganizationPageProps) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch the organization data
  const organization = await getOrganization(id);

  // If organization not found, show 404
  if (!organization) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Organization"
        description="Update organization details and settings"
      />
      <div className="mx-auto max-w-2xl">
        <OrganizationForm
          mode="edit"
          organizationId={organization.id}
          initialData={{
            name: organization.name,
            slug: organization.slug,
          }}
          onCancelPath={`/admin/organizations/${organization.id}`}
        />
      </div>
    </div>
  );
}
