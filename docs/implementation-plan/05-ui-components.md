# Part 5: UI Components

**Last Updated**: October 17, 2025

---

## 🎨 Core UI Components

This section documents reusable UI components for the application.

---

## 🧭 Organization Navigation

### OrgNav Component

Full implementation with module links, system admin badge, and responsive design.

```tsx
// components/org-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Ticket,
  Package,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Module {
  moduleKey: string;
  isEnabled: boolean;
}

interface Subscription {
  plan: string;
  status: string;
}

interface OrgNavProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  user: {
    email: string;
    name: string;
  };
  member: {
    role: string;
  };
  modules: Module[];
  subscription?: Subscription | null;
  isSystemAdmin?: boolean;
}

export function OrgNav({
  organization,
  user,
  member,
  modules,
  subscription,
  isSystemAdmin,
}: OrgNavProps) {
  const pathname = usePathname();
  const baseUrl = `/org/${organization.slug}`;

  // Core navigation items
  const coreNavItems = [
    {
      title: "Dashboard",
      href: `${baseUrl}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      href: `${baseUrl}/members`,
      icon: Users,
    },
  ];

  // Module-based navigation
  const moduleNavItems = [];

  if (modules.some((m) => m.moduleKey === "visitor_management" && m.isEnabled)) {
    moduleNavItems.push({
      title: "Visitors",
      href: `${baseUrl}/modules/visitors`,
      icon: UserCheck,
    });
  }

  if (modules.some((m) => m.moduleKey === "ticket_management" && m.isEnabled)) {
    moduleNavItems.push({
      title: "Tickets",
      href: `${baseUrl}/modules/tickets`,
      icon: Ticket,
    });
  }

  if (modules.some((m) => m.moduleKey === "inventory" && m.isEnabled)) {
    moduleNavItems.push({
      title: "Inventory",
      href: `${baseUrl}/modules/inventory`,
      icon: Package,
    });
  }

  // Settings navigation
  const settingsNavItems = [
    {
      title: "Settings",
      href: `${baseUrl}/settings/general`,
      icon: Settings,
    },
  ];

  const allNavItems = [...coreNavItems, ...moduleNavItems, ...settingsNavItems];

  return (
    <nav className="hidden md:flex w-64 flex-col border-r bg-gray-50">
      {/* Organization Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">{organization.name}</h2>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Role badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {member.role}
          </Badge>
          {isSystemAdmin && (
            <Badge className="text-xs bg-blue-600">
              🛡️ System Admin
            </Badge>
          )}
          {subscription && (
            <Badge
              variant={subscription.status === "active" ? "default" : "secondary"}
              className="text-xs capitalize"
            >
              {subscription.plan}
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Core Links */}
        <div className="mb-4">
          <ul className="space-y-1">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Module Links */}
        {moduleNavItems.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="mb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Modules
              </p>
            </div>
            <ul className="space-y-1">
              {moduleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Settings Link */}
        <Separator className="my-4" />
        <ul className="space-y-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer - System Admin Portal Link */}
      {isSystemAdmin && (
        <div className="border-t p-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            ← Admin Portal
          </Link>
        </div>
      )}
    </nav>
  );
}
```

---

## 🔐 Permissions Provider

### Context Provider

```tsx
// components/permissions-provider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";

