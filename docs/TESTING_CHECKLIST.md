# Roles & Permissions - Testing Checklist

Use this checklist to verify all features are working correctly in your UI.

## Prerequisites Setup
- [ ] Dev server is running (`pnpm dev`)
- [ ] Database has TodoList module with permissions
- [ ] Organization "nikefy" exists
- [ ] You're logged in as an admin/owner
- [ ] At least 2-3 members exist in organization

---

## 1. Viewing Roles & Permissions Page

### Navigate to Roles Page
- [ ] Click "Roles & Permissions" in left sidebar
- [ ] URL shows `/org/{slug}/roles`
- [ ] Page loads without errors

### Verify Summary Stats
- [ ] "Total Modules" card shows correct count
- [ ] "Total Roles" card shows correct count
- [ ] "Total Members" card shows correct count

### Verify Module Cards
- [ ] TodoList module card is visible
- [ ] Shows "Roles: X" count
- [ ] Shows "Members: X" count
- [ ] "Create Role" button is visible

### Verify Predefined Roles
- [ ] "Admin" role is listed with "Predefined" badge
- [ ] "Editor" role is listed with "Predefined" badge
- [ ] "Viewer" role is listed with "Predefined" badge
- [ ] Each role shows permission count
- [ ] Each role shows member count
- [ ] Edit button works for each role
- [ ] Delete button is disabled/hidden for predefined roles

---

## 2. Creating Custom Roles

### Open Create Dialog
- [ ] Click "Create Role" button in module card
- [ ] Dialog opens with form
- [ ] Module is pre-selected (TodoList)

### Fill Role Details
- [ ] Enter name: "Test Manager"
- [ ] Enter description: "Test role for managing items"
- [ ] Both fields accept input

### Select Permissions Using Matrix
- [ ] Permission matrix table is visible
- [ ] Permissions grouped by resource (TodoList, TodoItem)
- [ ] Each permission shows:
  - [ ] Resource name
  - [ ] Action (create, read, update, delete, etc.)
  - [ ] Description
  - [ ] Checkbox

### Test Bulk Selection
- [ ] Click "Select All" - all checkboxes checked
- [ ] Counter shows "10 permissions selected"
- [ ] Click "Deselect All" - all checkboxes unchecked
- [ ] Counter shows "0 permissions selected"

### Create Role
- [ ] Select 5-6 permissions manually
- [ ] Counter updates correctly
- [ ] Click "Create Role" button
- [ ] Success toast notification appears
- [ ] Dialog closes
- [ ] New role appears in roles list

### Verify Created Role
- [ ] Role "Test Manager" is visible
- [ ] Shows correct description
- [ ] Shows correct permission count
- [ ] Shows "0 members" initially
- [ ] Has edit and delete buttons

---

## 3. Editing Roles

### Navigate to Edit Page
- [ ] Click "Edit" button on "Test Manager" role
- [ ] URL changes to `/org/{slug}/roles/{roleId}`
- [ ] Edit page loads

### Edit Role Details Section
- [ ] Role name is displayed and editable
- [ ] Description is displayed and editable
- [ ] Change name to "Test Manager Updated"
- [ ] Change description
- [ ] Click "Save Details" button
- [ ] Success toast appears
- [ ] Changes are saved

### Edit Permissions Section
- [ ] Permission matrix is displayed
- [ ] Previously selected permissions are checked
- [ ] Add 2 more permissions
- [ ] Remove 1 permission
- [ ] Counter updates (e.g., "7 permissions selected")
- [ ] "Unsaved changes" warning appears
- [ ] Click "Save Permissions" button
- [ ] Success toast appears
- [ ] Warning disappears

### Verify Member Count Display
- [ ] "X members have this role" is displayed
- [ ] Count is accurate

### Test Delete Button
- [ ] Red "Delete Role" button is visible at bottom
- [ ] (Don't click yet - we'll test later)

---

## 4. Assigning Roles to Members

### Navigate to Members Page
- [ ] Click "Members" in sidebar
- [ ] Members page loads
- [ ] Table shows all members

