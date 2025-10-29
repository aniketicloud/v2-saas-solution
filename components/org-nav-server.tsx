import { prisma } from "@/lib/prisma";
import { getOrganizationModules } from "@/lib/actions/modules";
import { OrgNavClient } from "./org-nav-client";

interface OrgNavProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    email: string;
  };
}

export async function OrgNav({ organization, user }: OrgNavProps) {
  // Get modules assigned to this organization
  const modulesResult = await getOrganizationModules(organization.id);
  const modules = "data" in modulesResult ? modulesResult.data : [];

  // Get member to check permissions
  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId: organization.id,
    },
  });

  return (
    <OrgNavClient
      organization={organization}
      user={user}
      modules={modules || []}
      isOrgAdmin={member?.role === "owner" || member?.role === "admin"}
    />
  );
}
