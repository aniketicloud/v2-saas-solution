import { redirect, notFound } from "next/navigation";
import { auth } from "./auth";
import { tryCatch } from "@/utils/try-catch";
import { APIError } from "better-auth/api";

interface RequireSessionOpts {
  headers: Headers;
  redirectTo?: string;
}

export async function requireSession({
  headers,
  redirectTo = "/auth/login",
}: RequireSessionOpts) {
  // Ensure a valid session exists; otherwise redirect to login
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    redirect(redirectTo);
  }

  return session;
}

export async function redirectIfAuthenticated({
  headers,
  redirectTo = "/dashboard",
}: RequireSessionOpts) {
  // If the user is already authenticated, redirect them (used on auth pages)
  const session = await auth.api.getSession({ headers });

  if (session?.user) {
    redirect(redirectTo);
  }
}

export async function requireAdmin({ headers }: { headers: Headers }) {
  // Require an authenticated admin user; otherwise redirect to unauthorized
  const session = await requireSession({ headers });

  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireOrgMember({
  headers,
  slug,
}: {
  headers: Headers;
  slug: string;
}) {
  // Ensure the user is a member of the organization identified by slug.
  // Redirect or 404 on failure; set active organization on success.
  const session = await requireSession({ headers });

  // Admins belong to admin area; redirect them out
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Fetch the full organization and ensure it exists and the user is a member
  const [organization, error] = await tryCatch(
    auth.api.getFullOrganization({
      query: { organizationSlug: slug },
      headers,
    })
  );

  if (error || !organization) {
    // Log API errors for debugging
    if (error instanceof APIError) {
      console.error(
        "Error fetching organization:",
        error.message,
        error.status
      );
    }
    // Organization not found or fetch error -> 404
    notFound();
  }

  const isMember = organization.members?.some(
    (member: { userId: string }) => member.userId === session.user.id
  );

  if (!isMember) {
    redirect("/unauthorized");
  }

  // Ensure the active organization is set for the session
  if (session.session.activeOrganizationId !== organization.id) {
    await auth.api.setActiveOrganization({
      body: { organizationId: organization.id },
      headers,
    });
  }

  return { session, organization } as const;
}
