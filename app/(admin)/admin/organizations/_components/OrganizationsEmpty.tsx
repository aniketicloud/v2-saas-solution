import { Building } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CreateOrganizationDialog } from "@/app/dashboard/organizations/_components/CreateOrganizationDialog";

export function OrganizationsEmpty() {
  return (
    <div className="col-span-2">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building />
          </EmptyMedia>
          <EmptyTitle>No Organizations Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any organizations yet. Get started by
            creating your first organization to manage teams and projects.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateOrganizationDialog />
        </EmptyContent>
      </Empty>
    </div>
  );
}
