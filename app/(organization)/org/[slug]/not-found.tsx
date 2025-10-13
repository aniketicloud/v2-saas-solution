import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizationNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Building2 className="h-8 w-8 text-gray-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Organization Not Found
        </h1>
        <p className="mb-8 text-gray-600">
          The organization you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/organizations">View Organizations</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
