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

// Helper to check if segment looks like an ID (cuid2 or UUID-like)
function isIdSegment(segment: string): boolean {
  // Match cuid2 (starts with 'c', 24+ chars, lowercase, numbers, _)
  if (/^c[a-z0-9]{23,}$/i.test(segment)) return true;
  // Match UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment)) return true;
  // Add more patterns as needed for your ID types
  return false;
}

// Helper to convert segment to label
function getSegmentLabel(segment: string, prevSegment?: string): string {
  // If it's a known segment, use the mapped label
  if (segmentLabels[segment]) {
    return segmentLabels[segment];
  }

  // If it looks like an ID and previous segment was "organizations", label it as "Details"
  if (isIdSegment(segment) && prevSegment === "organizations") {
    return "Organization Details";
  }

  // Otherwise capitalize first letter
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items from segments
  const breadcrumbItems = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const prevSegment = index > 0 ? segments[index - 1] : undefined;
    const label = getSegmentLabel(segment, prevSegment);
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
