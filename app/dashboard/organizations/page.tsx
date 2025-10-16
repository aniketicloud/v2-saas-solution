import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { CreateOrganizationDialog } from "./_components/CreateOrganizationDialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OrganizationPage() {
  // Check if user is admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user?.role === "admin";

  //TODO: Redirect non-admin users to root where we can manage where to redirect them
  if (!isAdmin) {
    redirect("/");
  }

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Management
          </h1>
          <p className="text-muted-foreground">
            Manage your organizations and their members
          </p>
        </div>
        <CreateOrganizationDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {!organizations || organizations.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No organizations found. Create your first organization to get
                started.
              </p>
            </CardContent>
          </Card>
        ) : (
          organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle>{org.name}</CardTitle>
                      <CardDescription className="mt-1">
                        @{org.slug}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Slug</span>
                    <span className="font-mono text-xs">{org.slug}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-xs">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {org.metadata && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Metadata</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                  >
                    Manage Organization
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