interface Member {
  id: string;
  role: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface PermissionsContextValue {
  member: Member;
  organization: Organization;
  isSystemAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  children,
  member,
  organization,
  isSystemAdmin,
}: {
  children: ReactNode;
  member: Member;
  organization: Organization;
  isSystemAdmin: boolean;
}) {
  return (
    <PermissionsContext.Provider value={{ member, organization, isSystemAdmin }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissionsContext must be used within PermissionsProvider");
  }
  return context;
}
```

---

## ✅ Permission-Aware Components

### Conditional Render Component

```tsx
// components/conditional-render.tsx
"use client";

import { useOrgPermissions } from "@/hooks/use-org-permissions";
import { ReactNode } from "react";

interface ConditionalRenderProps {
  resource: string;
  actions: string[];
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export function ConditionalRender({
  resource,
  actions,
  children,
  fallback = null,
  showLoading = false,
}: ConditionalRenderProps) {
  const { checkPermission } = useOrgPermissions();

  const hasPermission = checkPermission(resource, actions);

  if (showLoading === undefined) {
    return fallback;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

**Usage**:
```tsx
<ConditionalRender resource="organization" actions={["delete"]}>
  <Button variant="destructive">Delete Organization</Button>
</ConditionalRender>
```

---

### Permission Gate Component

```tsx
// components/permission-gate.tsx
"use client";

import { useOrgPermissions } from "@/hooks/use-org-permissions";
import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface PermissionGateProps {
  resource: string;
  actions: string[];
  children: ReactNode;
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionGate({
  resource,
  actions,
  children,
  fallback,
  showError = false,
}: PermissionGateProps) {
  const { checkPermission } = useOrgPermissions();

  const hasPermission = checkPermission(resource, actions);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}
```

**Usage**:
```tsx
<PermissionGate resource="member" actions={["delete"]} showError>
  <RemoveMemberButton memberId={member.id} />
</PermissionGate>
```

---

## 📄 Page Header Component

```tsx
// components/page-header.tsx
import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
        
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      
      <Separator className="mt-6" />
    </div>
  );
}
```

**Usage**:
```tsx
<PageHeader
  title="Members"
  description="Manage organization members and their roles"
  action={
    <Button asChild>
      <Link href="/org/nike/members/invite">
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Member
      </Link>
    </Button>
  }
/>
```

---

## 📊 Data Table Component

```tsx
// components/data-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Empty } from "@/components/ui/empty";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredData.length === 0 ? (
        <Empty message={emptyMessage} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                        ? item[column.accessorKey]
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
```

**Usage**:
```tsx
<DataTable
  data={members}
  searchPlaceholder="Search members..."
  columns={[
    {
      header: "Name",
      cell: (member) => (
        <div>
          <p className="font-medium">{member.user.name}</p>
          <p className="text-sm text-gray-500">{member.user.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (member) => (
        <Badge variant="secondary" className="capitalize">
          {member.role}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (member) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit Role</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]}
/>
```

---

## 🎨 Empty State Component

```tsx
// components/ui/empty.tsx
import { FileQuestion } from "lucide-react";

interface EmptyProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message: string;
  action?: React.ReactNode;
}

export function Empty({
  icon: Icon = FileQuestion,
  title,
  message,
  action,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <p className="text-sm text-gray-600 mb-4 max-w-sm">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
```

---

## 🔔 System Admin Badge

```tsx
// components/system-admin-badge.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { usePermissionsContext } from "./permissions-provider";

export function SystemAdminBadge() {
  const { isSystemAdmin } = usePermissionsContext();

  if (!isSystemAdmin) return null;

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <Shield className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-700">
        🛡️ You're viewing this as a <strong>system administrator</strong> with full permissions.
      </AlertDescription>
    </Alert>
  );
}
```

**Usage**:
```tsx
export default function OrgSettingsPage() {
  return (
    <div>
      <SystemAdminBadge />
      <PageHeader title="Organization Settings" />
      {/* ... */}
    </div>
  );
}
```

---

## 📝 Form Components

### Field Components (from shadcn/ui)

Use Field components from `@/components/ui/field` for consistent form styling:

```tsx
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
```

**Example**:
```tsx
<FieldGroup>
  <Field data-invalid={!!errors.name}>
    <FieldLabel>Organization Name</FieldLabel>
    <Input
      {...register("name")}
      placeholder="Acme Inc"
      aria-invalid={!!errors.name}
    />
    <FieldDescription>
      The display name for your organization
    </FieldDescription>
    {errors.name && <FieldError>{errors.name.message}</FieldError>}
  </Field>
</FieldGroup>
```

---

## 🔄 Loading States

### Spinner Component

```tsx
// components/ui/spinner.tsx (should already exist)
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-5 w-5", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
```

### Loading Button

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner className="mr-2 h-4 w-4" />
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</Button>
```

---

## 🎨 Status Badges

```tsx
// components/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: { label: "Active", className: "bg-green-100 text-green-700" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    expired: { label: "Expired", className: "bg-red-100 text-red-700" },
    canceled: { label: "Canceled", className: "bg-gray-100 text-gray-700" },
  }[status] || { label: status, className: "" };

  return (
    <Badge variant="secondary" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
```

---

## 📱 Component Summary

| Component | Purpose | Location |
|-----------|---------|----------|
| `OrgNav` | Organization sidebar navigation | `components/org-nav.tsx` |
| `PermissionsProvider` | Permissions context | `components/permissions-provider.tsx` |
| `ConditionalRender` | Show/hide based on permissions | `components/conditional-render.tsx` |
| `PermissionGate` | Permission-based content gate | `components/permission-gate.tsx` |
| `PageHeader` | Consistent page headers | `components/page-header.tsx` |
| `DataTable` | Reusable data table | `components/data-table.tsx` |
| `Empty` | Empty state placeholder | `components/ui/empty.tsx` |
| `SystemAdminBadge` | System admin indicator | `components/system-admin-badge.tsx` |
| `StatusBadge` | Status indicators | `components/status-badge.tsx` |
| `Spinner` | Loading indicator | `components/ui/spinner.tsx` |

---

**Next**: [Part 6: Server Actions →](./06-server-actions.md)
