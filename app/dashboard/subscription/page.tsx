import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockSubscription } from "@/lib/mock-data";
import { format } from "date-fns";
import { CreditCard, Users, Building2 } from "lucide-react";

export default function SubscriptionPage() {
  const userUsagePercent =
    (mockSubscription.usersCount / mockSubscription.maxUsers) * 100;
  const officeUsagePercent =
    (mockSubscription.officesCount / mockSubscription.maxOffices) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your subscription is active and will renew on{" "}
                {format(mockSubscription.currentPeriodEnd, "MMMM dd, yyyy")}
              </CardDescription>
            </div>
            <Badge className="text-lg px-4 py-2">{mockSubscription.plan}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {mockSubscription.status}
                </span>
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button>Upgrade</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Licenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {mockSubscription.usersCount}
              </span>
              <span className="text-sm text-muted-foreground">
                of {mockSubscription.maxUsers} users
              </span>
            </div>
            <Progress value={userUsagePercent} />
            <p className="text-sm text-muted-foreground">
              {mockSubscription.maxUsers - mockSubscription.usersCount} licenses
              remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Office Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {mockSubscription.officesCount}
              </span>
              <span className="text-sm text-muted-foreground">
                of {mockSubscription.maxOffices} offices
              </span>
            </div>
            <Progress value={officeUsagePercent} />
            <p className="text-sm text-muted-foreground">
              {mockSubscription.maxOffices - mockSubscription.officesCount}{" "}
              offices remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your organization's needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {["Starter", "Professional", "Enterprise"].map((plan) => (
              <Card key={plan}>
                <CardHeader>
                  <CardTitle>{plan}</CardTitle>
                  <div className="text-3xl font-bold">
                    $
                    {plan === "Starter"
                      ? "49"
                      : plan === "Professional"
                      ? "149"
                      : "499"}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li>
                      ✓{" "}
                      {plan === "Starter"
                        ? "10"
                        : plan === "Professional"
                        ? "50"
                        : "Unlimited"}{" "}
                      users
                    </li>
                    <li>
                      ✓{" "}
                      {plan === "Starter"
                        ? "1"
                        : plan === "Professional"
                        ? "5"
                        : "Unlimited"}{" "}
                      offices
                    </li>
                    <li>✓ All core modules</li>
                    <li>
                      ✓ {plan === "Enterprise" ? "Priority" : "Standard"}{" "}
                      support
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    variant={
                      plan === mockSubscription.plan ? "secondary" : "default"
                    }
                    disabled={plan === mockSubscription.plan}
                  >
                    {plan === mockSubscription.plan
                      ? "Current Plan"
                      : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
