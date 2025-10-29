"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { checkMemberPermission } from "@/lib/actions/permissions";

const MODULE_SLUG = "todolist";

/**
 * Get member from session and organization
 */
async function getMember(organizationId: string) {
  const [session, sessionError] = await tryCatch(
    auth.api.getSession({ headers: await headers() })
  );

  if (sessionError || !session?.user) {
    return { error: "Unauthorized" };
  }

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!member) {
    return { error: "Not a member of this organization" };
  }

  return { member, userId: session.user.id };
}

/**
 * Check if member has permission
 */
async function checkPermission(
  memberId: string,
  organizationId: string,
  resource: string,
  action: string
) {
  const hasPermission = await checkMemberPermission(
    memberId,
    organizationId,
    MODULE_SLUG,
    resource,
    action
  );

  if (!hasPermission) {
    return { error: "You don't have permission to perform this action" };
  }

  return { allowed: true };
}

/**
 * Create a new todo list
 */
export async function createTodoList(data: {
  organizationId: string;
  title: string;
  description?: string;
}) {
  const memberResult = await getMember(data.organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member, userId } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    data.organizationId,
    "todolist",
    "create"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  const [todoList, error] = await tryCatch(
    prisma.todoList.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        description: data.description,
        createdBy: userId,
      },
      include: {
        items: true,
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: todoList };
}

/**
 * List todo lists for an organization
 */
export async function listTodoLists(organizationId: string) {
  const memberResult = await getMember(organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    organizationId,
    "todolist",
    "view"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  const [todoLists, error] = await tryCatch(
    prisma.todoList.findMany({
      where: {
        organizationId,
        status: "active",
      },
      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: todoLists };
}

/**
 * Get a single todo list
 */
export async function getTodoList(todoListId: string, organizationId: string) {
  const memberResult = await getMember(organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    organizationId,
    "todolist",
    "view"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  const [todoList, error] = await tryCatch(
    prisma.todoList.findFirst({
      where: {
        id: todoListId,
        organizationId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  if (!todoList) {
    return { error: "Todo list not found" };
  }

  return { data: todoList };
}

/**
 * Update a todo list
 */
export async function updateTodoList(data: {
  todoListId: string;
  organizationId: string;
  title?: string;
  description?: string;
  status?: string;
}) {
  const memberResult = await getMember(data.organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    data.organizationId,
    "todolist",
    "update"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  const [todoList, error] = await tryCatch(
    prisma.todoList.update({
      where: {
        id: data.todoListId,
        organizationId: data.organizationId,
      },
      data: updateData,
      include: {
        items: true,
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: todoList };
}

/**
 * Delete a todo list
 */
export async function deleteTodoList(todoListId: string, organizationId: string) {
  const memberResult = await getMember(organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    organizationId,
    "todolist",
    "delete"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  const [result, error] = await tryCatch(
    prisma.todoList.delete({
      where: {
        id: todoListId,
        organizationId,
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: result };
}

/**
 * Create a todo item
 */
export async function createTodoItem(data: {
  todoListId: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
}) {
  const memberResult = await getMember(data.organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member, userId } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    data.organizationId,
    "todoitem",
    "create"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  // Verify todo list belongs to organization
  const todoList = await prisma.todoList.findFirst({
    where: {
      id: data.todoListId,
      organizationId: data.organizationId,
    },
  });

  if (!todoList) {
    return { error: "Todo list not found" };
  }

  const [item, error] = await tryCatch(
    prisma.todoItem.create({
      data: {
        todoListId: data.todoListId,
        title: data.title,
        description: data.description,
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        createdBy: userId,
      },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: item };
}

/**
 * Update a todo item
 */
export async function updateTodoItem(data: {
  itemId: string;
  organizationId: string;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  dueDate?: Date;
}) {
  const memberResult = await getMember(data.organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    data.organizationId,
    "todoitem",
    "update"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  // Verify item belongs to organization's todo list
  const item = await prisma.todoItem.findFirst({
    where: {
      id: data.itemId,
      todoList: {
        organizationId: data.organizationId,
      },
    },
  });

  if (!item) {
    return { error: "Todo item not found" };
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

  const [updated, error] = await tryCatch(
    prisma.todoItem.update({
      where: { id: data.itemId },
      data: updateData,
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: updated };
}

/**
 * Delete a todo item
 */
export async function deleteTodoItem(
  itemId: string,
  organizationId: string
) {
  const memberResult = await getMember(organizationId);
  if ("error" in memberResult) {
    return memberResult;
  }

  const { member } = memberResult;

  // Check permission
  const permCheck = await checkPermission(
    member.id,
    organizationId,
    "todoitem",
    "delete"
  );
  if ("error" in permCheck) {
    return permCheck;
  }

  // Verify item belongs to organization's todo list
  const item = await prisma.todoItem.findFirst({
    where: {
      id: itemId,
      todoList: {
        organizationId,
      },
    },
  });

  if (!item) {
    return { error: "Todo item not found" };
  }

  const [result, error] = await tryCatch(
    prisma.todoItem.delete({
      where: { id: itemId },
    })
  );

  if (error) {
    return { error: error.message };
  }

  return { data: result };
}
