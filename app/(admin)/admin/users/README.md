# Admin User Management

Comprehensive user management system for admins with full CRUD operations and Better Auth admin features.

## Features Implemented

### 1. **CRUD Operations**
- ✅ View user details
- ✅ Update user (name, email, role)
- ✅ Delete user (hard delete with confirmation)

### 2. **Better Auth Admin Features**
- ✅ **Ban User** - Ban users with reason and optional expiration
- ✅ **Unban User** - Remove ban from users
- ✅ **List Sessions** - View all active sessions for a user
- ✅ **Revoke Session** - Revoke specific user session
- ✅ **Revoke All Sessions** - Log out user from all devices
- ✅ **Impersonate User** - Login as a user to test their experience
- ✅ **Stop Impersonation** - Return to admin session

### 3. **User Interface**
- ✅ Enhanced user list with action dropdowns
- ✅ Detailed user profile page
- ✅ Edit user form with validation
- ✅ Session management interface
- ✅ Admin action buttons with confirmations
- ✅ Impersonation banner (for future use)

## File Structure

```
app/(admin)/admin/users/
├── _lib/
│   └── actions.ts                 # All server actions for user management
├── _components/
│   ├── columns.tsx                # Table columns with actions dropdown
│   ├── data-table.tsx             # Data table component
│   ├── UsersList.tsx              # Users list component
│   ├── UsersHeader.tsx            # Header component
│   ├── index.ts                   # Component exports
│   └── user-detail/
│       ├── index.ts               # Detail component exports
│       ├── user-edit-form.tsx     # Edit user form
│       ├── user-ban-dialog.tsx    # Ban user dialog
│       ├── user-unban-button.tsx  # Unban user button
│       ├── user-sessions-card.tsx # Session management card
│       ├── user-impersonate-button.tsx  # Impersonate button
│       └── user-delete-dialog.tsx # Delete user dialog
├── [id]/
│   └── page.tsx                   # User detail page
├── page.tsx                       # Users list page
└── action.ts                      # Original list users action

components/
├── ui/
│   └── textarea.tsx               # Textarea component (newly created)
└── impersonation-banner.tsx       # Impersonation banner component
```

## Server Actions

All server actions are located in `app/(admin)/admin/users/_lib/actions.ts`:

### User Operations
- `getUserById(userId)` - Get user details
- `updateUser(userId, data)` - Update user information
- `deleteUser(userId)` - Delete user account

### Ban Management
- `banUser({ userId, reason, expiresIn })` - Ban a user
- `unbanUser(userId)` - Unban a user

### Session Management
- `listUserSessions(userId)` - List all user sessions
- `revokeSession(sessionToken)` - Revoke specific session
- `revokeUserSessions(userId)` - Revoke all sessions

### Role Management
- `setUserRole(userId, role)` - Set user role (admin/user)

### Impersonation
- `impersonateUser(userId)` - Start impersonating a user
- `stopImpersonation()` - Stop impersonating and return to admin

## Usage

### Viewing Users
Navigate to `/admin/users` to see the list of all users.

### Managing a User
1. Click the three-dot menu on any user row
2. Select "View Details" or "Manage User"
3. You'll be taken to the user detail page

### User Detail Page
The user detail page (`/admin/users/[id]`) displays:

1. **User Information Card** - Basic user info with badges
2. **Edit User Card** - Form to update name, email, and role
3. **Active Sessions Card** - List of all active sessions with revoke options
4. **Admin Actions Card** - Buttons for:
   - Impersonate User
   - Ban/Unban User
   - Delete User

### Ban a User
1. Navigate to user detail page
2. Click "Ban User" button
3. Enter ban reason (required)
4. Optionally set expiration in days
5. Confirm the action

### Impersonate a User
1. Navigate to user detail page
2. Click "Impersonate User"
3. Confirm the action
4. You'll be redirected to dashboard as that user
5. Use the impersonation banner to stop impersonating

### Session Management
On the user detail page, the "Active Sessions" card shows:
- Device/Browser information
- IP Address
- Expiration date/time
- Revoke button for each session
- "Revoke All" button to log out from all devices

## Security

All actions:
- ✅ Require admin authentication via `requireAdmin()`
- ✅ Use server actions (not exposed to client)
- ✅ Include input validation with Zod schemas
- ✅ Use proper error handling with `tryCatch` utility
- ✅ Revalidate paths after mutations
- ✅ Show confirmation dialogs for destructive actions

## Better Auth Integration

This implementation follows the [Better Auth Admin Plugin documentation](https://www.better-auth.com/docs/plugins/admin) and uses:

- `auth.api.listUsers()` - List and filter users
- `auth.api.adminUpdateUser()` - Update user data
- `auth.api.removeUser()` - Delete user
- `auth.api.banUser()` - Ban user with reason
- `auth.api.unbanUser()` - Unban user
- `auth.api.listUserSessions()` - List sessions
- `auth.api.revokeUserSession()` - Revoke single session
- `auth.api.revokeUserSessions()` - Revoke all sessions
- `auth.api.setRole()` - Change user role
- `auth.api.impersonateUser()` - Start impersonation
- `auth.api.stopImpersonating()` - Stop impersonation

## Next Steps

To use the impersonation banner:
1. Check if the session contains impersonation data
2. Add `<ImpersonationBanner />` to your main layout when impersonating
3. The banner will show with a "Stop Impersonation" button

Example:
```tsx
import { ImpersonationBanner } from "@/components/impersonation-banner";

export default function Layout({ children }) {
  // Check if user is impersonating (you'll need to add this to your session)
  const isImpersonating = false; // Replace with actual check
  
  return (
    <>
      {isImpersonating && <ImpersonationBanner />}
      {children}
    </>
  );
}
```
