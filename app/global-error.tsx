"use client";

import { useEffect } from "react";
import { AlertTriangle, Database, RefreshCw, Home } from "lucide-react";
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

  // Check if this is a database connection error
  const isDatabaseError =
    error.message?.includes("Can't reach database") ||
    error.message?.includes("database server") ||
    error.message?.includes("PrismaClient") ||
    error.message?.includes("Failed to get session");

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="mx-auto max-w-lg space-y-6 p-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              {isDatabaseError ? (
                <Database className="h-8 w-8 text-destructive" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                {isDatabaseError
                  ? "Database Connection Error"
                  : "Something Went Wrong"}
              </h1>
              <p className="text-muted-foreground">
                {isDatabaseError
                  ? "Unable to connect to the database. Please check your database connection and try again."
                  : "We encountered an unexpected error. Please try again."}
              </p>
            </div>

            {isDatabaseError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                <h2 className="font-semibold text-sm flex items-center gap-2 text-destructive">
                  <Database className="h-4 w-4" />
                  Database Connection Failed
                </h2>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Ensure your database server is running</li>
                  <li>
                    Check your database connection string in{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      .env
                    </code>
                  </li>
                  <li>Verify network connectivity to the database</li>
                </ul>
              </div>
            )}

            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h2 className="font-semibold text-sm">Error Details:</h2>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message || "Unknown error occurred"}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={reset}
                variant="default"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "/";
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="rounded-lg border bg-muted/50 p-4">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Stack Trace (Development Only)
                </summary>
                <pre className="text-xs overflow-auto max-h-48 mt-2">
                  {error.stack}
                </pre>
              </details>
            )}

            <p className="text-xs text-center text-muted-foreground">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
