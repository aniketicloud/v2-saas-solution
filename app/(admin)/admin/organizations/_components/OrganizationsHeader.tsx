import { PageHeader } from "@/components/page-header";
import { CreateOrganizationDialog } from "../create/_components/CreateOrganizationDialog";

export function OrganizationsHeader() {
  return (
    <PageHeader
      title="Organization Management"
      description="Manage your organizations and their members"
      action={<CreateOrganizationDialog />}
    />
  );
}
