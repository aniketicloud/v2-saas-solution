import { headers } from "next/headers";
import { requireAdmin } from "@/lib/session";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  ArrowLeft,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { getUserById } from "../_lib/actions";
import {
  UserEditForm,
  UserBanDialog,
  UserUnbanButton,
  UserSessionsCard,
  UserImpersonateButton,
  UserDeleteDialog,
} from "../_components/user-detail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Details | Admin Portal",
  description: "View and manage user details",
};

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  
  // Ensure admin session
  await requireAdmin({ headers: await headers() });

  // Fetch user data
  const result = await getUserById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  // Format dates
  const createdDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedDate = new Date(user.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name || user.email}
        description={`User ID: ${user.id}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-4 w-4" />
                Name
              </label>
              <p className="mt-1">{user.name || "Not set"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="mt-1">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Role
              </label>
              <div className="mt-1">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role || "user"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1 space-y-2">
                <Badge variant={user.emailVerified ? "default" : "outline"}>
                  {user.emailVerified ? "Email Verified" : "Email Not Verified"}
                </Badge>
                {user.banned && (
                  <Badge variant="destructive" className="ml-2">
                    <Ban className="h-3 w-3 mr-1" />
                    Banned
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created At
              </label>
              <p className="mt-1 text-sm">{createdDate}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated At
              </label>
              <p className="mt-1 text-sm">{updatedDate}</p>
            </div>

            {user.banned && user.banReason && (
              <div>
                <label className="text-sm font-medium text-destructive flex items-center gap-1">
                  <Ban className="h-4 w-4" />
                  Ban Reason
                </label>
                <p className="mt-1 text-sm">{user.banReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Edit User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserEditForm user={user} />
          </CardContent>
        </Card>
      </div>

      {/* User Sessions */}
      <UserSessionsCard userId={user.id} />

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <UserImpersonateButton userId={user.id} userName={user.name || user.email} />
            
            {user.banned ? (
              <UserUnbanButton userId={user.id} />
            ) : (
              <UserBanDialog userId={user.id} userName={user.name || user.email} />
            )}

            <UserDeleteDialog userId={user.id} userName={user.name || user.email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
