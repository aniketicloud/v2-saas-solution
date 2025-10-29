"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Settings, Users, LayoutDashboard, UsersRound } from "lucide-react";
import { Separator } from "./ui/separator";

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

interface OrgNavClientProps {
  organization: {
    name: string;
    slug: string;
  };
  user: {
    email: string;
  };
  modules: Module[];
  isOrgAdmin: boolean;
}

const iconMap: Record<string, any> = {
  CheckSquare,
  Settings,
  Users,
  LayoutDashboard,
  UsersRound,
};

export function OrgNavClient({
  organization,
  user,
  modules,
  isOrgAdmin,
}: OrgNavClientProps) {
  const pathname = usePathname();
  const baseUrl = `/org/${organization.slug}`;

  const coreNavItems = [
    {
      title: "Dashboard",
      href: `${baseUrl}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      href: `${baseUrl}/members`,
      icon: Users,
    },
    {
      title: "Teams",
      href: `${baseUrl}/teams`,
      icon: UsersRound,
    },
    {
      title: "Settings",
      href: `${baseUrl}/settings`,
      icon: Settings,
    },
  ];

  // Filter enabled modules and add them to navigation
  const moduleNavItems = modules
    .filter((m) => m.isEnabled)
    .map((m) => ({
      title: m.module.name,
      href: `${baseUrl}/${m.module.slug}`,
      icon: m.module.icon ? iconMap[m.module.icon] : CheckSquare,
    }));

  return (
    <nav className="bg-gray-100 w-64 p-4 h-full">
      {/* Organization Name and User Email at top */}
      <div className="mb-6 pb-4 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {organization.name}
        </h2>
        <p className="text-sm text-gray-600 truncate">{user.email}</p>
      </div>

      {/* Core Navigation Links */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">
          Core
        </h3>
        <ul className="space-y-1">
          {coreNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700 ${
                    isActive ? "font-bold bg-gray-200" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modules Navigation */}
      {moduleNavItems.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">
              Modules
            </h3>
            <ul className="space-y-1">
              {moduleNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700 ${
                        isActive ? "font-bold bg-gray-200" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}
