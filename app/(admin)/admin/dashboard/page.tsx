import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Building2, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Admin Portal",
  description: "Admin dashboard overview with statistics and recent activity",
};

export default async function AdminDashboardPage() {
  // Fetch session to get admin user details
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Mock data for statistics (to be replaced with real data later)
  const stats = {
    totalOrganizations: 24,
    totalUsers: 156,
    activeSessions: 89,
  };

  // Mock data for recent organizations
  const recentOrganizations = [
    {
      id: "1",
      name: "Acme Corporation",
      slug: "acme-corp",
      members: 12,
      createdAt: "2025-10-10",
    },
    {
      id: "2",
      name: "Tech Innovations",
      slug: "tech-innovations",
      members: 8,
      createdAt: "2025-10-11",
    },
    {
      id: "3",
      name: "Digital Solutions",
      slug: "digital-solutions",
      members: 15,
      createdAt: "2025-10-12",
    },
    {
      id: "4",
      name: "Global Enterprises",
      slug: "global-enterprises",
      members: 20,
      createdAt: "2025-10-13",
    },
  ];

  // Mock data for recent users
  const recentUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      createdAt: "2025-10-10",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      createdAt: "2025-10-11",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "user",
      createdAt: "2025-10-12",
    },
    {
      id: "4",
      name: "Alice Williams",
      email: "alice@example.com",
      role: "admin",
      createdAt: "2025-10-13",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${
          session?.user?.name || session?.user?.email
        }`}
      />

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active organizations in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active user sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations Table */}
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Organizations</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/organizations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Members
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrganizations.map((org) => (
                    <tr key={org.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{org.name}</td>
                      <td className="py-3 px-4 text-gray-600">{org.slug}</td>
                      <td className="py-3 px-4">{org.members}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {org.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Table */}
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
