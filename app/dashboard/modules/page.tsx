import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { mockModules } from "@/lib/mock-data";
import { Package, Settings } from "lucide-react";

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Module Management</h1>
        <p className="text-muted-foreground">
          Enable or disable modules for your organization
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockModules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {module.category}
                    </Badge>
                  </div>
                </div>
                <Switch checked={module.isEnabled} />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {module.description}
              </CardDescription>
              <div className="flex items-center justify-between">
                <Badge variant={module.isEnabled ? "default" : "secondary"}>
                  {module.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
