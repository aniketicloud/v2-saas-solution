"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { banUser } from "../../_lib/actions";
import { Ban } from "lucide-react";

interface UserBanDialogProps {
  userId: string;
  userName: string;
}

export function UserBanDialog({ userId, userName }: UserBanDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("");

  async function handleBan() {
    if (!reason.trim()) {
      toast.error("Please provide a reason for banning");
      return;
    }

    setIsLoading(true);
    try {
      const expiresIn = expiresInDays
        ? parseInt(expiresInDays) * 24 * 60 * 60 // Convert days to seconds
        : undefined;

      const result = await banUser({
        userId,
        reason,
        expiresIn,
      });

      if (result.success) {
        toast.success(`User ${userName} has been banned`);
        setOpen(false);
        setReason("");
        setExpiresInDays("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to ban user");
      }
    } catch (error) {
      toast.error("An error occurred while banning the user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Ban className="mr-2 h-4 w-4" />
          Ban User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {userName} from accessing the platform. This action can be reversed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Ban Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Violation of terms of service..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expires In (Days)</Label>
            <Input
              id="expires"
              type="number"
              placeholder="Leave empty for permanent ban"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for permanent ban
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBan}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Banning...
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
