# Part 7: Page Examples

**Last Updated**: October 17, 2025

---

## 📄 Complete Page Implementations

This section provides full examples of key pages in the application.

---

## 🛡️ Admin: Module Management Page

Complete implementation with toggle switches and audit information.

```tsx
// app/(admin)/admin/organizations/[id]/modules/page.tsx
import { getOrganizationModules } from "./_lib/actions";
import { ModuleToggle } from "./_components/module-toggle";
import { ArrowLeft, Puzzle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function OrganizationModulesPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch organization
  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) {
    notFound();
  }

  // Fetch modules
  const result = await getOrganizationModules(params.id);

  if (!result.success) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error: {result.error}</p>
      </div>
    );
  }

  const modules = result.data;

  return (
    <div>
      <PageHeader
        title="Module Management"
        description={`Enable or disable features for ${organization.name}`}
        action={
          <Button variant="outline" asChild>
            <Link href={`/admin/organizations/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organization
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules?.map((module) => (
          <ModuleToggle
            key={module.key}
            organizationId={params.id}
            moduleKey={module.key}
            moduleName={module.name}
            description={module.description}
            isEnabled={module.isEnabled}
            enabledAt={module.enabledAt}
          />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// app/(admin)/admin/organizations/[id]/modules/_components/module-toggle.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleOrganizationModule } from "../_lib/actions";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface ModuleToggleProps {
  organizationId: string;
  moduleKey: string;
  moduleName: string;
  description: string;
  isEnabled: boolean;
  enabledAt?: Date;
}

export function ModuleToggle({
  organizationId,
  moduleKey,
  moduleName,
  description,
  isEnabled: initialEnabled,
  enabledAt,
}: ModuleToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);

    const result = await toggleOrganizationModule(
      organizationId,
      moduleKey,
      checked
    );

    if (result.success) {
      setIsEnabled(checked);
      toast.success(
        checked
          ? `${moduleName} enabled successfully`
          : `${moduleName} disabled successfully`
      );
    } else {
      toast.error(result.error);
    }

    setIsToggling(false);
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{moduleName}</h3>
            {isEnabled && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isToggling && <Spinner className="h-4 w-4" />}
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        </div>
      </div>

      {enabledAt && isEnabled && (
        <p className="text-xs text-gray-500 mt-4">
          Enabled: {new Date(enabledAt).toLocaleDateString()} at{" "}
          {new Date(enabledAt).toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
}
```

---

## 👥 Organization: Members Page

Complete members list with invite functionality and role management.

```tsx
// app/(organization)/org/[slug]/members/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MembersList } from "./_components/members-list";
import { SystemAdminBadge } from "@/components/system-admin-badge";
import { ConditionalRender } from "@/components/conditional-render";

export default async function MembersPage({
  params,
}: {
  params: { slug: string };
}) {
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: await headers(),
  });

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div>
      <SystemAdminBadge />

      <PageHeader
        title="Members"
        description={`Manage members and their roles in ${organization.name}`}
        action={
          <ConditionalRender resource="invitation" actions={["create"]}>
            <Button asChild>
              <Link href={`/org/${params.slug}/members/invite`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Link>
            </Button>
          </ConditionalRender>
        }
      />

      <MembersList
        members={organization.members || []}
        organizationSlug={params.slug}
      />
    </div>
  );
}
```

```tsx
// app/(organization)/org/[slug]/members/_components/members-list.tsx
"use client";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeMember } from "../[memberId]/remove/_lib/actions";
import { toast } from "sonner";
import { useState } from "react";
import { useOrgPermissions } from "@/hooks/use-org-permissions";

interface Member {
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface MembersListProps {
  members: Member[];
  organizationSlug: string;
}

export function MembersList({ members, organizationSlug }: MembersListProps) {
  const router = useRouter();
  const { checkPermission } = useOrgPermissions();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canUpdateRole = checkPermission("member", ["update"]);
  const canRemove = checkPermission("member", ["delete"]);

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setRemovingId(memberId);

    const result = await removeMember(organizationSlug, memberId);

    if (result.success) {
      toast.success("Member removed successfully");
      router.refresh();
    } else {
      toast.error(result.error);
    }

    setRemovingId(null);
  };

