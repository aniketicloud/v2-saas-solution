import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockOffices } from "@/lib/mock-data";
import { Plus, MapPin } from "lucide-react";

export default function OfficesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Office Management
          </h1>
          <p className="text-muted-foreground">
            Manage your organization's office locations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Office
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockOffices.map((office) => (
          <Card key={office.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{office.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {office.city}, {office.country}
                  </CardDescription>
                </div>
                <Badge variant={office.isActive ? "default" : "secondary"}>
                  {office.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono">{office.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{office.type}</Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                >
                  Manage Office
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
