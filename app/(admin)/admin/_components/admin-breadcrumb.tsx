"use client";

import Link from "next/link";
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

// Map route segments to readable labels
const segmentLabels: Record<string, string> = {
  admin: "Admin Portal",
  dashboard: "Dashboard",
  organizations: "Organizations",
  users: "Users",
  new: "Create",
  edit: "Edit",
};

// Helper to convert segment to label
function getSegmentLabel(segment: string): string {
  return (
    segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items from segments
  const breadcrumbItems = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label = getSegmentLabel(segment);
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  // Always show "Admin Portal" as root, then build from there
  const adminIndex = breadcrumbItems.findIndex(
    (item) => item.label === "Admin Portal"
  );
  const visibleItems =
    adminIndex >= 0 ? breadcrumbItems.slice(adminIndex) : breadcrumbItems;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleItems.map((item, index) => (
          <Fragment key={item.path}>
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  {/* Admin Portal always links to dashboard */}
                  <Link
                    href={
                      item.label === "Admin Portal"
                        ? "/admin/dashboard"
                        : item.path
                    }
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator
                className={index === 0 ? "hidden md:block" : ""}
              />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
