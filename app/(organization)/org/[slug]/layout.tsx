import type React from "react";

export default function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <div>
      {/* Add organization-specific layout elements here */}
      {children}
    </div>
  );
}
