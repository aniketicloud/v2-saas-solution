import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: any;
};

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {organization.logo ? (
              <Image
                src={organization.logo}
                alt={organization.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle>{organization.name}</CardTitle>
              <CardDescription className="mt-1">
                @{organization.slug}
              </CardDescription>
            </div>
          </div>
          <Badge variant="default">Active placeholder</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono text-xs">{organization.slug}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="text-xs">
              {new Date(organization.createdAt).toLocaleDateString()}
            </span>
          </div>
          {organization.metadata && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Metadata</span>
              <Badge variant="outline">Available</Badge>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full mt-4 bg-transparent"
            asChild
          >
            <Link href={`/admin/organizations/${organization.id}`}>
              Manage Organization
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
