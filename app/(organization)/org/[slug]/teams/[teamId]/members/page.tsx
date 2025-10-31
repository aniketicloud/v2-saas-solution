import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamMembersList } from "@/components/team-members-list";
import { UserPlus } from "lucide-react";
import { getTeam } from "@/lib/actions/teams";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Office Members | Organization",
  description: "Manage office members",
};

interface TeamMembersPageProps {
  params: Promise<{
    slug: string;
    teamId: string;
  }>;
}

export default async function TeamMembersPage({
  params,
}: TeamMembersPageProps) {
  const { slug, teamId } = await params;

  // Get session for current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch team with members
  const result = await getTeam(teamId);

  if (!result.success || !result.data) {
    redirect(`/org/${slug}/teams`);
  }

  const team = result.data;

  // Verify team belongs to this organization
  if (team.organization.slug !== slug) {
    redirect(`/org/${slug}/teams`);
  }

  // Check if user can manage (global admin or org admin/owner)
  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  const canManage =
    session.user.role === "admin" ||
    member?.role === "owner" ||
    member?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${team.name} - Members`}
        description="Manage members of this office"
        action={
          canManage ? (
            <Link href={`/org/${slug}/teams/${teamId}/members/add`}>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            </Link>
          ) : null
        }
      />

      <Card>
        <CardContent className="p-6">
          <TeamMembersList
            teamId={teamId}
            organizationId={team.organizationId}
            members={team.teammembers}
            canEdit={canManage}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
