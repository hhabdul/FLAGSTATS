import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in with your league username and password."
        alternateHref="/signup"
        alternateLabel="Need an account?"
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
