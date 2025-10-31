import { PageHeader } from "@/components/page-header";
import { TeamForm } from "@/components/team-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import { getTeam } from "@/lib/actions/teams";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Office Details | Organization",
  description: "Manage office details",
};

interface TeamDetailPageProps {
  params: Promise<{
    slug: string;
    teamId: string;
  }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { slug, teamId } = await params;

  // Get session for current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch team
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
        title={team.name}
        description="View and manage office details"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Office Information</CardTitle>
            <CardDescription>Basic details about this office</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Office Name</p>
              <p className="font-medium">{team.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="font-medium">
                {formatDistanceToNow(new Date(team.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {team.updatedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(team.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Members</p>
              <Badge variant="secondary">
                {team.teammembers.length}{" "}
                {team.teammembers.length === 1 ? "member" : "members"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>People in this office</CardDescription>
              </div>
              {canManage && (
                <Link href={`/org/${slug}/teams/${teamId}/members`}>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {team.teammembers.length > 0 ? (
              <div className="space-y-3">
                {team.teammembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                ))}
                {team.teammembers.length > 5 && (
                  <Link href={`/org/${slug}/teams/${teamId}/members`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {team.teammembers.length} members
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No members in this office yet
                </p>
                {canManage && (
                  <Link href={`/org/${slug}/teams/${teamId}/members`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Members
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {canManage && (
        <TeamForm
          organizationId={team.organizationId}
          organizationSlug={slug}
          team={{
            id: team.id,
            name: team.name,
          }}
          mode="edit"
        />
      )}
    </div>
  );
}
