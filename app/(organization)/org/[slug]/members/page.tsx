import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MembersTable } from "@/components/members-table";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { Users } from "lucide-react";
import { getOrganizationMembers } from "@/lib/members";
import { getMemberRoles, getAllOrganizationRoles } from "../roles/actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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
  // Layout already validates membership via requireOrgMember
  const { slug } = await params;

  // Get session for current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get organization for member fetch
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: slug },
    headers: await headers(),
  });

  if (!organization || !session?.user) {
    redirect("/no-organization");
  }

  // Fetch members with permission check
  const result = await getOrganizationMembers(organization.id);

  // If null, user doesn't have permission
  if (!result) {
    redirect("/unauthorized");
  }

  const { members, permission } = result;

  // Fetch member roles for each member
  const membersWithRoles = await Promise.all(
    members.map(async (member) => {
      const rolesResult = await getMemberRoles({
        organizationId: organization.id,
        memberId: member.id,
      });
      return {
        ...member,
        customRoles: rolesResult.success ? rolesResult.data || [] : [],
      };
    })
  );

  // Fetch all available roles for assignment
  const rolesResult = await getAllOrganizationRoles(organization.id);
  const availableRoles = rolesResult.success ? rolesResult.data || [] : [];

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
          {membersWithRoles.length > 0 ? (
            <MembersTable
              members={membersWithRoles}
              organizationId={organization.id}
              organizationSlug={slug}
              canEdit={permission.canEdit}
              currentUserId={session.user.id}
              availableRoles={availableRoles}
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
