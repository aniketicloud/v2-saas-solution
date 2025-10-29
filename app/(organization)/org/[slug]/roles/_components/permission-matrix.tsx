"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

interface PermissionMatrixProps {
  permissions: Permission[];
  selectedPermissionIds: string[];
  onPermissionToggle: (permissionId: string) => void;
  disabled?: boolean;
  showSelectAll?: boolean;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function PermissionMatrix({
  permissions,
  selectedPermissionIds,
  onPermissionToggle,
  disabled = false,
  showSelectAll = true,
  onSelectAll,
  onDeselectAll,
}: PermissionMatrixProps) {
  // Group permissions by resource
  const permissionsByResource = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const resources = Object.keys(permissionsByResource).sort();

  // Calculate selection stats
  const totalPermissions = permissions.length;
  const selectedCount = selectedPermissionIds.length;
  const allSelected = selectedCount === totalPermissions;
  const noneSelected = selectedCount === 0;

  return (
    <div className="space-y-4">
      {/* Header with stats and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">Permissions</h3>
          <Badge variant={noneSelected ? "outline" : "secondary"}>
            {selectedCount} of {totalPermissions} selected
          </Badge>
        </div>

        {showSelectAll && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={disabled || allSelected}
            >
              <Check className="mr-1 h-3 w-3" />
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={disabled || noneSelected}
            >
              <X className="mr-1 h-3 w-3" />
              Deselect All
            </Button>
          </div>
        )}
      </div>

      {/* Permission Matrix Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-[180px]">Resource</TableHead>
              <TableHead className="w-[140px]">Action</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <>
                {permissionsByResource[resource].map((permission, idx) => {
                  const isSelected = selectedPermissionIds.includes(
                    permission.id
                  );
                  const isFirstInGroup = idx === 0;

                  return (
                    <TableRow
                      key={permission.id}
                      className={
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : undefined
                      }
                    >
                      <TableCell>
                        <Checkbox
                          id={permission.id}
                          checked={isSelected}
                          onCheckedChange={() =>
                            onPermissionToggle(permission.id)
                          }
                          disabled={disabled}
                        />
                      </TableCell>
                      <TableCell
                        className={
                          isFirstInGroup
                            ? "font-medium capitalize"
                            : "text-muted-foreground"
                        }
                      >
                        {isFirstInGroup ? resource : ""}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.action}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {permission.description || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {permissions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No permissions available
        </div>
      )}
    </div>
  );
}
