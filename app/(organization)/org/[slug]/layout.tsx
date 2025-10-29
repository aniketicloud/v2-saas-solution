import type React from "react";
import { headers, cookies } from "next/headers";
import { OrgSidebar } from "./_components/org-sidebar";
import { OrgBreadcrumb } from "@/components/org-breadcrumb";
import { requireOrgMember } from "@/lib/session";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ColorPaletteSelector } from "@/components/color-palette-selector";
import { getOrganizationModules } from "@/lib/actions/modules";

interface Params {
  slug: string;
}

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  // Use helper to ensure session + membership and set active org as needed
  const headersList = await headers();
  // In Next.js 16 params are a Promise — await to access path params
  const resolvedParams = await params;
  const { session, organization } = await requireOrgMember({
    headers: headersList,
    slug: resolvedParams.slug,
  });

  // Get modules for this organization
  const modulesResult = await getOrganizationModules(organization.id);
  const modules = "data" in modulesResult ? modulesResult.data : [];

  // Get sidebar state from cookies for persistent state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <OrgSidebar
        organization={organization}
        user={session.user}
        modules={modules || []}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <OrgBreadcrumb
            organizationSlug={organization.slug}
            organizationName={organization.name}
          />
          <div className="ml-auto flex items-center gap-1">
            <ColorPaletteSelector />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
