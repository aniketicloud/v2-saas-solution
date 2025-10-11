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
import { Plus, Download } from "lucide-react";
import { mockVisitors } from "@/lib/mock-data";
import { format } from "date-fns";

export default function VisitorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visitor Management
          </h1>
          <p className="text-muted-foreground">
            Manage visitor check-ins, passes, and access control
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Pre-register Visitor
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
              <Input
                placeholder="Search by name, email, or company..."
                className="w-full"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pre-registered">Pre-registered</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                <SelectItem value="hq">Headquarters</SelectItem>
                <SelectItem value="ec">East Coast</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visitors</CardTitle>
          <CardDescription>
            A list of all visitors including their status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Expected Arrival</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVisitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-mono text-sm">
                    {visitor.visitorNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {visitor.firstName} {visitor.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {visitor.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{visitor.company}</TableCell>
                  <TableCell>{visitor.hostName}</TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>
                    {format(visitor.expectedArrival, "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        visitor.status === "CHECKED_IN"
                          ? "default"
                          : visitor.status === "PRE_REGISTERED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {visitor.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
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