### Verify Table Columns
- [ ] Member (avatar, name, email)
- [ ] Role (org role badge)
- [ ] Custom Roles (new column)
- [ ] Joined (date)
- [ ] Actions (dropdown)

### Open Assign Role Dialog
- [ ] Click Actions dropdown (⋮) for a member
- [ ] "Assign Custom Role" option visible with shield icon
- [ ] Click it
- [ ] Dialog opens

### Verify Dialog Content
- [ ] Roles grouped by module (shows "TodoList")
- [ ] "Test Manager Updated" role is listed
- [ ] Each role shows:
  - [ ] Role name
  - [ ] Module name
  - [ ] Description
  - [ ] Permission count
  - [ ] Predefined badge (if applicable)

### Assign Role
- [ ] Click on "Test Manager Updated" role
- [ ] Role details appear below selection:
  - [ ] Module name
  - [ ] Permission count
  - [ ] List of permissions
- [ ] Click "Assign Role" button
- [ ] Success toast appears
- [ ] Dialog closes

### Verify Assignment
- [ ] Member row shows role badge in "Custom Roles" column
- [ ] Badge shows "Test Manager Updated"
- [ ] Tooltip on hover shows module name
- [ ] X button appears on hover

### Assign Multiple Roles
- [ ] Assign another role (e.g., "Editor") to same member
- [ ] Both role badges appear
- [ ] Both are removable

### Verify Role Filtering
- [ ] Open assign dialog again for same member
- [ ] Already assigned roles are NOT in the list
- [ ] Only unassigned roles appear

---

## 5. Viewing Member Permissions

### Navigate to Permissions Page
- [ ] On Members page, click Actions (⋮) for member with roles
- [ ] "View Permissions" option visible with eye icon
- [ ] Click it
- [ ] URL changes to `/org/{slug}/members/{memberId}/permissions`
- [ ] Page loads

### Verify Summary Dashboard
- [ ] "Effective Permissions for [Name]" title shows
- [ ] Organization Role badge displays (Owner/Admin/Member)
- [ ] "Custom Roles" count is correct
- [ ] "Total Permissions" count is correct (deduplicated)

### Verify Roles Breakdown Section
- [ ] "Roles Breakdown" card is visible
- [ ] "Expand All" / "Collapse All" buttons work
- [ ] Each assigned role has a collapsible card:
  - [ ] Role name with predefined badge
  - [ ] Module name • Permission count
  - [ ] Click to expand
  - [ ] Table of permissions (Resource, Action, Description)
  - [ ] All permissions for that role are listed

### Verify Consolidated Permissions
- [ ] "All Permissions (Consolidated)" card is visible
- [ ] Permissions grouped by resource
- [ ] Each resource section shows:
  - [ ] Resource name as header
  - [ ] Table with Action, Description, "Granted By"
  - [ ] "Granted By" shows badge list of roles granting permission
- [ ] Duplicate permissions show multiple role badges

### Test Navigation
- [ ] "Back to Members" button works
- [ ] Returns to members page

### Test with Member Having No Custom Roles
- [ ] View permissions for member without custom roles
- [ ] Blue info box appears: "No Custom Roles Assigned"
- [ ] Shows only org role
- [ ] Total permissions = 0

---

## 6. Removing Roles from Members

### Method 1: Remove via Badge
- [ ] On Members page, find member with custom roles
- [ ] Hover over role badge in "Custom Roles" column
- [ ] X button appears
- [ ] Click X button
- [ ] Confirmation toast appears
- [ ] Badge disappears immediately
- [ ] Member still visible in table

### Method 2: Verify in Edit Page
- [ ] Go to Roles page
- [ ] Edit the role you just removed
- [ ] Member count decreased by 1
- [ ] Confirms removal worked

### Re-assign for Testing
- [ ] Re-assign a role to member for next tests

---

## 7. Deleting Roles

### Test Delete Protection (Role with Members)
- [ ] Go to Roles page
- [ ] Edit "Test Manager Updated" (that has members assigned)
- [ ] Click "Delete Role" button
- [ ] Delete confirmation dialog opens
- [ ] Warning message shows:
  - [ ] "This role is currently assigned to X member(s)"
  - [ ] Cannot delete message
- [ ] "Delete" button is disabled or shows error
- [ ] Click Cancel

