"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCustomRoleAction } from "../actions";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: {
    id: string;
    name: string;
    memberCount: number;
    isPredefined: boolean;
  };
  organizationId: string;
  organizationSlug: string;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  organizationId,
  organizationSlug,
}: DeleteRoleDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = !role.isPredefined && role.memberCount === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteCustomRoleAction({
        organizationId,
        roleId: role.id,
      });

      if (result.success) {
        toast.success(`Role "${role.name}" deleted successfully`);
        onOpenChange(false);
        router.push(`/org/${organizationSlug}/roles`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Role: {role.name}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {role.isPredefined && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-destructive">
                    ❌ Cannot delete predefined role
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Predefined roles (Admin, Editor, Viewer) are system-managed
                    and cannot be deleted. They are automatically created when
                    modules are assigned to organizations.
                  </p>
                </div>
              )}

              {!role.isPredefined && role.memberCount > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-destructive">
                    ❌ Cannot delete role with assigned members
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This role is currently assigned to {role.memberCount}{" "}
                    {role.memberCount === 1 ? "member" : "members"}. Remove all
                    members from this role before deleting it.
                  </p>
                </div>
              )}

              {canDelete && (
                <div className="space-y-2">
                  <p className="text-sm">
                    Are you sure you want to delete this role? This action
                    cannot be undone.
                  </p>
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium">
                      What will happen:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>The role will be permanently deleted</li>
                      <li>All permission assignments will be removed</li>
                      <li>This action cannot be reversed</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
