"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ActionButton, Field, InlineMessage, Input } from "@/components/ui";

export function CompleteAccountForm({ defaultDisplayName }: { defaultDisplayName: string }) {
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { error: authError } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please log in again.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim(), must_change_password: false })
        .eq("id", user.id);

      if (profileError) {
        setError(`Could not save profile: ${profileError.message}`);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
      {error ? <InlineMessage title="Could not save" body={error} tone="warning" /> : null}

      <Field label="Display name" htmlFor="display-name" required hint="This is the name shown on your profile and in match recaps.">
        <Input
          id="display-name"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </Field>

      <Field label="New password" htmlFor="password" required hint="At least 8 characters.">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Field label="Confirm password" htmlFor="confirm-password" required>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <ActionButton type="submit" tone="primary" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Complete setup"}
      </ActionButton>
    </form>
  );
}
