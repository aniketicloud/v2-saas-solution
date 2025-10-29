"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  MoreVertical,
  Shield,
  ShieldAlert,
  User,
  Trash2,
  UserCog,
  Eye,
} from "lucide-react";
import { useState } from "react";
import {
  removeMemberAction,
  updateMemberRoleAction,
} from "@/lib/actions/members";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MemberRoleBadges } from "./member-role-badges";
import { AssignRoleDialog } from "./assign-role-dialog";

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

interface Member {
  id: string;
  role: string;
  userId: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: Date | string;
  };
  customRoles?: MemberRole[];
}

interface AvailableRole {
  id: string;
  name: string;
  description: string | null;
  isPredefined: boolean;
  module: {
    id: string;
    name: string;
  };
}

interface MembersTableProps {
  members: Member[];
  organizationId: string;
  organizationSlug: string;
  canEdit: boolean;
  currentUserId?: string;
  availableRoles?: AvailableRole[];
}

const roleConfig = {
  owner: {
    label: "Owner",
    variant: "default" as const,
    icon: ShieldAlert,
    color: "text-purple-600",
  },
  admin: {
    label: "Admin",
    variant: "secondary" as const,
    icon: Shield,
    color: "text-blue-600",
  },
  member: {
    label: "Member",
    variant: "outline" as const,
    icon: User,
    color: "text-gray-600",
  },
};

export function MembersTable({
  members,
  organizationId,
  organizationSlug,
  canEdit,
  currentUserId,
  availableRoles = [],
}: MembersTableProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [memberToUpdateRole, setMemberToUpdateRole] = useState<{
    member: Member;
    newRole: "admin" | "member";
  } | null>(null);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [memberToAssignRole, setMemberToAssignRole] = useState<Member | null>(
    null
  );

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsLoading(true);
    try {
      const result = await removeMemberAction(
        memberToRemove.id,
        organizationId
      );

      if (result.success) {
        toast.success("Member removed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    } catch (error) {
      toast.error("An error occurred while removing the member");
      console.error(error);
    } finally {
      setIsLoading(false);
      setMemberToRemove(null);
    }
  };

  const handleUpdateRole = async () => {
    if (!memberToUpdateRole) return;

    setIsLoading(true);
    try {
      const result = await updateMemberRoleAction(
        memberToUpdateRole.member.id,
        organizationId,
        memberToUpdateRole.newRole
      );

      if (result.success) {
        toast.success("Member role updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update member role");
      }
    } catch (error) {
      toast.error("An error occurred while updating the member role");
      console.error(error);
    } finally {
      setIsLoading(false);
      setMemberToUpdateRole(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Custom Roles</TableHead>
              <TableHead>Joined</TableHead>
              {canEdit && <TableHead className="w-[70px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 4 : 3}
                  className="h-24 text-center"
                >
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const roleInfo =
                  roleConfig[member.role as keyof typeof roleConfig] ||
                  roleConfig.member;
                const RoleIcon = roleInfo.icon;
                const isCurrentUser = member.userId === currentUserId;

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {member.user.image ? (
                            <img
                              src={member.user.image}
                              alt={member.user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.user.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleInfo.variant} className="gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <MemberRoleBadges
                        memberRoles={member.customRoles || []}
                        memberId={member.id}
                        organizationId={organizationId}
                        canEdit={canEdit}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(member.createdAt)}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        {!isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Link
                                href={`/org/${organizationSlug}/members/${member.id}/permissions`}
                              >
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Permissions
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setMemberToAssignRole(member);
                                  setAssignRoleDialogOpen(true);
                                }}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Assign Custom Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  setMemberToUpdateRole({
                                    member,
                                    newRole: "admin",
                                  })
                                }
                                disabled={member.role === "admin"}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  setMemberToUpdateRole({
                                    member,
                                    newRole: "member",
                                  })
                                }
                                disabled={member.role === "member"}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setMemberToRemove(member)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.user.name}</strong> from this
              organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Role Dialog */}
      <AlertDialog
        open={!!memberToUpdateRole}
        onOpenChange={() => setMemberToUpdateRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Member Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change{" "}
              <strong>{memberToUpdateRole?.member.user.name}</strong>'s role to{" "}
              <strong>
                {memberToUpdateRole &&
                  roleConfig[
                    memberToUpdateRole.newRole as keyof typeof roleConfig
                  ]?.label}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRole} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Role Dialog */}
      {memberToAssignRole && (
        <AssignRoleDialog
          open={assignRoleDialogOpen}
          onOpenChange={setAssignRoleDialogOpen}
          member={{
            id: memberToAssignRole.id,
            name: memberToAssignRole.user.name,
            email: memberToAssignRole.user.email,
          }}
          availableRoles={availableRoles}
          assignedRoleIds={
            memberToAssignRole.customRoles?.map((r) => r.customRole.id) || []
          }
          organizationId={organizationId}
        />
      )}
    </>
  );
}
