import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  OrganizationsEmpty,
  OrganizationsHeader,
  OrganizationCard,
} from "./_components";
import { getOrganizations } from "./action";

export default async function AdminOrganizationsPage() {
  // Check if user is admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user?.role === "admin";

  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const organizations = await getOrganizations();

  return (
    <div className="space-y-6">
      <OrganizationsHeader />

      <div className="grid gap-6 md:grid-cols-2">
        {!organizations || organizations.length === 0 ? (
          <OrganizationsEmpty />
        ) : (
          organizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))
        )}
      </div>
    </div>
  );
}
