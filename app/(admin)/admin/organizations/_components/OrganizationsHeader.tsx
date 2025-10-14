import { CreateOrganizationDialog } from "../create/_components/CreateOrganizationDialog";

export function OrganizationsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Management
        </h1>
        <p className="text-muted-foreground">
          Manage your organizations and their members
        </p>
      </div>
      <CreateOrganizationDialog />
    </div>
  );
}
