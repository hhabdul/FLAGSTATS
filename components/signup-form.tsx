"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { normalizeUsername, usernameToEmail } from "@/lib/auth-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ActionButton, Field, InlineMessage, Input } from "@/components/ui";

export function SignupForm() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const normalizedUsername = normalizeUsername(username);
      const email = usernameToEmail(normalizedUsername);

      const signUp = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: normalizedUsername,
            display_name: displayName
          }
        }
      });

      if (signUp.error) {
        setError(signUp.error.message);
        return;
      }

      if (!signUp.data.user) {
        setError("Account creation failed.");
        return;
      }

      if (!signUp.data.session) {
        setNotice("Account created. Sign in once email confirmation is disabled or after your account is activated.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: signUp.data.user.id,
        display_name: displayName,
        slug: normalizedUsername,
        position: "Member",
        bio: inviteCode ? `Invite: ${inviteCode}` : "",
        role: "Member"
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
      {error ? <InlineMessage title="Could not create account" body={error} tone="warning" /> : null}
      {notice ? <InlineMessage title="Account created" body={notice} tone="info" /> : null}
      <Field label="Display name" htmlFor="display-name" required hint="This is the name shown on profiles and standings.">
        <Input id="display-name" autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Hussein Abdullah" />
      </Field>
      <Field label="Username" htmlFor="username" required hint="Usernames are unique and become your login.">
        <Input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder="hussein" />
      </Field>
      <Field label="Password" htmlFor="password" required hint="At least 8 characters is recommended.">
        <Input id="password" autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
      </Field>
      <Field label="Invite code" htmlFor="invite-code" hint="Optional. New accounts always start as members.">
        <Input id="invite-code" autoComplete="off" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="MEMBER" />
      </Field>
      <ActionButton type="submit" tone="primary" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </ActionButton>
    </form>
  );
}
