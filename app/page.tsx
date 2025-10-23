import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to the App</h1>
        <p className="text-muted-foreground mb-6">
          A minimal home page. Use the navigation to sign in or visit the
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Sign in
          </Link>
          <Link href="/dashboard" className="underline">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
