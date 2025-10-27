"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Send } from "lucide-react";
import {
  addMemberDirectlyAction,
  inviteMemberAction,
} from "@/lib/actions/members";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddMemberDialogProps {
  organizationId: string;
  trigger?: React.ReactNode;
}

export function AddMemberDialog({
  organizationId,
  trigger,
}: AddMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [activeTab, setActiveTab] = useState<"direct" | "invite">("direct");

  const handleAddDirectly = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await addMemberDirectlyAction(email, organizationId, role);

      if (result.success) {
        toast.success(
          `${result.memberName || "Member"} has been added to the organization`
        );
        setEmail("");
        setRole("member");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("An error occurred while adding the member");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await inviteMemberAction(email, organizationId, role);

      if (result.success) {
        toast.success("Invitation sent successfully");
        setEmail("");
        setRole("member");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("An error occurred while sending the invitation");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Member to Organization</DialogTitle>
          <DialogDescription>
            Add an existing user directly or send an invitation email.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "direct" | "invite")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Directly
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Send className="mr-2 h-4 w-4" />
              Send Invite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4 mt-4">
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Add a user who already has an account. They will be added
              immediately without requiring acceptance.
            </div>
            <form onSubmit={handleAddDirectly} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-direct">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email-direct"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-direct">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value: "admin" | "member") => setRole(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role-direct">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === "admin"
                    ? "Admins can manage members and settings"
                    : "Members can view and participate"}
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4 mt-4">
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Send an invitation email. The user can accept the invitation to
              join the organization.
            </div>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-invite">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email-invite"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-invite">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value: "admin" | "member") => setRole(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role-invite">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === "admin"
                    ? "Admins can manage members and settings"
                    : "Members can view and participate"}
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
