import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, AlertTriangle } from "lucide-react";

const mockWatchlist = [
  {
    id: "1",
    name: "Robert Wilson",
    email: "r.wilson@example.com",
    phone: "+1-555-0199",
    reason: "SECURITY_THREAT",
    severity: "HIGH",
    addedAt: new Date("2024-01-10"),
    isActive: true,
  },
  {
    id: "2",
    name: "Lisa Anderson",
    email: "l.anderson@example.com",
    phone: "+1-555-0188",
    reason: "PREVIOUS_INCIDENT",
    severity: "MEDIUM",
    addedAt: new Date("2024-01-12"),
    isActive: true,
  },
];

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Security Watchlist
          </h1>
          <p className="text-muted-foreground">
            Manage visitors flagged for security monitoring
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add to Watchlist
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist Entries</CardTitle>
          <CardDescription>
            Individuals flagged for security monitoring and restricted access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWatchlist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{entry.email}</div>
                      <div className="text-muted-foreground">{entry.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {entry.reason.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.severity === "HIGH" && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <Badge
                        variant={
                          entry.severity === "HIGH"
                            ? "destructive"
                            : entry.severity === "MEDIUM"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {entry.severity}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{entry.addedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={entry.isActive ? "default" : "secondary"}>
                      {entry.isActive ? "Active" : "Inactive"}
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
