import { LoginForm } from "@/components/login-form";
import AuthLanding from "@/components/auth-landing";

export default function LoginPage() {
  return (
    <AuthLanding imageSrc="/placeholder.svg" imageAlt="Login illustration">
      <LoginForm />
    </AuthLanding>
  );
}
