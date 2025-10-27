"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

interface OrgBreadcrumbProps {
  organizationSlug: string;
  organizationName: string;
}

export function OrgBreadcrumb({ organizationSlug, organizationName }: OrgBreadcrumbProps) {
  const pathname = usePathname();
  
  // Parse the pathname to create breadcrumb segments
  const segments = pathname
    .split("/")
    .filter((segment) => segment && segment !== "org" && segment !== organizationSlug);

  // If we're on the dashboard, don't show it as a separate breadcrumb
  // since the organization name already links to dashboard
  const filteredSegments = segments.filter(segment => segment !== "dashboard");

  const breadcrumbItems = [
    {
      label: organizationName,
      href: `/org/${organizationSlug}/dashboard`,
      id: "org-home",
    },
    ...filteredSegments.map((segment, index) => {
      const href = `/org/${organizationSlug}/${filteredSegments.slice(0, index + 1).join("/")}`;
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { label, href, id: `segment-${index}` };
    }),
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <Fragment key={item.id}>
              <BreadcrumbItem className={isLast ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
