"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export function ImpersonationBanner() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Don't render if session is loading or there's an error (like database down)
  if (isPending || error) {
    return null;
  }

  // Check if current session is an impersonated session
  // When impersonating, session.session.impersonatedBy contains the admin's userId
  const isImpersonating =
    session?.session?.impersonatedBy !== null &&
    session?.session?.impersonatedBy !== undefined;

  // Don't render if not impersonating
  if (!isImpersonating) {
    return null;
  }

  async function handleStopImpersonation() {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.admin.stopImpersonating({});

      if (error) {
        toast.error(error.message || "Failed to stop impersonation");
        setIsLoading(false);
        return;
      }

      toast.success("Impersonation stopped");
      // Use window.location for full page reload
      window.location.href = "/admin/users";
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-destructive/10 border-destructive/20 border-b px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            You are currently impersonating a user
          </span>
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStopImpersonation}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Stop Impersonation
          </Button>
        </div>
      </div>
    </div>
  );
}
