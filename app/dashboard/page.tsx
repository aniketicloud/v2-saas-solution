import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { mockStats, mockVisitors, mockTickets } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visitors Today
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.visitors.today}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.visitors.checkedIn} currently checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.tickets.open}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.tickets.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.users.active}</div>
            <p className="text-xs text-muted-foreground">
              of {mockStats.users.total} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mockStats.tickets.breached}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Visitors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
            <CardDescription>
              Latest visitor check-ins and registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockVisitors.slice(0, 3).map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {visitor.firstName} {visitor.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {visitor.company} • Host: {visitor.hostName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      visitor.status === "CHECKED_IN" ? "default" : "secondary"
                    }
                  >
                    {visitor.status === "CHECKED_IN" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {visitor.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent"
              asChild
            >
              <Link href="/dashboard/visitors">View All Visitors</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              Latest support tickets and requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {ticket.ticketNumber}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.title}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.severity === "HIGH" ? "destructive" : "secondary"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent"
              asChild
            >
              <Link href="/dashboard/tickets">View All Tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
