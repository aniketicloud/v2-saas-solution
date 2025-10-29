"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Shield, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";

interface Permission {
  resource: string;
  action: string;
  description: string | null;
}

interface RoleWithPermissions {
  roleName: string;
  isPredefined: boolean;
  moduleName: string;
  permissions: Permission[];
}

interface MemberPermissionsPreviewProps {
  memberName: string;
  roles: RoleWithPermissions[];
  organizationRole: "owner" | "admin" | "member";
}

export function MemberPermissionsPreview({
  memberName,
  roles,
  organizationRole,
}: MemberPermissionsPreviewProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const toggleRole = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const toggleAll = () => {
    if (expandedRoles.size === roles.length) {
      setExpandedRoles(new Set());
    } else {
      setExpandedRoles(new Set(roles.map((_, idx) => idx.toString())));
    }
  };

  // Calculate total permissions (deduplicated)
  const allPermissions = new Map<string, Permission & { sources: string[] }>();
  
  roles.forEach((role) => {
    role.permissions.forEach((perm) => {
      const key = `${perm.resource}:${perm.action}`;
      if (!allPermissions.has(key)) {
        allPermissions.set(key, {
          ...perm,
          sources: [role.roleName],
        });
      } else {
        const existing = allPermissions.get(key)!;
        existing.sources.push(role.roleName);
      }
    });
  });

  const uniquePermissions = Array.from(allPermissions.values());

  // Group permissions by resource
  const permissionsByResource = uniquePermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, (Permission & { sources: string[] })[]>
  );

  const hasNoRoles = roles.length === 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Effective Permissions for {memberName}
          </CardTitle>
          <CardDescription>
            All permissions from assigned custom roles and organization role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Organization Role</p>
              <Badge variant="default" className="capitalize">
                {organizationRole}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Custom Roles</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Total Permissions
              </p>
              <p className="text-2xl font-bold">{uniquePermissions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Roles Message */}
      {hasNoRoles && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  No Custom Roles Assigned
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This member only has permissions from their organization role ({organizationRole}).
                  Assign custom roles to grant additional module-specific permissions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Breakdown */}
      {!hasNoRoles && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roles Breakdown</CardTitle>
                <CardDescription>
                  View permissions from each assigned role
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
              >
                {expandedRoles.size === roles.length
                  ? "Collapse All"
                  : "Expand All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role, idx) => {
              const roleId = idx.toString();
              const isExpanded = expandedRoles.has(roleId);

              return (
                <Collapsible
                  key={roleId}
                  open={isExpanded}
                  onOpenChange={() => toggleRole(roleId)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{role.roleName}</span>
                                {role.isPredefined && (
                                  <Badge variant="secondary" className="text-xs">
                                    Predefined
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {role.moduleName} • {role.permissions.length}{" "}
                                permission
                                {role.permissions.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Resource</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {role.permissions.map((perm, permIdx) => (
                              <TableRow key={permIdx}>
                                <TableCell className="font-medium capitalize">
                                  {perm.resource}
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {perm.action}
                                  </code>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {perm.description || "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Consolidated Permissions */}
      {!hasNoRoles && (
        <Card>
          <CardHeader>
            <CardTitle>All Permissions (Consolidated)</CardTitle>
            <CardDescription>
              Unique permissions across all roles, showing which roles grant each
              permission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissionsByResource).map(
                ([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <h4 className="font-semibold text-sm capitalize bg-muted px-3 py-2 rounded">
                      {resource}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Action</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[250px]">
                            Granted By
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {perms.map((perm, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {perm.action}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {perm.description || "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {perm.sources.map((source, sourceIdx) => (
                                  <Badge
                                    key={sourceIdx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
