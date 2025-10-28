# How to Stop Impersonating a User

When you impersonate a user as an admin, Better Auth creates a special session that mimics that user. Here's how to stop impersonating:

## 🎯 Two Ways to Stop Impersonating

### 1. **Using the Impersonation Banner** (Automatic - Recommended)

The `ImpersonationBanner` component is now added to your root layout (`app/layout.tsx`) and will **automatically appear** when you're impersonating a user.

**What happens:**
1. When you click "Impersonate User" on any user detail page
2. You're redirected to `/dashboard` as that user
3. A red banner appears at the top of **every page** with "Stop Impersonation" button
4. Click the button to return to your admin session

**Banner Location:** Top of the page on all routes when impersonating

### 2. **Using Client-Side API** (Manual)

If you need to stop impersonation programmatically in your own components:

```tsx
import { authClient } from "@/lib/auth-client";

async function stopImpersonating() {
  await authClient.admin.stopImpersonating();
  // Redirect or refresh
  window.location.href = "/admin/users";
}
```

### 3. **Using Server Action** (Already Implemented)

You can also call the server action directly:

```tsx
import { stopImpersonation } from "@/app/(admin)/admin/users/_lib/actions";

const result = await stopImpersonation();
if (result.success) {
  // Handle success
}
```

## 🔍 How It Works

### Session Detection

Better Auth stores impersonation info in the session:
```typescript
session.session.impersonatedBy // ID of the admin doing the impersonation
```

The `ImpersonationBanner` component checks this automatically:
```tsx
const { data: session } = useSession();
const isImpersonating = session?.session?.impersonatedBy;
```

### What Happens When You Stop

1. **Session Restoration**: Your original admin session is restored
2. **Redirect**: Automatically redirects to `/admin/users`
3. **Toast Notification**: Shows success message
4. **Banner Disappears**: The banner is removed automatically

## 📖 Complete Impersonation Flow

### Start Impersonation:
1. Go to `/admin/users`
2. Click three-dot menu on any user
3. Select "View Details" or "Manage User"
4. Click "Impersonate User" button
5. Confirm the action
6. ✅ Redirected to `/dashboard` as that user
7. ✅ Red banner appears at the top

### While Impersonating:
- You see the application **exactly as the user sees it**
- All actions are performed **as that user**
- The banner is visible on **every page**
- You can navigate anywhere in the app

### Stop Impersonation:
1. Click "Stop Impersonation" on the red banner
2. ✅ Returned to your admin session
3. ✅ Redirected to `/admin/users`
4. ✅ Banner disappears

## 🔒 Security Notes

- Only users with `role: "admin"` can impersonate
- The impersonation session expires after **1 hour** (default)
- All actions during impersonation are logged as the impersonated user
- The admin's original session is preserved and restored

## 🎨 Banner Customization

The banner is in `components/impersonation-banner.tsx` and can be customized:

```tsx
// Current styling
className="bg-destructive/10 border-destructive/20 border rounded-lg p-4 mb-4"

// Change position (currently at top via root layout)
// Change colors, size, or add more info
```

## 🐛 Troubleshooting

### Banner Not Showing?
1. Check if impersonation actually started (check network tab for API call)
2. Verify `useSession()` hook is working
3. Check browser console for errors
4. Ensure Better Auth admin plugin is configured correctly

### Can't Stop Impersonating?
1. Try refreshing the page
2. Check browser console for errors
3. Manually navigate to `/admin/users`
4. Check that the `stopImpersonation()` server action works

### Session Issues?
- Impersonation sessions expire after 1 hour by default
- You can configure this in `auth.ts`:
  ```tsx
  admin({
    impersonationSessionDuration: 60 * 60, // seconds (1 hour)
  })
  ```

## 📝 Configuration

In your `lib/auth.ts`, you can configure impersonation:

```typescript
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin({
      impersonationSessionDuration: 60 * 60, // 1 hour in seconds
    }),
  ],
});
```

## 🎯 Best Practices

1. **Always use the banner** - It's the safest and most visible way
2. **Be cautious** - You're performing actions as the user
3. **Don't stay impersonated** - Stop as soon as you're done testing
4. **Communicate** - If you have audit logs, note when you impersonate users
5. **Test carefully** - Impersonation is powerful; use it responsibly

---

**Quick Reference:**
- Start: `/admin/users/[id]` → "Impersonate User" button
- Stop: Click "Stop Impersonation" on the red banner
- Automatic: Banner shows/hides based on impersonation state