### Remove All Members First
- [ ] Go to Members page
- [ ] Remove "Test Manager Updated" from all members
- [ ] Return to edit role page
- [ ] Verify member count = 0

### Test Successful Deletion
- [ ] Click "Delete Role" button again
- [ ] Warning dialog appears
- [ ] No member assignment error
- [ ] Warning about permanent deletion
- [ ] Click "Delete" button
- [ ] Success toast appears
- [ ] Redirected to Roles page
- [ ] Role no longer in list

### Test Predefined Role Protection
- [ ] Try to delete "Admin" role
- [ ] Delete button should be disabled/hidden
- [ ] Or shows error "Cannot delete predefined roles"

---

## 8. Permission Matrix Features

### Test in Create Dialog
- [ ] Open create role dialog
- [ ] Permission matrix displayed

### Test Select All / Deselect All
- [ ] Click "Select All"
- [ ] All 10 permissions checked
- [ ] Counter: "10 permissions selected"
- [ ] Click "Deselect All"
- [ ] All unchecked
- [ ] Counter: "0 permissions selected"

### Test Individual Selection
- [ ] Check TodoList → read
- [ ] Counter: "1 permission selected"
- [ ] Check TodoItem → create, read, update
- [ ] Counter: "4 permissions selected"
- [ ] Uncheck TodoItem → read
- [ ] Counter: "3 permissions selected"

### Test Resource Grouping
- [ ] Permissions under "TodoList" resource
- [ ] Permissions under "TodoItem" resource
- [ ] Clear visual separation
- [ ] Resource names are capitalized

### Test Permission Descriptions
- [ ] Each permission has description
- [ ] Descriptions are readable
- [ ] Descriptions explain what permission does

---

## 9. UI/UX Testing

### Test Responsive Design
- [ ] Resize browser window
- [ ] Cards stack properly on mobile
- [ ] Tables scroll horizontally if needed
- [ ] Dialogs fit on screen
- [ ] Buttons remain accessible

### Test Loading States
- [ ] Refresh page, observe loading spinner
- [ ] Submit forms, observe button loading state
- [ ] No flash of empty content

### Test Error Handling
- [ ] Try creating role with duplicate name
- [ ] Error toast appears
- [ ] Form doesn't submit
- [ ] Try invalid operations
- [ ] Appropriate error messages

### Test Toast Notifications
- [ ] All CRUD operations show toasts
- [ ] Success toasts are green/positive
- [ ] Error toasts are red/negative
- [ ] Toasts auto-dismiss after 3-5 seconds

### Test Empty States
- [ ] Create org with no modules (if possible)
- [ ] Verify empty state message
- [ ] Create module with no custom roles
- [ ] Verify appropriate messaging

---

## 10. Integration Testing

### Test Complete User Journey
1. **Create Custom Role**
   - [ ] Create "Project Manager" role
   - [ ] Select 8 permissions
   - [ ] Save successfully

2. **Assign to Member**
   - [ ] Go to Members page
   - [ ] Assign "Project Manager" to user
   - [ ] Verify badge appears

3. **View Member Permissions**
   - [ ] View permissions for that member
   - [ ] See "Project Manager" in breakdown
   - [ ] See all 8 permissions listed
   - [ ] Consolidated view shows all permissions

4. **Edit Role Permissions**
   - [ ] Edit "Project Manager" role
   - [ ] Add 2 more permissions
   - [ ] Save changes

5. **Verify Auto-Update**
   - [ ] View member permissions again
   - [ ] Now shows 10 permissions
   - [ ] Changes propagated to member

6. **Remove Role**
   - [ ] Remove "Project Manager" from member
   - [ ] View permissions
   - [ ] Role no longer listed
   - [ ] Permission count decreased

7. **Delete Role**
   - [ ] Delete "Project Manager" role
   - [ ] Verify deleted from list

---

## 11. Edge Cases

### Test Long Names
- [ ] Create role with very long name (50+ chars)
- [ ] Verify UI handles it (truncates, wraps, scrolls)
- [ ] Same for long descriptions

