import { headers } from "next/headers";
import { requireAdmin } from "@/lib/session";
import { UsersHeader, UsersList } from "./_components";

export default async function AdminUsersPage() {
  // Ensure admin session (will redirect if not admin)
  await requireAdmin({ headers: await headers() });

  return (
    <div className="space-y-6">
      <UsersHeader />
      <UsersList />
    </div>
  );
}
