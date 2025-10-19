import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">Common reasons:</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• The URL might be incorrect or outdated</li>
            <li>• The page may have been removed or renamed</li>
            <li>• You might not have permission to access this page</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button asChild variant="outline">
            <Link href="/auth/login">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Error 404 - If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
