"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-muted/50">
          <div className="mx-auto max-w-md space-y-6 p-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Something Went Wrong
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h2 className="font-semibold text-sm">Error Details:</h2>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message || "Unknown error occurred"}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Go Home
              </Button>
              <Button onClick={reset}>
                Try Again
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
