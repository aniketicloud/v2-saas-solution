"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Shield } from "lucide-react";
import { removeRoleFromMemberAction } from "@/app/(organization)/org/[slug]/roles/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MemberRole {
  id: string;
  customRole: {
    id: string;
    name: string;
    isPredefined: boolean;
    organizationModule: {
      module: {
        name: string;
      };
    };
  };
}

interface MemberRoleBadgesProps {
  memberRoles: MemberRole[];
  memberId: string;
  organizationId: string;
  canEdit: boolean;
}

export function MemberRoleBadges({
  memberRoles,
  memberId,
  organizationId,
  canEdit,
}: MemberRoleBadgesProps) {
  const router = useRouter();
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    setRemovingRoleId(roleId);

    try {
      const result = await removeRoleFromMemberAction({
        organizationId,
        memberId,
        roleId,
      });

      if (result.success) {
        toast.success(`Role "${roleName}" removed`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove role");
      }
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setRemovingRoleId(null);
    }
  };

  if (memberRoles.length === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>No custom roles</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {memberRoles.map((memberRole) => {
          const role = memberRole.customRole;
          const isRemoving = removingRoleId === role.id;

          return (
            <Tooltip key={memberRole.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant={role.isPredefined ? "secondary" : "outline"}
                  className="gap-1 pr-1"
                >
                  <span className="text-xs">{role.name}</span>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRole(role.id, role.name);
                      }}
                      disabled={isRemoving}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <p className="font-medium">{role.name}</p>
                  <p className="text-muted-foreground">
                    Module: {role.organizationModule.module.name}
                  </p>
                  {role.isPredefined && (
                    <p className="text-muted-foreground">Predefined role</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
