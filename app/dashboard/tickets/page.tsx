import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, AlertCircle } from "lucide-react";
import { mockTickets } from "@/lib/mock-data";
import { format } from "date-fns";

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ticket Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage support tickets and requests
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search tickets..." className="w-full" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            A list of all support tickets and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>SLA Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">
                    {ticket.ticketNumber}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <div className="font-medium line-clamp-1">
                        {ticket.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.severity === "HIGH" ||
                        ticket.severity === "CRITICAL"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.assignee || "Unassigned"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ticket.slaStatus === "BREACHED" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <Badge
                        variant={
                          ticket.slaStatus === "ON_TRACK"
                            ? "default"
                            : ticket.slaStatus === "AT_RISK"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {ticket.slaStatus.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(ticket.createdAt, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
