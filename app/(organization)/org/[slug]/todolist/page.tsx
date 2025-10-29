import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkPermissions } from "@/lib/permissions";
import { TodoListPermissions } from "@/lib/permissions/types";
import TodoListPageClient from "../_components/todolist/todolist-page-client";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Layout already validates membership via requireOrgMember
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get organization (layout already validated access)
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Get member (we know they exist because layout validated it)
  const member = await prisma.member.findFirst({
    where: {
      userId: session!.user.id,
      organizationId: organization.id,
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  // Check if todolist module is assigned to organization
  const orgModule = await prisma.organizationModule.findFirst({
    where: {
      organizationId: organization.id,
      module: {
        slug: "todolist",
      },
      isEnabled: true,
    },
  });

  if (!orgModule) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Module Not Available</h2>
        <p className="text-muted-foreground">
          The TodoList module is not enabled for this organization.
        </p>
      </div>
    );
  }

  // Check permissions using new permission system
  const permissions = await checkPermissions({
    memberId: member.id,
    organizationId: organization.id,
    moduleSlug: "todolist",
    permissions: [
      TodoListPermissions.TODOLIST_VIEW,
      TodoListPermissions.TODOLIST_CREATE,
      TodoListPermissions.TODOLIST_UPDATE,
      TodoListPermissions.TODOLIST_DELETE,
    ],
  });

  return (
    <TodoListPageClient
      organizationId={organization.id}
      organizationSlug={organization.slug}
      permissions={{
        canView: permissions["todolist.view"],
        canCreate: permissions["todolist.create"],
        canUpdate: permissions["todolist.update"],
        canDelete: permissions["todolist.delete"],
      }}
    />
  );
}
