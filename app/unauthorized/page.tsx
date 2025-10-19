import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have the required permissions to access this resource.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">Common reasons:</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• You need admin role to access admin routes</li>
            <li>• You're not a member of this organization</li>
            <li>• Your account doesn't have sufficient privileges</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button asChild variant="outline">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          If you believe this is an error, contact your system administrator.
        </p>
      </div>
    </div>
  );
}