  return (
    <DataTable
      data={members}
      searchPlaceholder="Search members..."
      emptyMessage="No members found"
      columns={[
        {
          header: "Member",
          cell: (member) => (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback>
                  {member.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>
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
          header: "Joined",
          cell: (member) => (
            <span className="text-sm text-gray-600">
              {new Date(member.createdAt).toLocaleDateString()}
            </span>
          ),
        },
        {
          header: "Actions",
          cell: (member) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={removingId === member.id}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdateRole && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/org/${organizationSlug}/members/${member.id}/edit`
                      )
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                {canRemove && (
                  <DropdownMenuItem
                    onClick={() => handleRemove(member.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ]}
    />
  );
}
```

---

## ✉️ Invite Member Page

Form with validation and role selection.

```tsx
// app/(organization)/org/[slug]/members/invite/page.tsx
import { PageHeader } from "@/components/page-header";
import { InviteForm } from "./_components/invite-form";
import { SystemAdminBadge } from "@/components/system-admin-badge";

export default function InviteMemberPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <SystemAdminBadge />

      <PageHeader
        title="Invite Member"
        description="Send an invitation to join your organization"
      />

      <div className="max-w-2xl">
        <InviteForm organizationSlug={params.slug} />
      </div>
    </div>
  );
}
```

```tsx
// app/(organization)/org/[slug]/members/invite/_components/invite-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { inviteMemberSchema, type InviteMemberFormData } from "../_lib/schema";
import { inviteMember } from "../_lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export function InviteForm({ organizationSlug }: { organizationSlug: string }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: InviteMemberFormData) => {
    const result = await inviteMember(organizationSlug, data.email, data.role);

    if (result.success) {
      toast.success("Invitation sent successfully!");
      router.push(`/org/${organizationSlug}/members`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              {...register("email")}
              type="email"
              placeholder="colleague@example.com"
              aria-invalid={!!errors.email}
            />
            <FieldDescription>
              The person will receive an invitation email
            </FieldDescription>
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.role}>
            <FieldLabel>Role</FieldLabel>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as any)}
            >
              <SelectTrigger aria-invalid={!!errors.role}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">
                  <div>
                    <p className="font-medium">Owner</p>
                    <p className="text-xs text-gray-500">
                      Full access including organization settings
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div>
                    <p className="font-medium">Admin</p>
                    <p className="text-xs text-gray-500">
                      Can manage members and use all modules
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div>
                    <p className="font-medium">Member</p>
                    <p className="text-xs text-gray-500">
                      Limited access to modules
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Choose the appropriate role for this member
            </FieldDescription>
            {errors.role && <FieldError>{errors.role.message}</FieldError>}
          </Field>
        </FieldGroup>

        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Sending Invitation...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

---

## 🏢 Organization Settings Page

View-only settings with permission-based edit button.

```tsx
// app/(organization)/org/[slug]/settings/general/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SystemAdminBadge } from "@/components/system-admin-badge";
import { ConditionalRender } from "@/components/conditional-render";

export default async function OrgSettingsPage({
  params,
}: {
  params: { slug: string };
}) {
  const organization = await auth.api.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: await headers(),
  });

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div>
      <SystemAdminBadge />

      <PageHeader
        title="Organization Settings"
        description="View and manage organization details"
        action={
          <ConditionalRender resource="organization" actions={["update"]}>
            <Button asChild>
              <Link href={`/org/${params.slug}/settings/general/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Settings
              </Link>
            </Button>
          </ConditionalRender>
        }
      />

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <p className="mt-1 text-lg">{organization.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <p className="mt-1 text-gray-600">{organization.slug}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Created
            </label>
            <p className="mt-1 text-gray-600">
              {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Total Members
            </label>
            <p className="mt-1 text-gray-600">
              {organization.members?.length || 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## 📋 Summary of Page Patterns

| Page Type | Key Features | Permission Check |
|-----------|--------------|------------------|
| Admin Module Management | Toggle switches, audit logs | System admin only |
| Organization Members | Data table, invite/remove | Member permissions |
| Invite Member | Form with validation, role select | Invitation.create |
| Organization Settings | View mode + conditional edit | Organization.update |
| Module Pages | Check module enabled | Module enabled + permissions |

---

**Next**: [Part 8: Implementation Roadmap →](./08-roadmap.md)
