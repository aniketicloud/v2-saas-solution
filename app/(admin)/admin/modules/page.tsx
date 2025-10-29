import { prisma } from "@/lib/prisma";
import ModulesPageClient from "../_components/modules-page-client";

export default async function ModulesPage() {
  // Layout already validates admin role, no need to check again

  // Get all modules with statistics
  const modules = await prisma.module.findMany({
    include: {
      modulePermissions: true,
      _count: {
        select: {
          organizationModules: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get all organizations
  const organizations = await prisma.organization.findMany({
    include: {
      organizationModules: {
        include: {
          module: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <ModulesPageClient
      modules={modules}
      organizations={organizations}
    />
  );
}
