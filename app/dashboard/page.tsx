import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/utils/try-catch";
import { requireSession } from "@/lib/session";

export default async function DashboardRedirect() {
  // Get headers once to reuse
  const headersList = await headers();

  // Ensure the user is signed in (redirects to /auth/login if not)
  const session = await requireSession({ headers: headersList });

  // If admin, redirect to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Get organizations with error handling
  const [organizations, orgsError] = await tryCatch(
    auth.api.listOrganizations({ headers: headersList })
  );

  // If organizations fetch failed or empty, show no-organization page
  if (orgsError || !organizations || organizations.length === 0) {
    redirect("/no-organization");
  }

  // Redirect to first organization
  redirect(`/org/${organizations[0].slug}/dashboard`);
}
