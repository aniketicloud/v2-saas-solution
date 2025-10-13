import type React from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { OrgNav } from "@/components/org-nav";

interface Params {
  slug: string;
}

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  // Get the current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect admins to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Fetch organization by slug
  const organization = await auth.api.getFullOrganization({
    query: {
      organizationSlug: params.slug,
    },
    headers: await headers(),
  });

  // Handle case where organization is not found
  if (!organization) {
    notFound();
  }

  // Check if user is a member of the organization
  const isMember = organization.members?.some(
    (member) => member.userId === session.user.id
  );

  if (!isMember) {
    redirect("/unauthorized");
  }

  // Set as active organization if not already active
  if (session.session.activeOrganizationId !== organization.id) {
    await auth.api.setActiveOrganization({
      body: {
        organizationId: organization.id,
      },
      headers: await headers(),
    });
  }

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
