"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { unbanUser } from "../../_lib/actions";
import { ShieldCheck } from "lucide-react";

interface UserUnbanButtonProps {
  userId: string;
}

export function UserUnbanButton({ userId }: UserUnbanButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleUnban() {
    setIsLoading(true);
    try {
      const result = await unbanUser(userId);

      if (result.success) {
        toast.success("User has been unbanned");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unban user");
      }
    } catch (error) {
      toast.error("An error occurred while unbanning the user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleUnban} disabled={isLoading} variant="default">
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Unbanning...
        </>
      ) : (
        <>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Unban User
        </>
      )}
    </Button>
  );
}
