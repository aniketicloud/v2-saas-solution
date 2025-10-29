"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createCustomRoleAction } from "../../actions";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { PermissionMatrix } from "../../_components/permission-matrix";
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
}

interface CreateRoleFormProps {
  organizationId: string;
  organizationSlug: string;
  modules: Module[];
  preSelectedModuleId?: string;
}

export function CreateRoleForm({
  organizationId,
  organizationSlug,
  modules,
  preSelectedModuleId,
}: CreateRoleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [moduleId, setModuleId] = useState<string>(preSelectedModuleId || "");
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const selectedModule = modules.find((m) => m.id === moduleId);

  // Set module if pre-selected
  useEffect(() => {
    if (preSelectedModuleId && !moduleId) {
      setModuleId(preSelectedModuleId);
    }
  }, [preSelectedModuleId, moduleId]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    if (!selectedModule) return;
    setSelectedPermissions(selectedModule.permissions.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    if (!moduleId) {
      toast.error("Please select a module");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setIsLoading(true);

    try {
      const selectedModule = modules.find((m) => m.id === moduleId);
      if (!selectedModule) {
        toast.error("Invalid module selected");
        setIsLoading(false);
        return;
      }

      const result = await createCustomRoleAction({
        organizationId,
        moduleSlug: selectedModule.slug,
        name: roleName.trim(),
        description: description.trim() || undefined,
        permissionIds: selectedPermissions,
      });

      if (result.success) {
        toast.success(`Role "${roleName}" created successfully`);
        router.push(`/org/${organizationSlug}/roles`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/org/${organizationSlug}/roles`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Create Custom Role
        </h1>
        <p className="text-muted-foreground mt-2">
          Define a new role with specific permissions for a module
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Module & Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Basic information about the role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Module Selection */}
            <div className="space-y-2">
              <Label htmlFor="module">
                Module *
                {preSelectedModuleId && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Pre-selected)
                  </span>
                )}
              </Label>
              <Select
                value={moduleId}
                onValueChange={setModuleId}
                disabled={!!preSelectedModuleId || isLoading}
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select a module">
                    {selectedModule
                      ? `${selectedModule.name} (${selectedModule.permissions.length} permissions)`
                      : "Select a module"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name} ({module.permissions.length} permissions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preSelectedModuleId && (
                <p className="text-xs text-muted-foreground">
                  Creating role for this module. Module cannot be changed.
                </p>
              )}
            </div>

            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Content Manager, Task Coordinator"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                A clear, descriptive name for this role
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role can do and who should have it..."
                rows={3}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Help others understand the purpose of this role
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        {selectedModule && (
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select which permissions this role should have for{" "}
                {selectedModule.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                permissions={selectedModule.permissions}
                selectedPermissionIds={selectedPermissions}
                onPermissionToggle={handlePermissionToggle}
                disabled={isLoading}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
            </CardContent>
          </Card>
        )}

        {/* No Module Selected Message */}
        {!selectedModule && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Please select a module to configure permissions
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Link href={`/org/${organizationSlug}/roles`}>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || !moduleId || !roleName.trim()}
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Role
          </Button>
        </div>
      </form>
    </div>
  );
}
