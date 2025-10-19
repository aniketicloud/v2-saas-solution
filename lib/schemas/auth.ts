import { z } from "zod";

/**
 * Base user schema for creating users
 * Used in signup, admin user creation, and organization member invitation
 */
export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, "Name cannot be only whitespace"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .refine(
      (val) => /[a-z]/.test(val),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (val) => /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (val) => /[0-9]/.test(val),
      "Password must contain at least one number"
    ),
});

/**
 * Login schema - email and password only
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Signup schema - extends user schema with password confirmation
 */
export const signupSchema = userSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Admin user creation schema - can optionally set role
 * Password is optional for admin creation (can be set later)
 */
export const adminUserSchema = userSchema
  .extend({
    role: z.enum(["user", "admin"]).default("user"),
  })
  .partial({ password: true });

/**
 * Organization member invitation schema
 * Password is not required as user might already exist
 */
export const memberInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  role: z.enum(["member", "admin"]).default("member"),
});

// Export TypeScript types
// Using z.output to get the output type (after defaults are applied)
export type UserFormData = z.output<typeof userSchema>;
export type LoginFormData = z.output<typeof loginSchema>;
export type SignupFormData = z.output<typeof signupSchema>;
export type AdminUserFormData = z.output<typeof adminUserSchema>;
export type MemberInviteFormData = z.output<typeof memberInviteSchema>;
