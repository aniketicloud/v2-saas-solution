"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Building2,
  Users,
  UserPlus,
  Calendar,
  Trash2,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { deleteOrganization } from "../../../_lib/actions";
import { tryCatch } from "@/utils/try-catch";

interface DeleteOrganizationFormProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    teamCount: number;
    invitationCount: number;
    createdAt: Date;
  };
}

export function DeleteOrganizationForm({
  organization,
}: DeleteOrganizationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedConfirmText = organization.name;
  const isConfirmValid = confirmText === expectedConfirmText;

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setConfirmText("");
  };

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);

    const [result, err] = await tryCatch(deleteOrganization(organization.id));

    if (err) {
      console.error("Delete organization error:", err);
      toast.error("An unexpected error occurred");
      setIsDeleting(false);
      return;
    }

    if (result?.success) {
      toast.success(`Organization "${organization.name}" has been deleted`, {
        description: `Slug: @${organization.slug} • ${organization.memberCount} members removed`,
      });
      router.push("/admin/organizations");
      router.refresh();
    } else {
      toast.error("Failed to delete organization", {
        description: result?.error,
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 1
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          1
        </div>
        <div
          className={`h-px flex-1 ${step >= 2 ? "bg-destructive" : "bg-muted"}`}
        />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 2
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Warning Header */}
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-semibold text-destructive">
                Warning: This action cannot be undone
              </h3>
              <p className="text-sm text-muted-foreground">
                Deleting this organization will permanently remove all
                associated data including members, teams, and invitations.
              </p>
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              You are about to delete the following organization:
            </h3>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-lg">{organization.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{organization.slug}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-lg font-semibold">
                      {organization.memberCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teams</p>
                    <p className="text-lg font-semibold">
                      {organization.teamCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Pending Invitations
                    </p>
                    <p className="text-lg font-semibold">
                      {organization.invitationCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(organization.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              What will be deleted:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• All organization data and settings</li>
              <li>
                • {organization.memberCount} member
                {organization.memberCount !== 1 ? "s" : ""} (
                {organization.memberCount === 0
                  ? "none"
                  : "will lose access to this organization"}{" "}
                )
              </li>
              <li>
                • {organization.teamCount} team
                {organization.teamCount !== 1 ? "s" : ""} and related data
              </li>
              <li>
                • {organization.invitationCount} pending invitation
                {organization.invitationCount !== 1 ? "s" : ""}
              </li>
              <li>• Organization slug will become available for reuse</li>
            </ul>
          </div>

          {/* TODO: Future Improvements */}
          {/* 
          TODO: Future improvements to implement:
          - Send email notifications to all affected members
          - Option for soft delete with recovery period (30 days grace period)
          - Audit trail logging for compliance
          - Export organization data before deletion
          - Check for active subscriptions/billing
          */}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" asChild>
              <a href={`/admin/organizations/${organization.id}`}>Cancel</a>
            </Button>
            <Button variant="destructive" onClick={handleNext}>
              Continue to Confirmation
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Final Confirmation */}
          <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/5 p-4">
            <Trash2 className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-semibold text-destructive">
                Final Confirmation Required
              </h3>
              <p className="text-sm text-muted-foreground">
                This is the final step. Once you delete this organization, there
                is no going back.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Type the organization name to confirm:
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please type{" "}
                <span className="font-mono font-semibold">
                  {expectedConfirmText}
                </span>{" "}
                to confirm deletion.
              </p>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={expectedConfirmText}
                className={
                  confirmText && !isConfirmValid
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                autoFocus
                disabled={isDeleting}
              />
              {confirmText && !isConfirmValid && (
                <p className="text-sm text-destructive mt-2">
                  The organization name doesn't match. Please try again.
                </p>
              )}
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">You are deleting:</p>
              <p className="font-semibold text-lg">{organization.name}</p>
              <p className="text-sm text-muted-foreground">
                @{organization.slug}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isDeleting}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Organization
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
