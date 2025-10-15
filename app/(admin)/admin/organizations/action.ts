"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// import { prisma } from "@/lib/prisma";

export async function getOrganizations() {
  // "use cache"; // Uncomment this line when Next supports it
  // const organizations = await prisma.organization.findMany();
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });
  return organizations;
}
