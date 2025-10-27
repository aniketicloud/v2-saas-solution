import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Users, FolderKanban, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgDashboardProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrgDashboard({ params }: OrgDashboardProps) {
  // Await params (Next.js 15 requirement)
  const { slug } = await params;

  // Fetch full organization data
  const organization = await auth.api.getFullOrganization({
    query: {
      organizationSlug: slug,
    },
    headers: await headers(),
  });

  // Fetch active member data to get current user's role
  const activeMember = await auth.api.getActiveMember({
    headers: await headers(),
  });

  // Calculate members count
  const membersCount = organization?.members?.length || 0;

  // Mock data for quick stats (to be replaced with real data later)
  const stats = {
    activeProjects: 8,
    recentActivity: 24,
    growth: "+12%",
  };

  // Mock data for recent projects
  const recentProjects = [
    { id: "1", name: "Website Redesign", status: "In Progress", members: 5 },
    { id: "2", name: "Mobile App", status: "Planning", members: 3 },
    { id: "3", name: "API Integration", status: "Completed", members: 4 },
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: "1",
      user: "John Doe",
      action: "joined the organization",
      time: "2 hours ago",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "created a new project",
      time: "5 hours ago",
    },
    {
      id: "3",
      user: "Bob Johnson",
      action: "updated team settings",
      time: "1 day ago",
    },
    {
      id: "4",
      user: "Alice Williams",
      action: "invited new members",
      time: "2 days ago",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {organization?.name}
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-gray-600">
            Your role:{" "}
            <span className="font-medium capitalize">
              {activeMember?.role || "member"}
            </span>
          </p>
          <span className="text-gray-400">•</span>
          <p className="text-gray-600">
            <span className="font-medium">{membersCount}</span>{" "}
            {membersCount === 1 ? "member" : "members"}
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active members in your organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Projects currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Member growth this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Projects and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.members} members
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      project.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Invite Members
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <FolderKanban className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                New Project
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Create Team
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Activity className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                View Reports
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
