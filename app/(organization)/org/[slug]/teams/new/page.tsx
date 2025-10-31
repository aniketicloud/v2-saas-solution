import { PageHeader } from "@/components/page-header";
import { TeamForm } from "@/components/team-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Office | Organization",
  description: "Create a new office",
};

interface NewTeamPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NewTeamPage({ params }: NewTeamPageProps) {
  const { slug } = await params;

  // Get session for current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get organization
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: slug },
    headers: await headers(),
  });

  if (!organization || !session?.user) {
    redirect("/no-organization");
  }

  // Only global admin can create teams
  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Office"
        description="Create a new office within your organization"
      />

      <TeamForm
        organizationId={organization.id}
        organizationSlug={slug}
        mode="create"
      />
    </div>
  );
}