### Test Special Characters
- [ ] Create role with name: "Test & Manager (Beta)"
- [ ] Verify saves correctly
- [ ] Verify displays correctly

### Test Many Roles
- [ ] Create 10+ custom roles in one module
- [ ] Verify list scrolls properly
- [ ] Verify performance is acceptable

### Test Many Members
- [ ] Assign role to many members (10+)
- [ ] Verify member count is accurate
- [ ] Verify delete protection works
- [ ] Verify performance

### Test Concurrent Operations
- [ ] Open two browser tabs
- [ ] Edit same role in both
- [ ] Save in tab 1
- [ ] Try to save in tab 2
- [ ] Verify conflict handling

---

## 12. Browser Console Check

### No Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] No red errors during normal operations
- [ ] No yellow warnings (or acceptable ones only)

### Network Requests
- [ ] Check Network tab
- [ ] All API calls return 200/201 success
- [ ] No 404 or 500 errors
- [ ] Reasonable load times

---

## 13. Database Verification

### Using Prisma Studio
```bash
pnpm prisma studio
```

- [ ] Open Prisma Studio
- [ ] Check `CustomRole` table:
  - [ ] Created roles exist
  - [ ] isPredefined = true for Admin/Editor/Viewer
  - [ ] isPredefined = false for custom roles
  - [ ] isActive = true for all
- [ ] Check `RolePermission` table:
  - [ ] Correct permissions linked to roles
  - [ ] granted = true
- [ ] Check `MemberModuleRole` table:
  - [ ] Member assignments exist
  - [ ] Correct memberId and customRoleId
  - [ ] assignedBy is populated

---

## 14. Accessibility Testing

### Keyboard Navigation
- [ ] Tab through forms
- [ ] All interactive elements focusable
- [ ] Enter key submits forms
- [ ] Escape key closes dialogs

### Screen Reader (Optional)
- [ ] Use NVDA/JAWS to test
- [ ] All buttons have labels
- [ ] All form fields have labels
- [ ] Meaningful alt text

### Color Contrast
- [ ] Text is readable on all backgrounds
- [ ] Badge colors have sufficient contrast
- [ ] Disabled buttons are distinguishable

---

## 15. Performance Testing

### Page Load Times
- [ ] Roles page loads in < 2 seconds
- [ ] Members page loads in < 2 seconds
- [ ] Edit role page loads in < 1 second
- [ ] Permissions page loads in < 2 seconds

### Operation Speed
- [ ] Creating role completes in < 1 second
- [ ] Assigning role completes in < 1 second
- [ ] Updating permissions completes in < 1 second
- [ ] Deleting role completes in < 1 second

---

## Testing Summary

### Critical Features
- [ ] ✅ View all roles
- [ ] ✅ Create custom role
- [ ] ✅ Edit role details
- [ ] ✅ Edit role permissions
- [ ] ✅ Delete role (with protection)
- [ ] ✅ Assign role to member
- [ ] ✅ Remove role from member
- [ ] ✅ View member permissions
- [ ] ✅ Permission matrix works
- [ ] ✅ Role filtering works

### Quality Checks
- [ ] ✅ No TypeScript errors
- [ ] ✅ No console errors
- [ ] ✅ All CRUD operations work
- [ ] ✅ UI is responsive
- [ ] ✅ Toasts show appropriately
- [ ] ✅ Navigation works correctly
- [ ] ✅ Data persists correctly
- [ ] ✅ Edge cases handled

---

## Issues Found During Testing

Document any issues here:

1. **Issue**: [Description]
   - **Steps**: [How to reproduce]
   - **Expected**: [What should happen]
   - **Actual**: [What actually happens]
   - **Severity**: High / Medium / Low
   - **Status**: Open / Fixed

---

## Sign-off

- [ ] All critical features tested and working
- [ ] All quality checks passed
- [ ] No blocking issues found
- [ ] Ready for production

**Tested By**: _________________  
**Date**: _________________  
**Browser**: _________________  
**Notes**: _________________

---

**Quick Test Commands**

```bash
# Start dev server
pnpm dev

# Open Prisma Studio
pnpm prisma studio

# Check for TypeScript errors
pnpm tsc --noEmit

# Run linter
pnpm lint
```
