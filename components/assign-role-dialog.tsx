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
import { Badge } from "@/components/ui/badge";
import { assignRoleToMemberAction } from "../app/(organization)/org/[slug]/roles/actions";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isPredefined: boolean;
  module: {
    id: string;
    name: string;
  };
}

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string;
    name: string;
    email: string;
  };
  availableRoles: Role[];
  assignedRoleIds: string[];
  organizationId: string;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  member,
  availableRoles,
  assignedRoleIds,
  organizationId,
}: AssignRoleDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // Filter out already assigned roles
  const unassignedRoles = availableRoles.filter(
    (role) => !assignedRoleIds.includes(role.id)
  );

  // Group roles by module
  const rolesByModule = unassignedRoles.reduce(
    (acc, role) => {
      const moduleName = role.module.name;
      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(role);
      return acc;
    },
    {} as Record<string, Role[]>
  );

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const result = await assignRoleToMemberAction({
        organizationId,
        memberId: member.id,
        roleId: selectedRoleId,
      });

      if (result.success) {
        const assignedRole = availableRoles.find((r) => r.id === selectedRoleId);
        toast.success(
          `Role "${assignedRole?.name}" assigned to ${member.name}`
        );
        setSelectedRoleId("");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to assign role");
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRoleId("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role to {member.name}</DialogTitle>
          <DialogDescription>
            Select a custom role to assign to this member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {unassignedRoles.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                All available roles are already assigned to this member
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Role</label>
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(rolesByModule).map(([moduleName, roles]) => (
                      <div key={moduleName}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {moduleName}
                        </div>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <span>{role.name}</span>
                              {role.isPredefined && (
                                <Badge variant="secondary" className="text-xs">
                                  Predefined
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoleId && (
                <div className="rounded-lg bg-muted p-3">
                  {(() => {
                    const selectedRole = availableRoles.find(
                      (r) => r.id === selectedRoleId
                    );
                    return (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {selectedRole?.name}
                        </p>
                        {selectedRole?.description && (
                          <p className="text-xs text-muted-foreground">
                            {selectedRole.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Module: {selectedRole?.module.name}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
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
          {unassignedRoles.length > 0 && (
            <Button
              onClick={handleAssign}
              disabled={isLoading || !selectedRoleId}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Role
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
