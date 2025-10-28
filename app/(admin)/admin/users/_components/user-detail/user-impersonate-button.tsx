"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { impersonateUser } from "../../_lib/actions";
import { Eye } from "lucide-react";

interface UserImpersonateButtonProps {
  userId: string;
  userName: string;
}

export function UserImpersonateButton({
  userId,
  userName,
}: UserImpersonateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleImpersonate() {
    setIsLoading(true);
    try {
      const result = await impersonateUser(userId);

      if (result.success) {
        toast.success(`Now impersonating ${userName}`);
        // Redirect to dashboard as the impersonated user
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to impersonate user");
      }
    } catch (error) {
      toast.error("An error occurred while impersonating");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Impersonate User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Impersonate User?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be logged in as {userName}. All actions will be performed as
            this user until you stop impersonating. Use this feature responsibly.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleImpersonate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Impersonating...
              </>
            ) : (
              "Start Impersonation"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
