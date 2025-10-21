import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/utils/try-catch";

export default async function DashboardRedirect() {
  // Get headers once to reuse
  const headersList = await headers();

  // Get session with error handling
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: headersList })
  );

  // If session fetch failed or no user, redirect to login
  if (sessionError || !session?.user) {
    redirect("/auth/login");
  }

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
