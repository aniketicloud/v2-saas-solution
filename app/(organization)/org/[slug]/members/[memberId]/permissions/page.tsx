import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMemberPermissionsAction } from "@/app/(organization)/org/[slug]/roles/actions";
import { MemberPermissionsPreview } from "@/components/member-permissions-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    slug: string;
    memberId: string;
  }>;
}

async function MemberPermissionsContent({
  orgSlug,
  memberId,
  orgId,
}: {
  orgSlug: string;
  memberId: string;
  orgId: string;
}) {
  const result = await getMemberPermissionsAction(orgId, memberId);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          {result.error || "Failed to load member permissions"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/org/${orgSlug}/members`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
        </Link>
      </div>

      <MemberPermissionsPreview
        memberName={result.data.memberName}
        organizationRole={result.data.organizationRole}
        roles={result.data.roles}
      />
    </div>
  );
}

export default async function MemberPermissionsPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { slug, memberId } = await params;

  // Get organization from slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!organization) {
    notFound();
  }

  // Verify user has access to this organization
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: organization.id,
    },
  });

  if (!membership) {
    notFound();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        }
      >
        <MemberPermissionsContent
          orgSlug={slug}
          memberId={memberId}
          orgId={organization.id}
        />
      </Suspense>
    </div>
  );
}
