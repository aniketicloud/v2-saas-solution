import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Building2,
  Link as LinkIcon,
  Calendar,
  Users,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { getOrganizationWithDetails } from "../_lib/queries";
import { getOrganizationMembersForAdmin } from "@/lib/members";
import { MembersTable } from "@/components/members-table";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Details | Admin Portal",
  description: "View organization details and members",
};

interface AdminOrganizationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrganizationDetailPage({
  params,
}: AdminOrganizationDetailPageProps) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch organization data with details
  const organization = await getOrganizationWithDetails(id);

  // If not found, show 404
  if (!organization) {
    notFound();
  }

  // Fetch members (admin can always access)
  const members = await getOrganizationMembersForAdmin(id);

  // Format date
  const createdDate = new Date(organization.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={organization.name}
        description={`Organization details and management`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/org/${organization.slug}/dashboard`}>
                <Building2 className="mr-2 h-4 w-4" />
                Go to Organization
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/organizations/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" asChild>
              <Link href={`/admin/organizations/${id}/delete`}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1 text-lg font-semibold">{organization.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Slug
              </label>
              <div className="mt-1 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                  {organization.slug}
                </code>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Organization ID
              </label>
              <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs font-mono break-all">
                {organization.id}
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created
              </label>
              <p className="mt-1">{createdDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Organization Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Members
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {organization.members?.length || 0}
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Offices
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {organization.teams?.length || 0}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/org/${organization.slug}/teams`}>
                  View Offices
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Invitations
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {organization.invitations?.length || 0}
                </p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members?.length || 0})
            </CardTitle>
            <AddMemberDialog organizationId={organization.id} />
          </div>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <MembersTable
              members={members}
              organizationId={organization.id}
              organizationSlug={organization.slug}
              canEdit={true} // Admin can always edit
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No members found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
