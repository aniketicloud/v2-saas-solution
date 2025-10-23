import { Spinner } from "@/components/ui/spinner";
import AuthLanding from "@/components/auth-landing";

export default function Loading() {
  return (
    <AuthLanding imageSrc="/placeholder.svg" imageAlt="Loading illustration">
      <div className="flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    </AuthLanding>
  );
}
