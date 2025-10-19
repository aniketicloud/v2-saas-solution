"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { tryCatch } from "@/utils/try-catch";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  variant = "outline",
  size = "default",
  className,
  children = "Sign Out",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const [, err] = await tryCatch(
      authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      })
    );

    if (err) console.error("Sign out error:", err);
    // Ensure redirect even if signOut failed
    router.push("/auth/login");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className}
    >
      {isSigningOut ? (
        <>
          <Spinner className="mr-2" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}
