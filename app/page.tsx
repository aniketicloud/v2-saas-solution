import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  // Fetch the current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, redirect to login
  if (!session?.user) {
    redirect("/auth/login");
  }

  // If user is admin, redirect to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // If user has an active organization, redirect to that org's dashboard
  if (session.session.activeOrganizationId) {
    try {
      // Fetch the active organization
      const organization = await auth.api.getFullOrganization({
        query: {
          organizationId: session.session.activeOrganizationId,
        },
        headers: await headers(),
      });

      // If organization exists, redirect to its dashboard
      if (organization?.slug) {
        redirect(`/org/${organization.slug}/dashboard`);
      }
    } catch (error) {
      // If organization fetch fails, continue to no-organization page
      console.error("Failed to fetch organization:", error);
    }
  }

  // No active organization, redirect to no-organization page
  redirect("/no-organization");
}
