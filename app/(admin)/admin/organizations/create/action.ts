"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { organizationSchema } from "./schema";

export async function createOrganization(name: string, slug: string) {
  try {
    // Server-side validation - CRITICAL for security
    // Never trust client-side data
    const validatedData = organizationSchema.parse({ name, slug });

    const data = await auth.api.createOrganization({
      body: {
        name: validatedData.name,
        slug: validatedData.slug,
      },
      headers: await headers(),
    });

    return { success: true, data };
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors.map((e: any) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: error.message || "Failed to create organization",
    };
  }
}
