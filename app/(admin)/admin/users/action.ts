"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";

export async function listAllUsers(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;

  const [result, error] = await tryCatch(
    auth.api.listUsers({
      query: {
        limit: pageSize,
        offset: offset,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error listing users:", error);
    return {
      success: false,
      error: error.message || "Failed to list users",
      data: {
        users: [],
        total: 0,
        limit: pageSize,
        offset: 0,
      },
    };
  }

  return {
    success: true,
    data: {
      users: result.users,
      total: result.total,
      limit: "limit" in result ? result.limit : pageSize,
      offset: "offset" in result ? result.offset : offset,
    },
  };
}
