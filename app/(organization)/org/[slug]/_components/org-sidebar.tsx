"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  UsersRound,
  Building2,
  ChevronUp,
  User2,
  LogOut,
  CheckSquare,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import { tryCatch } from "@/utils/try-catch";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  isEnabled: boolean;
  module: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
}

interface OrgSidebarProps {
  organization: {
    name: string;
    slug: string;
    logo?: string | null;
  };
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  modules?: Module[];
}

const iconMap: Record<string, any> = {
  CheckSquare,
  Settings,
  Users,
  LayoutDashboard,
  UsersRound,
};

export function OrgSidebar({
  organization,
  user,
  modules = [],
}: OrgSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const baseUrl = `/org/${organization.slug}`;

  const navItems = [
    {
      title: "Dashboard",
      url: `${baseUrl}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      url: `${baseUrl}/members`,
      icon: Users,
    },
    {
      title: "Roles & Permissions",
      url: `${baseUrl}/roles`,
      icon: Shield,
    },
    {
      title: "Offices",
      url: `${baseUrl}/teams`,
      icon: UsersRound,
    },
    {
      title: "Settings",
      url: `${baseUrl}/settings`,
      icon: Settings,
    },
  ];

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    const [, error] = await tryCatch(
      signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
          },
        },
      })
    );

    if (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`${baseUrl}/dashboard`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {organization.logo ? (
                    <img
                      src={organization.logo}
                      alt={organization.name}
                      className="size-8 rounded-lg"
                    />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{organization.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Organization
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Modules Section */}
        {modules.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Modules</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {modules
                  .filter((m) => m.isEnabled)
                  .map((module) => {
                    const moduleUrl = `${baseUrl}/${module.module.slug}`;
                    const isActive =
                      pathname === moduleUrl ||
                      pathname.startsWith(`${moduleUrl}/`);
                    const Icon = module.module.icon
                      ? iconMap[module.module.icon] || CheckSquare
                      : CheckSquare;

                    return (
                      <SidebarMenuItem key={module.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={moduleUrl}>
                            <Icon className="size-4" />
                            <span>{module.module.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.image || "/placeholder.svg"}
                      alt={user.name || user.email}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user.name || user.email}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User2 className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
