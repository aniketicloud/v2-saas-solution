"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tryCatch } from "@/utils/try-catch";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/schemas/auth";

/**
 * Server action for user login
 * Uses Better Auth server-side API
 */
export async function loginAction(data: LoginFormData) {
  try {
    // Server-side validation - CRITICAL for security
    const validatedData = loginSchema.parse(data);

    const [result, error] = await tryCatch(
      auth.api.signInEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
        },
        headers: await headers(),
      })
    );

    if (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Invalid email or password",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors.map((e: any) => e.message).join(", "),
      };
    }

    console.error("Unexpected login error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Server action for user signup
 * Uses Better Auth server-side API
 * Creates user and automatically signs them in
 */
export async function signupAction(data: SignupFormData) {
  try {
    // Server-side validation - CRITICAL for security
    const validatedData = signupSchema.parse(data);

    // Step 1: Create the user account
    const [signupResult, signupError] = await tryCatch(
      auth.api.signUpEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
          name: validatedData.name,
        },
        headers: await headers(),
      })
    );

    if (signupError) {
      console.error("Signup error:", signupError);
      
      // Check for duplicate email error
      if (signupError.message?.includes("already exists") || 
          signupError.message?.includes("duplicate")) {
        return {
          success: false,
          error: "An account with this email already exists",
        };
      }

      return {
        success: false,
        error: signupError.message || "Failed to create account",
      };
    }

    // Step 2: Automatically sign in the user
    const [signinResult, signinError] = await tryCatch(
      auth.api.signInEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
        },
        headers: await headers(),
      })
    );

    if (signinError) {
      console.error("Auto-signin error after signup:", signinError);
      return {
        success: false,
        error: "Account created successfully, but failed to sign in. Please try logging in manually.",
      };
    }

    return {
      success: true,
      data: signinResult,
    };
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors.map((e: any) => e.message).join(", "),
      };
    }

    console.error("Unexpected signup error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
