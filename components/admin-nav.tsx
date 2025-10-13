"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavProps {
  user: {
    email: string;
    name?: string;
  };
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      title: "Organizations",
      href: "/admin/organizations",
    },
    {
      title: "Users",
      href: "/admin/users",
    },
  ];

  return (
    <nav className="bg-gray-900 text-white w-64 p-4">
      {/* User Email at the top */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <p className="text-sm truncate">{user.email}</p>
        {user.name && <p className="text-xs text-gray-400 mt-1">{user.name}</p>}
      </div>

      {/* Navigation Links */}
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded hover:bg-gray-800 transition-colors ${
                  isActive ? "font-bold" : ""
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
