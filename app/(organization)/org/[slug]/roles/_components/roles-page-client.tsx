"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Users, Pencil, Trash2 } from "lucide-react";
import { DeleteRoleDialog } from "./delete-role-dialog";
import Link from "next/link";

interface Module {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: Array<{
    id: string;
    resource: string;
    action: string;
    description: string | null;
  }>;
  customRoles: Array<{
    id: string;
    name: string;
    description: string | null;
    isPredefined: boolean;
    isActive: boolean;
    _count: {
      permissions: number;
      members: number;
    };
  }>;
}

interface RolesPageClientProps {
  organizationId: string;
  organizationSlug: string;
  modules: Module[];
}

export function RolesPageClient({
  organizationId,
  organizationSlug,
  modules,
}: RolesPageClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
    memberCount: number;
    isPredefined: boolean;
  } | null>(null);

  const handleDeleteRole = (role: {
    id: string;
    name: string;
    _count: { members: number };
    isPredefined: boolean;
  }) => {
    setRoleToDelete({
      id: role.id,
      name: role.name,
      memberCount: role._count.members,
      isPredefined: role.isPredefined,
    });
    setDeleteDialogOpen(true);
  };

  const totalRoles = modules.reduce(
    (sum, module) => sum + module.customRoles.length,
    0
  );
  const totalPermissions = modules.reduce(
    (sum, module) => sum + module.permissions.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Roles & Permissions"
          description="Manage custom roles and permissions for organization modules"
        />
        <Link href={`/org/${organizationSlug}/roles/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">
              Active organization modules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              Including predefined roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Permissions
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPermissions}</div>
            <p className="text-xs text-muted-foreground">
              Across all modules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modules with Roles */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Modules Found</p>
            <p className="text-sm text-muted-foreground">
              This organization doesn't have any modules assigned yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {module.name}
                      <Badge variant="outline">{module.slug}</Badge>
                    </CardTitle>
                    {module.description && (
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    )}
                  </div>
                  <Link href={`/org/${organizationSlug}/roles/create?moduleId=${module.id}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Role
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>
                    {module.permissions.length} permission
                    {module.permissions.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {module.customRoles.length} role
                    {module.customRoles.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                {module.customRoles.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No custom roles created yet. Click "Create Role" to get
                      started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {module.customRoles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{role.name}</h4>
                            {role.isPredefined && (
                              <Badge variant="secondary" className="text-xs">
                                Predefined
                              </Badge>
                            )}
                            {!role.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">
                              {role.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {role._count.permissions} permission
                              {role._count.permissions !== 1 ? "s" : ""}
                            </span>
                            <span>
                              {role._count.members} member
                              {role._count.members !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.location.href = `/org/${organizationSlug}/roles/${role.id}`;
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!role.isPredefined && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRole(role)}
                              title={
                                role._count.members > 0
                                  ? "Cannot delete role with assigned members"
                                  : "Delete role"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Role Dialog */}
      {roleToDelete && (
        <DeleteRoleDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          role={roleToDelete}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
        />
      )}
    </div>
  );
}
