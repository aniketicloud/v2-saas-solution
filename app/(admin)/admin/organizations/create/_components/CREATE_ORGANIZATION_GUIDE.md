# Create Organization Dialog - Implementation Guide

## Overview
A fully-featured dialog component for creating new organizations with real-time slug generation, form validation using React Hook Form and Zod v4, and proper error handling.

## Features

### ✅ Form Validation (Zod v4)
- **Organization Name**:
  - Required field
  - Minimum 3 characters
  - Maximum 100 characters
  - Automatically trims whitespace
  - Prevents leading spaces during typing
  - Prevents multiple trailing spaces
  - Cannot be only whitespace

### ✅ Auto-Generated Slug
- Automatically generated from organization name
- Converts to lowercase
- Replaces special characters and spaces with hyphens
- Removes leading/trailing hyphens
- Read-only field (disabled)
- Updates in real-time as user types

### ✅ UI/UX Features
- Field components (shadcn/ui recommended pattern)
- Inline validation error messages
- Loading states during submission
- Toast notifications for success/error
- Auto-refresh after creation
- Form reset on cancel or success

## Technology Stack

```tsx
- React Hook Form (form management)
- Zod v4 (schema validation)
- @hookform/resolvers (Zod integration)
- shadcn/ui Field components (form fields)
- Sonner (toast notifications)
- Next.js App Router (navigation)
```

## Architecture & Security

### 🔒 Dual Validation (Client + Server)
- **Client-side**: Provides immediate feedback to users
- **Server-side**: CRITICAL security validation - never trust client data
- **Shared Schema**: `schema.ts` ensures consistency between both sides

### File Structure
```
create/
├── schema.ts                    # Shared Zod schema (client + server)
├── utils.ts                     # Shared utilities (generateSlug)
├── action.ts                    # Server action with validation
└── _components/
    ├── CreateOrganizationDialog.tsx
    └── CREATE_ORGANIZATION_GUIDE.md
```

## Component Structure

```tsx
CreateOrganizationDialog/
├── Shared Zod Schema (from schema.ts)
├── React Hook Form setup
├── Auto-slug generation logic (from utils.ts)
├── Dialog UI
│   ├── Trigger Button
│   ├── Form
│   │   ├── Name Field (with validation)
│   │   ├── Slug Field (auto-generated, validated)
│   │   └── Action Buttons
│   └── Toast Notifications
```

## Usage Example

```tsx
import { CreateOrganizationDialog } from "./_components/CreateOrganizationDialog";

export default function OrganizationsPage() {
  return (
    <div>
      <CreateOrganizationDialog />
    </div>
  );
}
```

## Shared Validation Schema

Located in `../schema.ts` and used by both client and server:

```tsx
export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Organization name cannot be only whitespace",
    }),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
```

### Why Validate Slug?
Even though the slug is auto-generated and disabled on the client, we validate it on the server because:
- Client-side validation can be bypassed (e.g., via browser DevTools or API calls)
- Security best practice: **Never trust client data**
- Prevents malicious or malformed slugs from reaching the database

## Key Implementation Details

### 1. Real-Time Input Sanitization

```tsx
const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  
  // Prevent leading spaces
  if (value.startsWith(" ")) {
    value = value.trimStart();
  }
  
  // Prevent multiple trailing spaces
  if (value.endsWith("  ")) {
    value = value.trimEnd() + " ";
  }
  
  setValue("name", value);
  setValue("slug", generateSlug(value));
};
```

### 2. Slug Generation Algorithm

```tsx
const generateSlug = (value: string) => {
  return value
    .toLowerCase()                    // Convert to lowercase
    .replace(/[^a-z0-9]+/g, "-")     // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "");        // Remove leading/trailing hyphens
};
```

### 3. Form Submission Flow

```tsx
1. User types organization name → validates in real-time
2. Slug auto-generates → displays in disabled field
3. User clicks "Create Organization" → form validation runs
4. If valid → calls server action → shows loading state
5. Success → toast notification → dialog closes → form resets → page refreshes
6. Error → toast notification → user can retry
```

## Field Component Pattern (shadcn/ui)

### Basic Field Structure
```tsx
<Field data-invalid={!!errors.name}>
  <FieldLabel htmlFor="name">Label</FieldLabel>
  <Input {...register("name")} />
  {errors.name && <FieldError>{errors.name.message}</FieldError>}
</Field>
```

### Features
- `data-invalid` prop for error state styling
- `FieldError` component for validation messages
- `FieldDescription` for helper text
- `FieldGroup` for grouping multiple fields
- Automatic spacing and alignment

