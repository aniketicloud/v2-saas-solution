# v2-saas-solution Copilot Instructions

## Project Overview
A Next.js 15 SaaS starter with multi-tenant organization support, built with App Router, Better Auth, Prisma, and shadcn/ui. Uses Turbopack for fast builds and pnpm for package management.

## Architecture & Key Concepts

### Authentication System (Better Auth)
Better Auth is a framework-agnostic TypeScript authentication library that provides comprehensive auth features.

#### Core Components
- **Server**: `lib/auth.ts` exports `auth` instance configured with:
  - `admin()` plugin for role-based access and user management
  - `organization()` plugin for multi-tenant support
  - Email/password authentication enabled
  - PostgreSQL database via Prisma adapter
- **Client**: `lib/auth-client.ts` exports `authClient`, `signIn`, `signUp`, `signOut`, `useSession`
- **API Route**: `app/api/auth/[...all]/route.ts` mounts handler with `toNextJsHandler(auth)`
  - Handles all auth endpoints: `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`, etc.
- **Session Management**: Traditional cookie-based sessions (SameSite=Lax, httpOnly, secure in production)
  - Sessions expire after 7 days by default, extend on use (updateAge threshold: 1 day)
  
#### Authentication Patterns
- **Server Components**: `auth.api.getSession({ headers: await headers() })`
- **Client Components**: `const { data: session, isPending } = useSession()`
- **Role Checks**: `session.user.role === "admin"` for admin-only features
- **Organization Access**: `auth.api.getFullOrganization({ query: { organizationSlug }, headers })`

### Multi-Tenant Architecture
Three distinct routing patterns with separate layouts:
1. **Admin**: `app/(admin)/admin/*` - Global admin dashboard (requires `role === "admin"`)
2. **User Dashboard**: `app/dashboard/*` - User's personal workspace (shows all their orgs)
3. **Organization**: `app/(organization)/org/[slug]/*` - Organization-specific workspace

**Layout Hierarchy**:
- All layouts perform server-side session checks with `auth.api.getSession()`
- Admin layout redirects non-admins to `/login`
- Org layout uses `auth.api.getFullOrganization()` to verify membership
- User dashboard is default authenticated area

### Prisma Configuration
- **Generated Client Location**: `generated/prisma` (NOT default location)
- **Import Path**: Always use `import { PrismaClient } from "../generated/prisma"`
- **Singleton Pattern**: `lib/prisma.ts` exports singleton instance to prevent connection pool exhaustion
- **Dev Workflow**: Run `pnpm dev` which includes `prisma generate` automatically

### Server Actions Pattern
- Place in `action.ts` files within route folders (e.g., `app/dashboard/organizations/action.ts`)
- Always include `"use server"` directive at top
- Pass headers for session context: `auth.api.methodName({ body: {...}, headers: await headers() })`
- Return structured responses: `{ success: boolean, data?: T, error?: string }`
- Better Auth API methods available on `auth.api.*`:
  - `createOrganization`, `listOrganizations`, `getFullOrganization`
  - `signUpEmail`, `signInEmail`, `getSession`
  - `setPassword`, `updateUser`, `deleteUser` (with admin plugin)

### UI Components (shadcn/ui)
- **Style**: "new-york" variant with CSS variables enabled
- **Base Color**: zinc
- **Path Alias**: `@/components/ui/*` for UI primitives
- **Pattern**: Components use CVA (class-variance-authority) for variants
- **Button Example**: `<Button variant="destructive" size="sm">Delete</Button>`
- **Icons**: lucide-react (already configured)
- **Adding Components**: Use shadcn CLI or manually add to `components/ui/`

### Navigation Components
Three specialized nav components match the routing structure:
- `AdminNav` - Admin sidebar in dark gray (`app/(admin)/admin/layout.tsx`)
- `DashboardNav` - User dashboard sidebar with module links
- `OrgNav` - Organization-specific navigation

### Form Patterns
Client components use authClient methods:
```tsx
"use client";
import { authClient } from "@/lib/auth-client";

// Sign in
const { data, error } = await authClient.signIn.email({ 
  email, 
  password, 
  rememberMe, // optional, defaults to true
  callbackURL: "/dashboard" // optional redirect
});

// Sign up
const { data, error } = await authClient.signUp.email({
  name,
  email,
  password,
  callbackURL: "/dashboard"
});

// Sign out
await authClient.signOut();
```

Use `Field`, `FieldLabel`, `FieldDescription` from `@/components/ui/field` for consistent form styling.

**Error Handling**:
- Check `error` object for sign-in/sign-up failures
- Status 403 typically means email verification required
- Use callbacks: `onError`, `onSuccess` for custom handling

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required for Prisma)
- `NEXT_PUBLIC_API_URL` - API base URL for auth client (defaults to localhost:3000)

## Development Workflows

### Running the Project
```bash
pnpm dev          # Starts dev server with Turbopack & runs prisma generate
pnpm build        # Production build with Turbopack
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database Migrations
```bash
npx prisma migrate dev --name <migration_name>    # Create & apply migration
npx prisma generate                               # Regenerate client (auto-runs with pnpm dev)
npx prisma studio                                 # Visual database browser
```

### Adding New Protected Routes
1. Choose route group: `(admin)`, `(organization)`, or root `dashboard`
2. Layout automatically handles auth - no need to check session again in page
3. For org routes, access org data from layout props: `params.slug`
4. Use server actions in `action.ts` for mutations

### Role-Based Features
- Check `session.user.role` in layouts/pages
- Admin plugin config in `lib/auth.ts` controls org creation: `allowUserToCreateOrganization: async (user) => user.role === "admin"`
- Hide UI for non-admins client-side, but always verify server-side

## Common Patterns

### Server Component Data Fetching
```tsx
// Get current session
const session = await auth.api.getSession({ headers: await headers() });

// List user's organizations
const organizations = await auth.api.listOrganizations({ headers: await headers() });

// Get full organization with members
const organization = await auth.api.getFullOrganization({
  query: { organizationSlug: "my-org" },
  headers: await headers(),
});
```

### Client Component Auth State
```tsx
"use client";
import { useSession } from "@/lib/auth-client";

const { data: session, isPending } = useSession();

if (isPending) return <div>Loading...</div>;
if (!session) return <div>Not authenticated</div>;

// Access user data
const { user, session: sessionData } = session;
```

### Creating Server Actions
```tsx
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createOrganization(name: string) {
  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const data = await auth.api.createOrganization({
      body: { name, slug },
      headers: await headers(),
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### Password Hashing
Better Auth uses `scrypt` by default. For bcrypt (e.g., migrations):
```tsx
import bcrypt from "bcrypt";

export const auth = betterAuth({
  emailAndPassword: {
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash)
    }
  }
});
```

### Email Verification
Configure verification email sending:
```tsx
export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Click: ${url}`
      });
    },
    sendOnSignUp: true, // Auto-send on registration
    autoSignInAfterVerification: true // Auto sign-in after verify
  }
});
```

## Project Conventions
- Use absolute imports with `@/` prefix (configured in `tsconfig.json`)
- Server Components by default - add `"use client"` only when needed (hooks, events)
- Route groups use parentheses: `(admin)`, `(organization)` - not in URLs
- Component files use PascalCase: `CreateOrganizationDialog.tsx`
- Utility functions in `lib/`, reusable components in `components/`
- Prefer Server Actions over API routes for mutations
