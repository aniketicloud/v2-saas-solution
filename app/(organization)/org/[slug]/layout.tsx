import type React from "react";
import { headers } from "next/headers";
import { OrgNav } from "@/components/org-nav";
import { requireOrgMember } from "@/lib/session";

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <OrgNav organization={organization} user={session.user} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
