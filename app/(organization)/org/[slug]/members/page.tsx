import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MembersTable } from "@/components/members-table";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { Users } from "lucide-react";
import { requireOrgMember } from "@/lib/session";
import { getOrganizationMembers } from "@/lib/members";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members | Organization",
  description: "Manage organization members",
};

interface OrganizationMembersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrganizationMembersPage({
  params,
}: OrganizationMembersPageProps) {
  // Await params (Next.js 15 requirement)
  const { slug } = await params;

  // Require organization membership and set active org
  const { session, organization } = await requireOrgMember({
    headers: await headers(),
    slug,
  });

  // Fetch members with permission check
  const result = await getOrganizationMembers(organization.id);

  // If null, user doesn't have permission
  if (!result) {
    redirect("/unauthorized");
  }

  const { members, permission } = result;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description={`Manage members of ${organization.name}`}
        action={
          permission.canEdit ? (
            <AddMemberDialog organizationId={organization.id} />
          ) : null
        }
      />

      <Card>
        <CardContent className="p-6">
          {members.length > 0 ? (
            <MembersTable
              members={members}
              organizationId={organization.id}
              canEdit={permission.canEdit}
              currentUserId={session.user.id}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No members yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding members to your organization.
              </p>
              {permission.canEdit && (
                <AddMemberDialog organizationId={organization.id} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