## Server Action Integration

```tsx
// app/(admin)/admin/organizations/create/action.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { organizationSchema } from "./schema";

export async function createOrganization(name: string, slug: string) {
  try {
    // CRITICAL: Server-side validation - never trust client data
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

### Security Notes:
- ✅ **Server validation is mandatory** - Client validation can be bypassed
- ✅ **Uses shared schema** - Ensures consistency with client-side rules
- ✅ **Validates both fields** - Name AND slug (even though slug is auto-generated)
- ✅ **Detailed error handling** - Differentiates validation vs. system errors

## Error Handling

### Client-Side Validation Errors
- Displayed inline below the field
- Red styling via `data-invalid` prop
- Accessible with `aria-invalid`

### Server-Side Errors
- Toast notification with error message
- User can retry without losing form data
- Loading state prevents duplicate submissions

## Accessibility Features

- ✅ Proper label associations (`htmlFor` / `id`)
- ✅ `aria-invalid` on invalid inputs
- ✅ Error messages associated with fields
- ✅ Disabled state during submission
- ✅ Keyboard navigation support

## Testing Checklist

- [ ] Empty name shows validation error
- [ ] Name with only spaces shows validation error
- [ ] Name under 3 characters shows validation error
- [ ] Name over 100 characters shows validation error
- [ ] Leading spaces are automatically removed
- [ ] Multiple trailing spaces are prevented
- [ ] Slug generates correctly with special characters
- [ ] Slug updates in real-time
- [ ] Form submits successfully with valid data
- [ ] Toast shows on success
- [ ] Dialog closes after success
- [ ] Page refreshes after creation
- [ ] Cancel button resets form and closes dialog
- [ ] Form is disabled during submission
- [ ] Server errors show toast notification

## Customization Options

### Modify Validation Rules
Edit the `organizationSchema` to add/change validation:
```tsx
name: z.string()
  .trim()
  .min(5, "Custom minimum message")
  .max(50, "Custom maximum message")
  .regex(/^[A-Za-z\s]+$/, "Only letters and spaces allowed")
```

### Customize Slug Generation
Modify the `generateSlug` function:
```tsx
const generateSlug = (value: string) => {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")  // Use underscores instead of hyphens
    .slice(0, 50);         // Limit slug length
};
```

### Add Additional Fields
```tsx
<Field>
  <FieldLabel htmlFor="description">Description</FieldLabel>
  <Textarea {...register("description")} />
  {errors.description && <FieldError>{errors.description.message}</FieldError>}
</Field>
```

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "zod": "^4.x",
    "@hookform/resolvers": "^5.x",
    "sonner": "^1.x"
  }
}
```

## Security Best Practices

### 🔒 Why Validate on Both Client and Server?

**Client-Side Validation (UX)**:
- ✅ Immediate feedback to users
- ✅ Reduces unnecessary server requests
- ✅ Better user experience
- ❌ **Can be bypassed** via DevTools, Postman, etc.

**Server-Side Validation (Security)**:
- ✅ **Cannot be bypassed** - runs in trusted environment
- ✅ Protects against malicious data
- ✅ Prevents database corruption
- ✅ **This is your security boundary**

### Attack Scenarios Prevented:

1. **Direct API Calls**: Attacker bypasses UI and calls server action directly
   - ✅ Server validation catches invalid data

2. **Modified Client Code**: Attacker modifies React component to accept bad data
   - ✅ Server validation catches it before database

3. **Browser DevTools**: Attacker changes disabled slug field value
   - ✅ Server validation ensures slug matches format

4. **SQL Injection**: Malicious characters in name/slug
   - ✅ Zod validation + Prisma parameterization prevents this

### Key Principle:
> **Never trust client data. Always validate on the server.**

## Related Files

- Component: `CreateOrganizationDialog.tsx`
- Server Action: `../action.ts`
- Shared Schema: `../schema.ts` ⭐ (Used by both client & server)
- Utilities: `../utils.ts` (generateSlug function)
- Auth Config: `lib/auth.ts`
- Field Components: `components/ui/field.tsx`

## Future Enhancements

- [ ] Add organization logo upload
- [ ] Add organization description field
- [ ] Check slug availability in real-time
- [ ] Add custom slug editing option
- [ ] Multi-step wizard for complex setup
- [ ] Import organizations from CSV
- [ ] Organization templates

## Support

For issues or questions:
1. Check the validation schema matches your requirements
2. Ensure all dependencies are installed (`pnpm install`)
3. Verify the server action path is correct
4. Check auth configuration allows organization creation
5. Review browser console for detailed error messages
