import { PageHeader } from "@/components/page-header";
import { OrganizationForm } from "../_components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Organization | Admin Portal",
  description: "Add a new organization to your platform",
};

export default function NewOrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Organization"
        description="Add a new organization to your account. The slug will be generated automatically."
      />
      <div className="mx-auto max-w-2xl">
        <OrganizationForm mode="create" />
      </div>
    </div>
  );
}
