import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TeamsTable } from "@/components/teams-table";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { getOrganizationTeams } from "@/lib/actions/teams";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offices | Organization",
  description: "Manage organization offices",
};

interface OrganizationTeamsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrganizationTeamsPage({
  params,
}: OrganizationTeamsPageProps) {
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

  // Fetch teams
  const result = await getOrganizationTeams(organization.id);

  if (!result.success) {
    redirect("/unauthorized");
  }

  const teams = result.data || [];

  // Check permissions
  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  // Only global admin can create/delete offices
  const canCreateDelete = session.user.role === "admin";
  
  // Global admin and org admin/owner can manage offices
  const canManage =
    session.user.role === "admin" ||
    member?.role === "owner" ||
    member?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offices"
        description={`Manage offices within ${organization.name}`}
        action={
          canCreateDelete ? (
            <Link href={`/org/${slug}/teams/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Office
              </Button>
            </Link>
          ) : null
        }
      />

      <Card>
        <CardContent className="p-6">
          {teams.length > 0 ? (
            <TeamsTable
              teams={teams}
              organizationSlug={slug}
              organizationId={organization.id}
              canEdit={canManage}
              canDelete={canCreateDelete}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No offices yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first office to organize your team members.
              </p>
              {canCreateDelete && (
                <Link href={`/org/${slug}/teams/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Office
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
