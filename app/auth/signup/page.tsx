import { SignupForm } from "@/components/signup-form";
import AuthLanding from "@/components/auth-landing";
import { redirectIfAuthenticated } from "@/lib/session";
import { headers } from "next/headers";

export default async function SignupPage() {
  // Check if user is already logged in and redirect to dashboard
  await redirectIfAuthenticated({ headers: await headers() });

  return (
    <AuthLanding imageSrc="/placeholder.svg" imageAlt="Signup illustration">
      <SignupForm />
    </AuthLanding>
  );
}
