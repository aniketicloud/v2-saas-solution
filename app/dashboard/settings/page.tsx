import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization and system settings
        </p>
      </div>

      {/* Visitor Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Management Settings</CardTitle>
          <CardDescription>
            Configure visitor check-in and access control preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Pre-registration</Label>
              <p className="text-sm text-muted-foreground">
                Enable visitors to pre-register before arrival
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                All visitor registrations require host approval
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Photo Capture</Label>
              <p className="text-sm text-muted-foreground">
                Capture visitor photo during check-in
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Watchlist Check</Label>
              <p className="text-sm text-muted-foreground">
                Automatically check visitors against watchlist
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Management Settings</CardTitle>
          <CardDescription>
            Configure ticket workflow and SLA preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-assign Tickets</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign tickets to available agents
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable SLA Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track and enforce SLA policies for tickets
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="auto-close">Auto-close After (days)</Label>
            <Input
              id="auto-close"
              type="number"
              defaultValue="30"
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Automatically close resolved tickets after this many days
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="ticket-prefix">Ticket Number Prefix</Label>
            <Input
              id="ticket-prefix"
              defaultValue="TKT"
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Prefix for ticket numbers (e.g., TKT-2024-001)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
