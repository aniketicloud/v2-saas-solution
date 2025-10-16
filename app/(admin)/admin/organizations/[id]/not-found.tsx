import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function OrganizationNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Organization Not Found</h2>
              <p className="text-sm text-muted-foreground">
                The organization you're looking for doesn't exist or has been
                deleted.
              </p>
            </div>
            <Button asChild className="mt-2">
              <Link href="/admin/organizations">Back to Organizations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
