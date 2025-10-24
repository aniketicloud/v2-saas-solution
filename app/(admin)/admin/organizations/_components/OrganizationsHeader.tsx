import { PageHeader } from "@/components/page-header";
import { CreateOrganizationButton } from "./create-organization-button";

export function OrganizationsHeader() {
  return (
    <PageHeader
      title="Organization Management"
      description="Manage your organizations and their members"
  action={<CreateOrganizationButton />}
    />
  );
}
