"use client";

/**
 * CreateOrganizationDialog Component
 *
 * A dialog for creating new organizations with:
 * - React Hook Form + Zod v4 validation
 * - Auto-generated slugs from organization name
 * - Real-time input sanitization (no leading/trailing spaces)
 * - Field components (shadcn/ui recommended pattern)
 * - Inline validation error messages
 * - Toast notifications for feedback
 *
 * 📖 See CREATE_ORGANIZATION_GUIDE.md in this directory for:
 *    - Complete implementation details
 *    - Validation rules and customization
 *    - Testing checklist
 *    - Troubleshooting tips
 *    - Future enhancement ideas
 *
 * @see ./CREATE_ORGANIZATION_GUIDE.md
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Plus } from "lucide-react";
import { createOrganization } from "../action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Organization name cannot be only whitespace",
    }),
  slug: z.string(), // Auto-generated, no validation needed
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug when name changes
  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Watch name field and update slug automatically
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Prevent leading spaces
    if (value.startsWith(" ")) {
      value = value.trimStart();
    }

    // Prevent trailing spaces (only trim end if there's more than one space at the end)
    // This allows typing a single space between words but prevents multiple trailing spaces
    if (value.endsWith("  ")) {
      value = value.trimEnd() + " ";
    }

    setValue("name", value);
    setValue("slug", generateSlug(value));
  };

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      const result = await createOrganization(data.name);

      if (result.success) {
        toast.success("Organization created successfully!");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create organization");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your account. The slug will be generated
              automatically.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Organization Name</FieldLabel>
              <Input
                id="name"
                placeholder="My Organization"
                {...register("name")}
                onChange={handleNameChange}
                disabled={isSubmitting}
                autoComplete="off"
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug">Slug (auto-generated)</FieldLabel>
              <Input
                id="slug"
                {...register("slug")}
                disabled
                className="bg-muted"
                aria-invalid={!!errors.slug}
              />
              <FieldDescription>
                This will be used in URLs and identifiers
              </FieldDescription>
              {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
