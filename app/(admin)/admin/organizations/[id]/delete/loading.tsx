import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeleteOrganizationLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Delete Organization"
        description="Permanently delete this organization and all associated data"
      />

      <Card>
        <CardContent className="pt-6 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
