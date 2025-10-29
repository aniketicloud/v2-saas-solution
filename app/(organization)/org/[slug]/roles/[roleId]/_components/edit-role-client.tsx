"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionMatrix } from "../../_components/permission-matrix";
import { DeleteRoleDialog } from "../../_components/delete-role-dialog";
import {
  updateRoleDetailsAction,
  updateRolePermissionsAction,
} from "../../actions";
import { toast } from "sonner";
import { Save, Users, Shield, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

interface EditRoleClientProps {
  role: {
    id: string;
    name: string;
    description: string | null;
    isPredefined: boolean;
    isActive: boolean;
    memberCount: number;
    module: {
      id: string;
      name: string;
      slug: string;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    allPermissions: Permission[];
    selectedPermissions: Permission[];
  };
  organizationSlug: string;
}

export function EditRoleClient({ role, organizationSlug }: EditRoleClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Role details state
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const [detailsChanged, setDetailsChanged] = useState(false);

  // Permissions state
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    role.selectedPermissions.map((p) => p.id)
  );
  const [permissionsChanged, setPermissionsChanged] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setDetailsChanged(value !== role.name || description !== (role.description || ""));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setDetailsChanged(name !== role.name || value !== (role.description || ""));
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter((id) => id !== permissionId)
      : [...selectedPermissionIds, permissionId];

    setSelectedPermissionIds(newSelected);
    
    // Check if permissions changed
    const originalIds = role.selectedPermissions.map((p) => p.id).sort();
    const newIds = newSelected.sort();
    setPermissionsChanged(
      originalIds.length !== newIds.length ||
      originalIds.some((id, idx) => id !== newIds[idx])
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissionIds(role.allPermissions.map((p) => p.id));
    setPermissionsChanged(true);
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds([]);
    setPermissionsChanged(true);
  };

  const handleSaveDetails = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateRoleDetailsAction({
        organizationId: role.organization.id,
        roleId: role.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success("Role details updated successfully");
        setDetailsChanged(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role details");
      }
    } catch (error) {
      console.error("Error updating role details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (selectedPermissionIds.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateRolePermissionsAction({
        organizationId: role.organization.id,
        roleId: role.id,
        permissionIds: selectedPermissionIds,
      });

      if (result.success) {
        toast.success("Role permissions updated successfully");
        setPermissionsChanged(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role permissions");
      }
    } catch (error) {
      console.error("Error updating role permissions:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = detailsChanged || permissionsChanged;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4"
        >
          <Link href={`/org/${organizationSlug}/roles`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Link>
        </Button>

        <PageHeader
          title={`Edit Role: ${role.name}`}
          description={`Manage permissions and details for this role in ${role.module.name}`}
          action={
            !role.isPredefined && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={role.memberCount > 0}
                title={
                  role.memberCount > 0
                    ? "Cannot delete role with assigned members"
                    : "Delete role"
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Role
              </Button>
            )
          }
        />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Module</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{role.module.name}</div>
            <p className="text-xs text-muted-foreground">
              {role.allPermissions.length} available permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{role.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {role.memberCount === 1 ? "member has" : "members have"} this role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {role.isPredefined && (
                <Badge variant="secondary">Predefined</Badge>
              )}
              <Badge variant={role.isActive ? "default" : "destructive"}>
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Update the name and description of this role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Content Manager"
              disabled={isLoading || role.isPredefined}
            />
            {role.isPredefined && (
              <p className="text-xs text-muted-foreground">
                Predefined role names cannot be changed
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe what this role can do..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {detailsChanged && (
            <Button
              onClick={handleSaveDetails}
              disabled={isLoading || !name.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Details
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Select which permissions this role should have
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PermissionMatrix
            permissions={role.allPermissions}
            selectedPermissionIds={selectedPermissionIds}
            onPermissionToggle={handlePermissionToggle}
            disabled={isLoading}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />

          {permissionsChanged && (
            <Button
              onClick={handleSavePermissions}
              disabled={isLoading || selectedPermissionIds.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Permissions
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-900">
              ⚠️ You have unsaved changes. Make sure to save your changes before leaving this page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Role Dialog */}
      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={{
          id: role.id,
          name: role.name,
          memberCount: role.memberCount,
          isPredefined: role.isPredefined,
        }}
        organizationId={role.organization.id}
        organizationSlug={organizationSlug}
      />
    </div>
  );
}
