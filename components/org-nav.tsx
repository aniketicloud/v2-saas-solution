"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface OrgNavProps {
  organization: {
    name: string;
    slug: string;
  };
  user: {
    email: string;
  };
}

export function OrgNav({ organization, user }: OrgNavProps) {
  const pathname = usePathname();
  const baseUrl = `/org/${organization.slug}`;

  const navItems = [
    {
      title: "Dashboard",
      href: `${baseUrl}/dashboard`,
    },
    {
      title: "Members",
      href: `${baseUrl}/members`,
    },
    {
      title: "Settings",
      href: `${baseUrl}/settings`,
    },
    {
      title: "Teams",
      href: `${baseUrl}/teams`,
    },
  ];

  return (
    <nav className="bg-gray-100 w-64 p-4">
      {/* Organization Name and User Email at top */}
      <div className="mb-6 pb-4 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {organization.name}
        </h2>
        <p className="text-sm text-gray-600 truncate">{user.email}</p>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700 ${
                  isActive ? "font-bold bg-gray-200" : ""
                }`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
