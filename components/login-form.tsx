"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/auth-shared";
import { ActionButton, Field, InlineMessage, Input } from "@/components/ui";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.replace(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
      {error ? <InlineMessage title="Login failed" body={error} tone="warning" /> : null}
      <Field label="Username" htmlFor="username" required hint="Use the username assigned to your league account.">
        <Input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="hussein" />
      </Field>
      <Field label="Password" htmlFor="password" required hint="Passwords are case-sensitive.">
        <Input id="password" autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
      </Field>
      <ActionButton type="submit" tone="primary" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Continue"}
      </ActionButton>
    </form>
  );
}
