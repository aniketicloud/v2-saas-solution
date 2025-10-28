"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * User Management Server Actions
 * 
 * Provides comprehensive user management including:
 * - CRUD operations
 * - Ban/Unban users
 * - Session management
 * - User impersonation
 */

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

const banUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1).max(500).optional(),
  expiresIn: z.number().positive().optional(), // in seconds
});

/**
 * Get user details by ID
 */
export async function getUserById(userId: string) {
  const [result, error] = await tryCatch(
    auth.api.listUsers({
      query: {
        filterField: "id",
        filterValue: userId,
        filterOperator: "eq",
        limit: 1,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: error.message };
  }

  if (!result?.users || result.users.length === 0) {
    return { success: false, error: "User not found" };
  }

  return { success: true, data: result.users[0] };
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  data: z.infer<typeof updateUserSchema>
) {
  try {
    // Validate input
    const validatedData = updateUserSchema.parse(data);

    const [result, error] = await tryCatch(
      auth.api.adminUpdateUser({
        body: {
          userId,
          data: validatedData,
        },
        headers: await headers(),
      })
    );

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate pages
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message };
    }
    return { success: false, error: "Failed to update user" };
  }
}

/**
 * Delete user (hard delete)
 */
export async function deleteUser(userId: string) {
  const [result, error] = await tryCatch(
    auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Ban user
 */
export async function banUser(data: z.infer<typeof banUserSchema>) {
  try {
    const validatedData = banUserSchema.parse(data);

    const [result, error] = await tryCatch(
      auth.api.banUser({
        body: {
          userId: validatedData.userId,
          banReason: validatedData.reason,
          banExpiresIn: validatedData.expiresIn,
        },
        headers: await headers(),
      })
    );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${data.userId}`);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message };
    }
    return { success: false, error: "Failed to ban user" };
  }
}

/**
 * Unban user
 */
export async function unbanUser(userId: string) {
  const [result, error] = await tryCatch(
    auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true, data: result };
}

/**
 * List user sessions
 */
export async function listUserSessions(userId: string) {
  const [result, error] = await tryCatch(
    auth.api.listUserSessions({
      body: {
        userId: userId,
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error listing sessions:", error);
    return { success: false, error: error.message };
  }

  console.log("Sessions result:", result); // Debug log
  return { success: true, data: result };
}

/**
 * Revoke specific session
 */
export async function revokeSession(sessionToken: string) {
  const [result, error] = await tryCatch(
    auth.api.revokeUserSession({
      body: { sessionToken },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error revoking session:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Revoke all sessions for a user
 */
export async function revokeUserSessions(userId: string) {
  const [result, error] = await tryCatch(
    auth.api.revokeUserSessions({
      body: { userId },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error revoking user sessions:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

/**
 * Set user role
 */
export async function setUserRole(userId: string, role: "user" | "admin") {
  const [result, error] = await tryCatch(
    auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error setting role:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true, data: result };
}

/**
 * Create impersonation session
 * Allows admin to impersonate a user
 */
export async function impersonateUser(userId: string) {
  const [result, error] = await tryCatch(
    auth.api.impersonateUser({
      body: { userId },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error impersonating user:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: result };
}

/**
 * Stop impersonation and return to admin session
 */
export async function stopImpersonation() {
  const [result, error] = await tryCatch(
    auth.api.stopImpersonating({
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error stopping impersonation:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
