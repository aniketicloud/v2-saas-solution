# Roles & Permissions Management - UI Guide

## Overview
This guide explains how to use the complete Roles & Permissions system in your organization. The system allows you to create custom roles, assign permissions, and manage member access to different modules.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Viewing Roles](#viewing-roles)
3. [Creating Custom Roles](#creating-custom-roles)
4. [Editing Roles](#editing-roles)
5. [Deleting Roles](#deleting-roles)
6. [Assigning Roles to Members](#assigning-roles-to-members)
7. [Removing Roles from Members](#removing-roles-from-members)
8. [Viewing Member Permissions](#viewing-member-permissions)
9. [Understanding Role Types](#understanding-role-types)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- You must be an **Organization Admin** or **Owner** to manage roles
- Your organization must have at least one module installed (e.g., TodoList module)
- Members must exist in your organization to assign roles

### Accessing the Roles Management
1. Navigate to your organization dashboard
2. Look for **"Roles & Permissions"** in the left sidebar
3. Click on it to access the roles management page

**URL Pattern**: `/org/{your-org-slug}/roles`

---

## Viewing Roles

### Roles Dashboard
When you access the Roles & Permissions page, you'll see:

#### Summary Stats (Top of Page)
- **Total Modules**: Number of modules in your organization
- **Total Roles**: Total custom roles across all modules
- **Total Members**: Number of organization members

#### Module Cards
Each module is displayed in a card showing:
- **Module Name** (e.g., "TodoList")
- **Roles Count**: Number of custom roles for this module
- **Members Count**: Number of members with roles in this module
- **Create Role Button**: Quick action to create a new role

#### Roles List
Below each module, you'll see all custom roles:
- **Role Name** with badge (Predefined/Custom)
- **Description** of the role
- **Permission Count**: Number of permissions granted
- **Member Count**: Number of members with this role
- **Actions**: Edit and Delete buttons

---

## Creating Custom Roles

### Step-by-Step Process

1. **Open Create Dialog**
   - Click **"Create Role"** button in a module card
   - A dialog will appear with a form

2. **Fill Role Details**
   ```
   Role Name: [e.g., "Content Manager"]
   Description: [Optional - e.g., "Can manage all content"]
   Module: [Auto-selected or dropdown]
   ```

3. **Select Permissions**
   - You'll see a **Permission Matrix** table
   - Permissions are grouped by **Resource** (e.g., TodoList, TodoItem)
   - Each row shows:
     - Resource name
     - Action (e.g., `create`, `read`, `update`, `delete`)
     - Description of what the permission does
     - Checkbox to grant/deny

4. **Bulk Selection**
   - **Select All**: Check all permissions at once
   - **Deselect All**: Uncheck all permissions
   - **Selection Counter**: Shows "X permissions selected"

5. **Save Role**
   - Click **"Create Role"** button
   - You'll see a success toast notification
   - The new role appears in the roles list

### Example: Creating a "Content Editor" Role

```
Name: Content Editor
Description: Can edit and view content but not delete
Module: TodoList

Permissions Selected:
✅ TodoList → read (View todo lists)
✅ TodoList → update (Edit todo lists)
✅ TodoItem → read (View todo items)
✅ TodoItem → create (Create new items)
✅ TodoItem → update (Edit items)
❌ TodoItem → delete (Delete items) [NOT SELECTED]
```

---

## Editing Roles

### Step-by-Step Process

1. **Navigate to Edit Page**
   - Click **"Edit"** button next to any role
   - You'll be taken to `/org/{slug}/roles/{roleId}`

2. **Edit Role Details** (Top Section)
   - **Role Name**: Click to edit
   - **Description**: Click to edit
   - Click **"Save Details"** to save changes
   - **Note**: Predefined roles cannot have their names edited

3. **Edit Permissions** (Permission Matrix Section)
   - Same interface as creation
   - Check/uncheck permissions as needed
   - Use **Select All** / **Deselect All** for bulk changes
   - Permission counter shows current selection
   - Click **"Save Permissions"** to apply changes

4. **View Member Count**
   - See how many members have this role assigned
   - Located in the role details section

5. **Delete Role** (Bottom Section)
   - Red **"Delete Role"** button
   - Opens confirmation dialog
   - See [Deleting Roles](#deleting-roles) section

### Unsaved Changes Warning
- If you edit permissions without saving, you'll see a warning
- The Save button becomes prominent
- Don't navigate away without saving

---

## Deleting Roles

### Safety Checks

The system prevents accidental deletion with these safeguards:

1. **Member Assignment Check**
   - Cannot delete roles assigned to members
   - Error message: "This role is currently assigned to X member(s)"
   - You must first remove the role from all members

2. **Predefined Roles Protection**
   - Predefined roles (Admin, Editor, Viewer) cannot be deleted
   - These are system-managed roles

### Step-by-Step Process

1. **Open Delete Dialog**
   - Click **"Delete Role"** button on edit page
   - Or click **Delete** icon in roles list

2. **Review Warning**
   - Dialog shows role name and danger warning
   - If members are assigned, deletion is blocked
   - If no members, you can proceed

3. **Confirm Deletion**
   - Type confirmation or click **"Delete"**
   - Role is permanently removed
   - Success notification appears

### Before Deleting Checklist
- [ ] Verify no members are assigned this role
- [ ] Check if role is predefined (cannot delete)
- [ ] Consider editing permissions instead of deleting
- [ ] Ensure you have backup/alternative roles

---

## Assigning Roles to Members

### Step-by-Step Process

1. **Navigate to Members Page**
   - Click **"Members"** in sidebar
   - You'll see all organization members
   - URL: `/org/{slug}/members`

2. **Open Assign Role Dialog**
   - Find the member you want to assign a role to
   - Click the **Actions** dropdown (⋮ icon)
   - Select **"Assign Custom Role"** (Shield icon)

3. **Select Role from Dialog**
   - Roles are **grouped by module**
   - Each role shows:
     - Role name with predefined badge
     - Module name
     - Description
     - Number of permissions
   - Roles already assigned are **filtered out**

4. **View Role Details** (Optional)
   - When you select a role, details appear below:
     - Module name
     - Permission count
     - List of all permissions (resource + action)

5. **Confirm Assignment**
   - Click **"Assign Role"** button
   - Success notification appears
   - Role badge appears in member's row

### Member Table Columns
- **Member**: Name, email, avatar
- **Role**: Organization role (Owner/Admin/Member)
- **Custom Roles**: Badges showing assigned custom roles
- **Joined**: Date member joined
- **Actions**: Dropdown menu

---

## Removing Roles from Members

### Two Methods

#### Method 1: From Members Table
1. Find the member in the Members table
2. In the **Custom Roles** column, you'll see role badges
3. Each badge has an **X button** on hover
4. Click **X** to remove the role
5. Confirmation toast appears
6. Badge disappears immediately

#### Method 2: From Actions Menu
1. Click the **Actions** dropdown (⋮ icon)
2. Select **"Assign Custom Role"**
3. Previously assigned roles show a **"Remove"** option
4. Click to remove the role

### Bulk Role Management
- You can assign multiple custom roles to the same member
- Roles from different modules can coexist
- Organization role (Owner/Admin/Member) is separate from custom roles

---

## Viewing Member Permissions

### Step-by-Step Process

1. **Navigate to Member Permissions**
   - Go to **Members** page
   - Click **Actions** dropdown (⋮ icon) for any member
   - Select **"View Permissions"** (Eye icon)
   - URL: `/org/{slug}/members/{memberId}/permissions`

2. **Summary Dashboard** (Top Section)
   - **Organization Role**: Badge showing Owner/Admin/Member
   - **Custom Roles**: Count of assigned custom roles
   - **Total Permissions**: Unique permissions count (deduplicated)

3. **Roles Breakdown** (Middle Section)
   - Expandable cards for each assigned role
   - Click to expand/collapse role details
   - **"Expand All"** / **"Collapse All"** buttons
   - Each role shows:
     - Role name with predefined badge
     - Module name
     - Permission count
     - Table of permissions (Resource, Action, Description)

4. **Consolidated Permissions** (Bottom Section)
   - All unique permissions grouped by resource
   - Shows which roles grant each permission
   - Table columns:
     - **Action**: The permission action
     - **Description**: What it allows
     - **Granted By**: Badge list of roles granting this permission

### Understanding Permission Aggregation

**Example**: Member has 2 roles with overlapping permissions

```
Role 1: Editor (5 permissions)
- TodoList → read
- TodoList → update
- TodoItem → read
- TodoItem → create
- TodoItem → update

Role 2: Reviewer (3 permissions)
- TodoList → read  [DUPLICATE]
- TodoItem → read  [DUPLICATE]
- TodoItem → comment

Total Unique Permissions: 6 (not 8)
- TodoList → read (granted by Editor, Reviewer)
- TodoList → update (granted by Editor)
- TodoItem → read (granted by Editor, Reviewer)
- TodoItem → create (granted by Editor)
- TodoItem → update (granted by Editor)
- TodoItem → comment (granted by Reviewer)
```

---

## Understanding Role Types

### Organization Roles (Base Level)
These are assigned to every member:
- **Owner**: Full organization control
- **Admin**: Manage members, roles, and modules
- **Member**: Basic member access

### Custom Roles (Module Level)
These are module-specific roles you create:
- **Predefined Roles**: System-generated when module is installed
  - Example: Admin, Editor, Viewer for TodoList module
  - Cannot be deleted (but can be edited)
  - Marked with "Predefined" badge
  
- **Custom Roles**: Roles you create
  - Fully customizable
  - Can be edited and deleted
  - Assigned per module

### Permission Hierarchy
```
Global Level
├── Organization Owner (highest)
├── Organization Admin
└── Organization Member (base)

Module Level (additive)
├── Custom Role 1 (e.g., TodoList Admin)
├── Custom Role 2 (e.g., TodoList Editor)
└── Custom Role 3 (e.g., TodoList Viewer)
```

**Key Points**:
- Organization roles are global across all modules
- Custom roles are module-specific
- Members can have multiple custom roles
- Permissions are additive (more roles = more permissions)

---

## Common Workflows

### Workflow 1: Setting Up a New Module

```
1. Module is installed in organization
   ↓
2. System auto-creates 3 predefined roles:
   - Admin (full permissions)
   - Editor (most permissions)
   - Viewer (read-only)
   ↓
3. Admin reviews predefined roles
   ↓
4. Admin creates additional custom roles if needed
   ↓
5. Admin assigns roles to team members
```

### Workflow 2: Onboarding a New Team Member

```
1. Member is added to organization (has base "Member" role)
   ↓
2. Admin goes to Members page
   ↓
3. Admin clicks "Assign Custom Role" for new member
   ↓
4. Admin selects appropriate role(s) based on member's responsibilities
   ↓
5. Member can now access module features per assigned roles
```

### Workflow 3: Adjusting Team Permissions

```
1. Admin reviews current role permissions
   ↓
2. Admin edits existing role to add/remove permissions
   ↓
3. Changes automatically apply to all members with that role
   ↓
4. No need to update each member individually
```

### Workflow 4: Removing Team Member Access

```
1. Admin goes to Members page
   ↓
2. Admin removes custom roles using X button on badges
   ↓
3. Optionally: Change organization role to "Member"
   ↓
4. Optionally: Remove member from organization entirely
```

---

## UI Components Reference

### Pages
| Page | URL | Purpose |
|------|-----|---------|
| Roles List | `/org/{slug}/roles` | View all modules and roles |
| Edit Role | `/org/{slug}/roles/{roleId}` | Edit role details and permissions |
| Members | `/org/{slug}/members` | View and manage members |
| Member Permissions | `/org/{slug}/members/{memberId}/permissions` | View member's effective permissions |

### Dialogs
| Dialog | Trigger | Purpose |
|--------|---------|---------|
| Create Role | "Create Role" button | Create new custom role |
| Delete Role | "Delete Role" button | Delete custom role with safety checks |
| Assign Role | "Assign Custom Role" menu item | Assign role to member |

### Components
| Component | Location | Features |
|-----------|----------|----------|
| Permission Matrix | Create/Edit Role | Bulk permission selection, grouped by resource |
| Role Badges | Members table | Shows assigned roles, removable |
| Member Permissions Preview | Member permissions page | Shows all effective permissions |

---

## Best Practices

### Role Design
1. **Use Predefined Roles First**: Start with Admin/Editor/Viewer before creating custom roles
2. **Descriptive Names**: Use clear names like "Content Manager" not "Role 1"
3. **Granular Permissions**: Don't always give full permissions, be selective
4. **Document Roles**: Use description field to explain role purpose
5. **Regular Audits**: Review roles and permissions quarterly

### Member Management
1. **Principle of Least Privilege**: Give minimum permissions needed
2. **Role Templates**: Create standard roles for common positions
3. **Avoid Over-Assignment**: Don't assign unnecessary roles
4. **Use Organization Roles**: For organization-wide permissions
5. **Review Regularly**: Check member permissions periodically

### Permission Matrix
1. **Read First**: Always include read permission if granting write
2. **Test Permissions**: Create test roles before assigning to members
3. **Bulk Operations**: Use Select All when creating admin roles
4. **Resource Grouping**: Understand which permissions work together
5. **Description Review**: Read permission descriptions before selecting

---

## Troubleshooting

### Cannot Delete Role
**Problem**: "This role is currently assigned to X member(s)"  
**Solution**: 
1. Go to Members page
2. Find members with this role (check Custom Roles column)
3. Remove role from all members using X button
4. Return to role and try delete again

### Cannot Find Create Role Button
**Problem**: No button visible  
**Solution**:
1. Verify you're an Admin or Owner
2. Check that module has been installed
3. Refresh the page
4. Ensure you're on `/org/{slug}/roles` page

### Role Not Appearing After Creation
**Problem**: Created role doesn't show up  
**Solution**:
1. Check browser console for errors
2. Refresh the page
3. Verify you selected at least one permission
4. Check that role name is unique

### Cannot Assign Role to Member
**Problem**: Assign Role dialog is empty  
**Solution**:
1. Verify custom roles exist in organization
2. Check if member already has all available roles
3. Ensure you have admin permissions
4. Refresh and try again

### Permissions Not Working
**Problem**: Member has role but cannot access features  
**Solution**:
1. View Member Permissions to verify role is assigned
2. Check if permissions are correctly set on role
3. Verify member has organization "Member" role (not banned)
4. Check module-specific permission checker implementation
5. Contact support if issue persists

---

## Technical Notes

### Database Models
- **Module**: Represents a feature module (e.g., TodoList)
- **OrganizationModule**: Links modules to organizations
- **ModulePermission**: Defines available permissions per module
- **CustomRole**: Custom roles created by admins
- **RolePermission**: Links roles to permissions
- **MemberModuleRole**: Assigns roles to members

### Permission Checking
Use the permission checker in your code:
```typescript
import { checkPermission } from "@/lib/permissions";

const hasAccess = await checkPermission(
  session.user.id,
  organizationId,
  "TodoList",
  "TodoItem",
  "create"
);
```

### Server Actions
All role management uses server actions in:
`app/(organization)/org/[slug]/roles/actions.ts`

Available actions:
1. `getOrganizationModuleRoles()` - Fetch roles
2. `getOrganizationModules()` - Fetch modules
3. `createCustomRoleAction()` - Create role
4. `updateRoleDetailsAction()` - Update name/description
5. `updateRolePermissionsAction()` - Update permissions
6. `deleteCustomRoleAction()` - Delete role
7. `assignRoleToMemberAction()` - Assign to member
8. `removeRoleFromMemberAction()` - Remove from member
9. `getMemberRoles()` - Get member's roles
10. `getAllOrganizationRoles()` - Get all org roles
11. `getMemberPermissionsAction()` - Get member permissions

---

## Quick Reference Card

### For Admins

**Create Role**:
1. Roles page → Create Role
2. Fill name, description
3. Select permissions
4. Save

**Assign Role**:
1. Members page → Actions (⋮)
2. Assign Custom Role
3. Select role → Assign

**Remove Role**:
1. Members page → Custom Roles column
2. Click X on role badge

**View Permissions**:
1. Members page → Actions (⋮)
2. View Permissions

### For Members

**Check Your Permissions**:
1. Ask admin to view your permissions
2. Or check what features you can access in each module

**Request Role**:
1. Contact organization admin
2. Specify which module and what access level needed

---

## Video Tutorial Outline

If you want to create video tutorials, cover these topics:

1. **Introduction (2 min)**: Overview of roles system
2. **Viewing Roles (3 min)**: Navigate and understand roles page
3. **Creating Roles (5 min)**: Step-by-step role creation
4. **Permission Matrix (4 min)**: Understanding and using the matrix
5. **Assigning Roles (4 min)**: How to assign roles to members
6. **Managing Roles (5 min)**: Edit, delete, and maintain roles
7. **Member Permissions (3 min)**: Viewing member permissions
8. **Best Practices (4 min)**: Tips and recommendations

---

## Support

For additional help:
- Check the codebase documentation in `/docs`
- Review `PERMISSIONS_SYSTEM.md` for technical details
- Contact your system administrator
- Open an issue on GitHub

---

**Last Updated**: October 29, 2025  
**Version**: 2.0 (Phase 2 Complete)
