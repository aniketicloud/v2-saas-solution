import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getOrganizationWithDetails } from "../../_lib/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DeleteOrganizationForm } from "./_components/delete-organization-form";

export const metadata: Metadata = {
  title: "Delete Organization | Admin Portal",
  description: "Delete an organization and all associated data",
};

interface DeleteOrganizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeleteOrganizationPage({
  params,
}: DeleteOrganizationPageProps) {
  const { id } = await params;

  // Fetch organization data with details
  const organization = await getOrganizationWithDetails(id);

  // If not found, show 404
  if (!organization) {
    notFound();
  }

  // Calculate stats for display
  const memberCount = organization.members?.length || 0;
  const teamCount = organization.teams?.length || 0;
  const invitationCount = organization.invitations?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delete Organization"
        description="Permanently delete this organization and all associated data"
        action={
          <Button variant="outline" asChild>
            <Link href={`/admin/organizations/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Link>
          </Button>
        }
      />

      <Card className="p-6">
        <DeleteOrganizationForm
          organization={{
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            memberCount,
            teamCount,
            invitationCount,
            createdAt: organization.createdAt,
          }}
        />
      </Card>
    </div>
  );
}
