import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRoleDetails } from "../actions";
import { EditRoleClient } from "./_components/edit-role-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Role | Organization",
  description: "Edit role details and permissions",
};

interface EditRolePageProps {
  params: Promise<{
    slug: string;
    roleId: string;
  }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { slug, roleId } = await params;

  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: slug },
    headers: await headers(),
  });

  if (!organization) {
    redirect("/no-organization");
  }

  const result = await getRoleDetails({
    organizationId: organization.id,
    roleId,
  });

  if (!result.success || !result.data) {
    redirect(`/org/${slug}/roles`);
  }

  const role = result.data;

  // Transform data for client component
  const transformedRole = {
    id: role.id,
    name: role.name,
    description: role.description,
    isPredefined: role.isPredefined,
    isActive: role.isActive,
    memberCount: role._count.memberRoles,
    module: {
      id: role.organizationModule.module.id,
      name: role.organizationModule.module.name,
      slug: role.organizationModule.module.slug,
    },
    organization: {
      id: role.organizationModule.organization.id,
      name: role.organizationModule.organization.name,
      slug: role.organizationModule.organization.slug,
    },
    allPermissions: role.organizationModule.module.modulePermissions,
    selectedPermissions: role.permissions.map((rp) => ({
      id: rp.modulePermission.id,
      resource: rp.modulePermission.resource,
      action: rp.modulePermission.action,
      description: rp.modulePermission.description,
    })),
  };

  return (
    <EditRoleClient
      role={transformedRole}
      organizationSlug={slug}
    />
  );
}
