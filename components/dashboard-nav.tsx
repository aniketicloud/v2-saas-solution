"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Ticket,
  Building2,
  Shield,
  CreditCard,
  Package,
  Settings,
  AlertTriangle,
} from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Visitors",
    href: "/dashboard/visitors",
    icon: UserCheck,
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Offices",
    href: "/dashboard/offices",
    icon: Building2,
  },
  {
    title: "Roles & Permissions",
    href: "/dashboard/roles",
    icon: Shield,
  },
  {
    title: "Modules",
    href: "/dashboard/modules",
    icon: Package,
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Watchlist",
    href: "/dashboard/watchlist",
    icon: AlertTriangle,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 border-r bg-muted/40 p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
