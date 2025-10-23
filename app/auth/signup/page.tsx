import { SignupForm } from "@/components/signup-form";
import AuthLanding from "@/components/auth-landing";

export default async function SignupPage() {
  return (
    <AuthLanding imageSrc="/placeholder.svg" imageAlt="Signup illustration">
      <SignupForm />
    </AuthLanding>
  );
}
