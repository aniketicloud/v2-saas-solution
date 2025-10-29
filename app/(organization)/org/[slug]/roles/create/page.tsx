import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrganizationModules } from "../actions";
import { CreateRoleForm } from "./_components/create-role-form";
import LoadingSpinner from "@/components/loading-spinner";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    moduleId?: string;
  }>;
}

async function CreateRoleContent({
  orgSlug,
  orgId,
  preSelectedModuleId,
}: {
  orgSlug: string;
  orgId: string;
  preSelectedModuleId?: string;
}) {
  const modulesResult = await getOrganizationModules(orgId);

  if (!modulesResult.success || !modulesResult.data) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          {modulesResult.error || "Failed to load modules"}
        </p>
      </div>
    );
  }

  // Transform module data to match expected format
  const modules = modulesResult.data.map((orgModule) => ({
    id: orgModule.module.id,
    name: orgModule.module.name,
    slug: orgModule.module.slug,
    description: orgModule.module.description,
    permissions: orgModule.module.modulePermissions.map((perm) => ({
      id: perm.id,
      resource: perm.resource,
      action: perm.action,
      description: perm.description,
    })),
  }));

  if (modules.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          No modules available. Please add a module first.
        </p>
      </div>
    );
  }

  return (
    <CreateRoleForm
      organizationId={orgId}
      organizationSlug={orgSlug}
      modules={modules}
      preSelectedModuleId={preSelectedModuleId}
    />
  );
}

export default async function CreateRolePage({ params, searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { slug } = await params;
  const { moduleId } = await searchParams;

  // Get organization from slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!organization) {
    notFound();
  }

  // Verify user is a member and has admin rights
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: organization.id,
    },
  });

  if (!membership) {
    notFound();
  }

  // Check if user is org admin or owner
  if (membership.role !== "admin" && membership.role !== "owner") {
    redirect(`/org/${slug}/dashboard`);
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        }
      >
        <CreateRoleContent
          orgSlug={slug}
          orgId={organization.id}
          preSelectedModuleId={moduleId}
        />
      </Suspense>
    </div>
  );
}
