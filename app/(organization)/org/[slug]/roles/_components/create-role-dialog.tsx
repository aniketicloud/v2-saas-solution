"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomRoleAction } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PermissionMatrix } from "./permission-matrix";

interface Module {
  id: string;
  name: string;
  slug: string;
  permissions: Array<{
    id: string;
    resource: string;
    action: string;
    description: string | null;
  }>;
}

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: Module[];
  selectedModuleId: string | null;
  organizationId: string;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  modules,
  selectedModuleId,
  organizationId,
}: CreateRoleDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [moduleId, setModuleId] = useState<string>(selectedModuleId || "");
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRoleName("");
      setDescription("");
      setSelectedPermissions([]);
      if (!selectedModuleId) {
        setModuleId("");
      }
    } else if (selectedModuleId) {
      setModuleId(selectedModuleId);
    }
    onOpenChange(newOpen);
  };

  const selectedModule = modules.find((m) => m.id === moduleId);

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
        handleOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions for a module
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Module Selection */}
            <div className="space-y-2">
              <Label htmlFor="module">Module *</Label>
              <Select
                value={moduleId}
                onValueChange={setModuleId}
                disabled={!!selectedModuleId || isLoading}
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name} ({module.permissions.length} permissions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Content Manager"
                disabled={isLoading}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role can do..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Permissions */}
            {selectedModule && (
              <PermissionMatrix
                permissions={selectedModule.permissions}
                selectedPermissionIds={selectedPermissions}
                onPermissionToggle={handlePermissionToggle}
                disabled={isLoading}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !moduleId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
