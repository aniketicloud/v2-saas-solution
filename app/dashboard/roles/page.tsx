import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield } from "lucide-react";

const mockRoles = [
  {
    id: "1",
    name: "Super Admin",
    level: "SYSTEM",
    permissions: 45,
    users: 1,
    isSystem: true,
  },
  {
    id: "2",
    name: "Admin",
    level: "ORGANIZATION",
    permissions: 32,
    users: 3,
    isSystem: false,
  },
  {
    id: "3",
    name: "Manager",
    level: "ORGANIZATION",
    permissions: 18,
    users: 8,
    isSystem: false,
  },
  {
    id: "4",
    name: "Employee",
    level: "ORGANIZATION",
    permissions: 10,
    users: 33,
    isSystem: false,
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage roles and their associated permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {role.level.replace("_", " ")} Level
                    </CardDescription>
                  </div>
                </div>
                {role.isSystem && <Badge variant="secondary">System</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Permissions:</span>
                  <span className="font-medium">{role.permissions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Users:</span>
                  <span className="font-medium">{role.users}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                  disabled={role.isSystem}
                >
                  {role.isSystem ? "System Role" : "Edit Permissions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
