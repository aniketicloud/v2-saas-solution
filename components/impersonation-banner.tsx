"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, X } from "lucide-react";
import { stopImpersonation } from "@/app/(admin)/admin/users/_lib/actions";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export function ImpersonationBanner() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is being impersonated
  // Better Auth stores impersonation info in session.session.impersonatedBy
  const isImpersonating = session?.session?.impersonatedBy;

  // Don't render if not impersonating
  if (!isImpersonating) {
    return null;
  }

  async function handleStopImpersonation() {
    setIsLoading(true);
    try {
      const result = await stopImpersonation();
      if (result.success) {
        toast.success("Impersonation stopped");
        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error("Failed to stop impersonation");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-destructive/10 border-destructive/20 border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            You are currently impersonating a user
          </span>
        </div>
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
  );
}
