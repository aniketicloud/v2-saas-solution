"use client";

/**
 * OrganizationForm Component
 *
 * Shared form component for creating and editing organizations.
 *
 * Features:
 * - React Hook Form + Zod v4 validation
 * - Auto-generated slugs from organization name
 * - Real-time input sanitization
 * - Inline validation error messages
 * - Toast notifications & navigation on success
 * - Supports both create and edit modes
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createOrganization } from "../_lib/actions";
import { generateSlug } from "../_lib/utils";
import { organizationSchema, type OrganizationFormData } from "../_lib/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: OrganizationFormData;
  organizationId?: string;
}

export function OrganizationForm({
  mode,
  initialData,
  organizationId,
}: OrganizationFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
    },
  });

  // Watch name field and update slug automatically (only in create mode)
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

    // Only auto-generate slug in create mode
    if (mode === "create") {
      setValue("slug", generateSlug(value));
    }
  };

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      if (mode === "create") {
        const result = await createOrganization(data.name, data.slug);

        if (result.success) {
          toast.success(`Organization "${data.name}" created successfully!`);
          router.push("/admin/organizations");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create organization");
        }
      } else {
        // Edit mode - to be implemented
        toast.error("Edit functionality not yet implemented");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6">
          <FieldGroup>
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
              <FieldDescription>
                The display name for your organization
              </FieldDescription>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug">
                Slug {mode === "create" && "(auto-generated)"}
              </FieldLabel>
              <Input
                id="slug"
                {...register("slug")}
                disabled={mode === "create" || isSubmitting}
                className={mode === "create" ? "bg-muted" : ""}
                aria-invalid={!!errors.slug}
                placeholder={mode === "edit" ? "organization-slug" : ""}
              />
              <FieldDescription>
                This will be used in URLs and identifiers
              </FieldDescription>
              {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/organizations")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Organization"
            ) : (
              "Update Organization"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
