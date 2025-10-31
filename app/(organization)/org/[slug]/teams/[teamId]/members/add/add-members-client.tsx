"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { addTeamMember } from "@/lib/actions/teams";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AvailableMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

interface AddTeamMembersClientProps {
  teamId: string;
  teamName: string;
  organizationId: string;
  organizationSlug: string;
  availableMembers: AvailableMember[];
}

export function AddTeamMembersClient({
  teamId,
  teamName,
  organizationId,
  organizationSlug,
  availableMembers,
}: AddTeamMembersClientProps) {
  const router = useRouter();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedMembers.size === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsSubmitting(true);

    try {
      const results = await Promise.all(
        Array.from(selectedMembers).map((userId) =>
          addTeamMember({
            teamId,
            userId,
            organizationId,
          })
        )
      );

      const failures = results.filter((r) => !r.success);

      if (failures.length === 0) {
        toast.success(
          `Successfully added ${selectedMembers.size} ${
            selectedMembers.size === 1 ? "member" : "members"
          }`
        );
        router.push(`/org/${organizationSlug}/teams/${teamId}/members`);
        router.refresh();
      } else if (failures.length < results.length) {
        toast.warning(
          `Added ${results.length - failures.length} members, but ${
            failures.length
          } failed`
        );
        router.refresh();
      } else {
        toast.error("Failed to add members");
      }
    } catch (error) {
      toast.error("An error occurred while adding members");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Add Members to ${teamName}`}
        description="Select organization members to add to this office"
      />

      <Card>
        <CardHeader>
          <CardTitle>Available Members</CardTitle>
          <CardDescription>
            {availableMembers.length > 0
              ? `Select members from your organization to add to this office`
              : `All organization members are already in this office`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableMembers.length > 0 ? (
            <>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleMember(member.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onCheckedChange={() => handleToggleMember(member.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="text-xs"
                        >
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedMembers.size === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Members...
                    </>
                  ) : (
                    `Add ${selectedMembers.size} ${
                      selectedMembers.size === 1 ? "Member" : "Members"
                    }`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-4">
                All organization members are already in this office.
              </p>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
