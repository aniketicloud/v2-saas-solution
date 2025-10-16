import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Organization | Admin Portal",
  description: "Update organization details",
};

interface EditOrganizationPageProps {
  params: {
    id: string;
  };
}

export default function EditOrganizationPage({
  params,
}: EditOrganizationPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Organization"
        description="Update organization details and settings"
      />
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Coming Soon</p>
                <p className="text-sm">
                  Edit functionality for organization ID:{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {params.id}
                  </code>{" "}
                  will be implemented soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
