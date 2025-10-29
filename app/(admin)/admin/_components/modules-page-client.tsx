"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { assignModuleToOrganization, removeModuleFromOrganization } from "@/lib/actions/modules";
import { toast } from "sonner";
import { Plus, Trash2, Users, Building2 } from "lucide-react";

interface Module {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  modulePermissions: any[];
  _count: {
    organizationModules: number;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  organizationModules: Array<{
    id: string;
    moduleId: string;
    isEnabled: boolean;
    module: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    members: number;
  };
}

interface ModulesPageClientProps {
  modules: Module[];
  organizations: Organization[];
}

export default function ModulesPageClient({
  modules: initialModules,
  organizations: initialOrganizations,
}: ModulesPageClientProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAssignModule = async () => {
    if (!selectedModule || !selectedOrgId) return;

    setLoading(true);
    const result = await assignModuleToOrganization({
      organizationId: selectedOrgId,
      moduleId: selectedModule.id,
    });

    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Module assigned successfully");
      setAssignDialogOpen(false);
      setSelectedModule(null);
      setSelectedOrgId("");
      // Refresh the page
      window.location.reload();
    }
  };

  const handleRemoveModule = async (organizationId: string, moduleId: string) => {
    if (!confirm("Are you sure you want to remove this module from the organization?")) {
      return;
    }

    const result = await removeModuleFromOrganization({
      organizationId,
      moduleId,
    });

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Module removed successfully");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Module Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage modules and assign them to organizations
        </p>
      </div>

      {/* Modules Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialModules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {module.name}
                  {!module.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {module._count.organizationModules} organizations
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {module.modulePermissions.length} permissions
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedModule(module);
                      setAssignDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign to Organization
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Organizations Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Organizations</h2>
        <div className="space-y-4">
          {initialOrganizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      {org._count.members} members
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {org.organizationModules.length} modules
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {org.organizationModules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No modules assigned
                  </p>
                ) : (
                  <div className="space-y-2">
                    {org.organizationModules.map((orgModule) => (
                      <div
                        key={orgModule.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {orgModule.module.name}
                          </span>
                          {!orgModule.isEnabled && (
                            <Badge variant="destructive">Disabled</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveModule(org.id, orgModule.moduleId)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Assign Module Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Module to Organization</DialogTitle>
            <DialogDescription>
              Select an organization to assign {selectedModule?.name} to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {initialOrganizations
                    .filter(
                      (org) =>
                        !org.organizationModules.some(
                          (om) => om.moduleId === selectedModule?.id
                        )
                    )
                    .map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignModule} disabled={loading || !selectedOrgId}>
              {loading ? "Assigning..." : "Assign Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
