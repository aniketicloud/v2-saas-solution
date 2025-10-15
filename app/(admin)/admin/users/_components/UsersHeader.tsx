import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function UsersHeader() {
  return (
    <PageHeader
      title="User Management"
      description="Manage all users across the platform"
      action={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      }
    />
  );
}
