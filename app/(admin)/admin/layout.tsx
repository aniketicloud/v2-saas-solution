import type React from "react";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminBreadcrumb } from "./_components/admin-breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ColorPaletteSelector } from "@/components/color-palette-selector";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    redirect("/login");
  }

  // Get sidebar state from cookies for persistent state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminBreadcrumb />
          <div className="ml-auto flex items-center gap-1">
            <ColorPaletteSelector />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
