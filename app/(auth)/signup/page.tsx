import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <AuthCard
        title="Create account"
        subtitle="New accounts are created as members. Admin can promote trusted users to coach."
        alternateHref="/login"
        alternateLabel="Already have an account?"
      >
        <SignupForm />
      </AuthCard>
    </div>
  );
}
