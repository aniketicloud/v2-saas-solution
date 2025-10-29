import { getOrganizationModules } from "./actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RolesPageClient } from "./_components/roles-page-client";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Roles & Permissions | Organization",
  description: "Manage custom roles and permissions for your organization",
};

interface RolesPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RolesPage({ params }: RolesPageProps) {
  const { slug } = await params;

  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: slug },
    headers: await headers(),
  });

  if (!organization) {
    redirect("/no-organization");
  }

  const result = await getOrganizationModules(organization.id);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="Manage custom roles and permissions for organization modules"
        />
        <div className="text-center py-12">
          <p className="text-destructive">{result.error}</p>
        </div>
      </div>
    );
  }

  // Transform data to match component interface
  const modules =
    result.data?.map((orgModule: any) => ({
      id: orgModule.module.id,
      name: orgModule.module.name,
      slug: orgModule.module.slug,
      description: orgModule.module.description,
      permissions: orgModule.module.modulePermissions,
      customRoles: orgModule.customRoles.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isPredefined: role.isPredefined,
        isActive: role.isActive,
        _count: {
          permissions: role._count.permissions,
          members: role._count.memberRoles,
        },
      })),
    })) || [];

  return (
    <RolesPageClient
      organizationId={organization.id}
      organizationSlug={slug}
      modules={modules}
    />
  );
}
