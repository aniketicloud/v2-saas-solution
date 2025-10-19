import { Building2, Mail } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default function NoOrganizationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            No Organization Membership
          </h1>
          <p className="text-muted-foreground">
            You're not currently a member of any organization. To access the dashboard and organization features, you need to be invited to or join an organization.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            What's next?
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Wait for an organization administrator to invite you</li>
            <li>• Check your email for pending invitations</li>
            <li>• Contact your team administrator for access</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <SignOutButton variant="outline" />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Need help? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
