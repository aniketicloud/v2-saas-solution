import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersHeader, UsersList } from "./_components";

export default async function AdminUsersPage() {
  // Check if user is admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user?.role === "admin";

  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <UsersHeader />
      <UsersList />
    </div>
  );
}
