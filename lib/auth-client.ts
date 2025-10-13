import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

// Create a single auth client instance and export its helpers.
export const authClient = createAuthClient({
  // The base URL of the server (optional if you're using the same domain)
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  plugins: [adminClient(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
// https://assets.vercel.com/image/upload/v1573246280/front/favicon/vercel/android-chrome-192x192.png
