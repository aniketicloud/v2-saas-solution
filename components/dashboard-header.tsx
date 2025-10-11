import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings } from "lucide-react";
import { mockUser, mockOrganization } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-8">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={mockOrganization.logo || "/placeholder.svg"}
              alt={mockOrganization.name}
            />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">{mockOrganization.name}</h2>
            <p className="text-xs text-muted-foreground">
              {mockOrganization.industry}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={mockUser.profileImage || "/placeholder.svg"}
                    alt={mockUser.firstName}
                  />
                  <AvatarFallback>
                    {mockUser.firstName[0]}
                    {mockUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">
                    {mockUser.firstName} {mockUser.lastName}
                  </span>
                  {mockUser.isSuperAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Super Admin
                    </Badge>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
