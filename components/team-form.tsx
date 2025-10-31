"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTeam, updateTeam } from "@/lib/actions/teams";
import { toast } from "sonner";

interface TeamFormProps {
  organizationId: string;
  organizationSlug: string;
  team?: {
    id: string;
    name: string;
  };
  mode: "create" | "edit";
}

export function TeamForm({
  organizationId,
  organizationSlug,
  team,
  mode,
}: TeamFormProps) {
  const router = useRouter();
  const [name, setName] = useState(team?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Office name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (mode === "create") {
        result = await createTeam({
          name: name.trim(),
          organizationId,
        });
      } else {
        result = await updateTeam({
          teamId: team!.id,
          name: name.trim(),
          organizationId,
        });
      }

      if (result.success) {
        toast.success(
          `Office ${mode === "create" ? "created" : "updated"} successfully`
        );
        router.push(`/org/${organizationSlug}/teams`);
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${mode} office`);
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${
          mode === "create" ? "creating" : "updating"
        } the office`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create New Office" : "Edit Office"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new office within your organization"
            : "Update the office information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Office Name</Label>
            <Input
              id="name"
              placeholder="Enter office name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
              required
            />
            <p className="text-sm text-muted-foreground">
              Choose a descriptive name for your office
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Office"
                : "Update Office"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
