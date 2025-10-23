import { redirect, notFound } from "next/navigation";
import { auth } from "./auth";
import { tryCatch } from "@/utils/try-catch";
import { APIError } from "better-auth/api";

interface RequireSessionOpts {
  headers: Headers;
  redirectTo?: string;
}

export async function requireSession({ headers, redirectTo = "/auth/login" }: RequireSessionOpts) {
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    redirect(redirectTo);
  }

  return session;
}

export async function redirectIfAuthenticated({ headers, redirectTo = "/dashboard" }: RequireSessionOpts) {
  const session = await auth.api.getSession({ headers });

  if (session?.user) {
    redirect(redirectTo);
  }
}

export async function requireAdmin({ headers }: { headers: Headers }) {
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
  // Ensure we have a valid session first
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
      console.error("Error fetching organization:", error.message, error.status);
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
