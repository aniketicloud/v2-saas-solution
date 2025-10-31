import { AddTeamMembersClient } from "./add-members-client";
import { getTeam, getAvailableTeamMembers } from "@/lib/actions/teams";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Office Members | Organization",
  description: "Add members to office",
};

interface AddTeamMembersPageProps {
  params: Promise<{
    slug: string;
    teamId: string;
  }>;
}

export default async function AddTeamMembersPage({
  params,
}: AddTeamMembersPageProps) {
  const { slug, teamId } = await params;

  // Get session for current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch team
  const teamResult = await getTeam(teamId);

  if (!teamResult.success || !teamResult.data) {
    redirect(`/org/${slug}/teams`);
  }

  const team = teamResult.data;

  // Verify team belongs to this organization
  if (team.organization.slug !== slug) {
    redirect(`/org/${slug}/teams`);
  }

  // Check permission - only global admin or org admin/owner can add members
  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  const canManage =
    session.user.role === "admin" ||
    member?.role === "owner" ||
    member?.role === "admin";

  if (!canManage) {
    redirect("/unauthorized");
  }

  // Fetch available members
  const membersResult = await getAvailableTeamMembers(
    teamId,
    team.organizationId
  );

  if (!membersResult.success) {
    redirect(`/org/${slug}/teams/${teamId}/members`);
  }

  const availableMembers = membersResult.data || [];

  return (
    <AddTeamMembersClient
      teamId={teamId}
      teamName={team.name}
      organizationId={team.organizationId}
      organizationSlug={slug}
      availableMembers={availableMembers}
    />
  );
}
