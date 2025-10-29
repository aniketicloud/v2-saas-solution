/**
 * Permission Types and Constants
 * 
 * This file defines the core types and constants for the permission system.
 */

// Permission check result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  source?: "global_admin" | "org_owner" | "org_admin" | "custom_role" | "default";
}

// Permission check input
export interface PermissionCheckInput {
  memberId: string;
  organizationId: string;
  moduleSlug: string;
  resource: string;
  action: string;
}

// Common permission actions
export const PermissionActions = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage", // Full control including settings
  EXECUTE: "execute", // For special operations
} as const;

export type PermissionAction = (typeof PermissionActions)[keyof typeof PermissionActions];

// TodoList module permissions
export const TodoListPermissions = {
  // TodoList resource
  TODOLIST_VIEW: { resource: "todolist", action: "view" },
  TODOLIST_CREATE: { resource: "todolist", action: "create" },
  TODOLIST_UPDATE: { resource: "todolist", action: "update" },
  TODOLIST_DELETE: { resource: "todolist", action: "delete" },
  TODOLIST_MANAGE: { resource: "todolist", action: "manage" },
  
  // TodoItem resource
  TODOITEM_VIEW: { resource: "todoitem", action: "view" },
  TODOITEM_CREATE: { resource: "todoitem", action: "create" },
  TODOITEM_UPDATE: { resource: "todoitem", action: "update" },
  TODOITEM_DELETE: { resource: "todoitem", action: "delete" },
  TODOITEM_COMPLETE: { resource: "todoitem", action: "complete" },
} as const;

// Predefined role templates
export enum PredefinedRole {
  ADMIN = "Admin",
  EDITOR = "Editor",
  VIEWER = "Viewer",
}

// Role definitions with their permissions
export const RoleTemplates = {
  [PredefinedRole.ADMIN]: {
    name: "Admin",
    description: "Full access to all module features",
    permissions: [
      "todolist.view",
      "todolist.create",
      "todolist.update",
      "todolist.delete",
      "todolist.manage",
      "todoitem.view",
      "todoitem.create",
      "todoitem.update",
      "todoitem.delete",
      "todoitem.complete",
    ],
  },
  [PredefinedRole.EDITOR]: {
    name: "Editor",
    description: "Can create and edit, but not delete or manage settings",
    permissions: [
      "todolist.view",
      "todolist.create",
      "todolist.update",
      "todoitem.view",
      "todoitem.create",
      "todoitem.update",
      "todoitem.complete",
    ],
  },
  [PredefinedRole.VIEWER]: {
    name: "Viewer",
    description: "Read-only access to view todo lists and items",
    permissions: [
      "todolist.view",
      "todoitem.view",
    ],
  },
} as const;

// Helper to format permission key
export function formatPermissionKey(resource: string, action: string): string {
  return `${resource}.${action}`;
}

// Helper to parse permission key
export function parsePermissionKey(key: string): { resource: string; action: string } {
  const [resource, action] = key.split(".");
  return { resource, action };
}
