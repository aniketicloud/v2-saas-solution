import { LoginForm } from "@/components/login-form";
import AuthLanding from "@/components/auth-landing";
import { redirectIfAuthenticated } from "@/lib/session";
import { headers } from "next/headers";

export default async function LoginPage() {
  // Check if user is already logged in and redirect to dashboard
  await redirectIfAuthenticated({ headers: await headers() });

  return (
    <AuthLanding imageSrc="/placeholder.svg" imageAlt="Login illustration">
      <LoginForm />
    </AuthLanding>
  );
}
