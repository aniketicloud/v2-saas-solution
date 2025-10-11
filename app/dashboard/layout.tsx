import type React from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers as nextHeaders } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const rh = await nextHeaders();
  const h = new Headers();
  rh.forEach((value, key) => h.set(key, value));

  const sessionInfo = await auth.api.getSession({ headers: h });
  if (!sessionInfo?.session) {
    redirect("/signup");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 flex">
        <DashboardNav />
        <main className="flex-1 p-8 overflow-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
