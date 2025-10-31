"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Users, Pencil, Trash2 } from "lucide-react";
import { deleteTeam } from "@/lib/actions/teams";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Office {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  _count: {
    teammembers: number;
  };
}

interface TeamsTableProps {
  teams: Office[];
  organizationSlug: string;
  organizationId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function TeamsTable({
  teams,
  organizationSlug,
  organizationId,
  canEdit,
  canDelete,
}: TeamsTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Office | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteTeam({
        teamId: teamToDelete.id,
        organizationId,
      });

      if (result.success) {
        toast.success("Office deleted successfully");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete office");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the office");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Office Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              {(canEdit || canDelete) && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit || canDelete ? 5 : 4}
                  className="text-center py-8"
                >
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No offices yet. Create your first office to get started.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow
                  key={team.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(`/org/${organizationSlug}/teams/${team.id}`)
                  }
                >
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {team._count.teammembers}{" "}
                      {team._count.teammembers === 1 ? "member" : "members"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(team.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {team.updatedAt
                      ? formatDistanceToNow(new Date(team.updatedAt), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/org/${organizationSlug}/teams/${team.id}`
                                  )
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Office
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/org/${organizationSlug}/teams/${team.id}/members`
                                  )
                                }
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Manage Members
                              </DropdownMenuItem>
                            </>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setTeamToDelete(team);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Office
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the office &quot;{teamToDelete?.name}
              &quot; and remove all its members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Office"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
