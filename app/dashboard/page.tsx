import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardRedirect() {
  // Get the current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect("/auth/login");
  }

  // If admin, redirect to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // For regular users, check if they have any organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // If user has no organizations, show no-organization page
  if (!organizations || organizations.length === 0) {
    redirect("/no-organization");
  }

  // If user has organizations, redirect to their first organization
  redirect(`/org/${organizations[0].slug}/dashboard`);
}
