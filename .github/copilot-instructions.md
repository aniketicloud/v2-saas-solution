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

#### Error Handling with tryCatch Utility
**ALWAYS use the `tryCatch` utility** from `@/utils/try-catch` for cleaner error handling in server actions:

```tsx
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";

export async function createOrganization(name: string, slug: string) {
  const [result, error] = await tryCatch(
    auth.api.createOrganization({
      body: { name, slug },
      headers: await headers(),
    })
  );

  if (error) {
    console.error("Error creating organization:", error);
    return {
      success: false,
      error: error.message || "Failed to create organization",
    };
  }

  return { success: true, data: result };
}
```

**Why tryCatch over try-catch:**
- ✅ Cleaner, more linear code flow (no nested blocks)
- ✅ Go-style error handling with tuple destructuring
- ✅ Especially useful with multiple sequential async operations
- ✅ Still returns the same `{ success, data, error }` structure to clients
- ✅ Type-safe with proper TypeScript inference

**Pattern for multiple async calls:**
```tsx
export async function complexAction() {
  const [users, usersError] = await tryCatch(auth.api.listUsers({...}));
  if (usersError) return { success: false, error: usersError.message };

  const [orgs, orgsError] = await tryCatch(auth.api.listOrganizations({...}));
  if (orgsError) return { success: false, error: orgsError.message };

  return { success: true, data: { users, orgs } };
}
```

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
- `AdminSidebar` - Admin collapsible sidebar using shadcn/ui (`app/(admin)/admin/_components/admin-sidebar.tsx`)
- `DashboardNav` - User dashboard sidebar with module links
- `OrgNav` - Organization-specific navigation

### Form Patterns (React Hook Form + Zod v4)

**IMPORTANT**: Always use React Hook Form with Zod v4 for form validation. This provides type safety, better UX, and security through dual validation.

#### Required Dependencies
```bash
pnpm add react-hook-form zod@beta @hookform/resolvers
```

#### Schema-First Approach
**Always create a separate `schema.ts` file** for form validation schemas:

```tsx
// schema.ts - Shared validation schema
import { z } from "zod";

export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, "Organization name cannot be only whitespace"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

// Export type for TypeScript
export type OrganizationFormData = z.infer<typeof organizationSchema>;
```

#### Client-Side Form Component
Use `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup` from `@/components/ui/field` (shadcn/ui recommended pattern):

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { organizationSchema, type OrganizationFormData } from "./schema";

export function CreateForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    const result = await createOrganization(data.name, data.slug);
    if (result.success) {
      toast.success("Organization created!");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel>Organization Name</FieldLabel>
          <Input
            {...register("name")}
            placeholder="Acme Inc"
            aria-invalid={!!errors.name}
          />
          <FieldDescription>
            The display name for your organization
          </FieldDescription>
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel>Slug</FieldLabel>
          <Input
            {...register("slug")}
            placeholder="acme-inc"
            disabled
            aria-invalid={!!errors.slug}
          />
          <FieldDescription>
            URL-friendly identifier (auto-generated)
          </FieldDescription>
          {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" />
            Creating...
          </>
        ) : (
          "Create Organization"
        )}
      </Button>
    </form>
  );
}
```

#### Server-Side Validation (CRITICAL)
**Always validate on the server** - client validation can be bypassed. Use the same schema:

```tsx
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
```

#### Loading States with Spinner
Always use the `Spinner` component for loading indicators:

```tsx
import { Spinner } from "@/components/ui/spinner";

// In buttons
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner className="mr-2" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>

// Standalone
{isPending && <Spinner className="size-6" />}
```

#### Form Best Practices Checklist
- ✅ Create `schema.ts` file with Zod schema
- ✅ Export TypeScript type with `z.infer<typeof schema>`
- ✅ Use `zodResolver` in `useForm` hook
- ✅ Use `Field` components instead of bare `Label`
- ✅ Add `data-invalid` prop to Field for error styling
- ✅ Show `FieldError` for validation messages
- ✅ Use `aria-invalid` for accessibility
- ✅ Validate on server with same schema
- ✅ Use `Spinner` component for loading states
- ✅ Handle `isSubmitting` state to disable buttons
- ✅ Add `.trim()` to string fields to prevent whitespace-only input
- ✅ Use `.refine()` for complex validation rules

#### Security: Dual Validation Pattern
```
Client (UX)          Server (Security)
    ↓                      ↓
Zod Schema  ←────────→  Zod Schema
(schema.ts)           (schema.ts)
    ↓                      ↓
React Hook Form      Server Action
    ↓                      ↓
User sees errors     Malicious data blocked
```

**Why both?**
- Client: Immediate feedback, better UX
- Server: Cannot be bypassed, protects database

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

if (isPending) return <Spinner />;
if (!session) return <div>Not authenticated</div>;

// Access user data
const { user, session: sessionData } = session;
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
- **Always create `schema.ts` for form validation** - use same schema on client and server
- **Use Field components** instead of bare Label for forms
- **Use Spinner component** for all loading states
- **Validate on both client and server** - client for UX, server for security
