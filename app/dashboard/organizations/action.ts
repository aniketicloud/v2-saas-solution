"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createOrganization(name: string) {
  try {
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const data = await auth.api.createOrganization({
      body: {
        name,
        slug,
      },
      headers: await headers(),
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create organization" };
  }
}
