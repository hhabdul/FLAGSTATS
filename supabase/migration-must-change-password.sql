-- Migration: add must_change_password to profiles
-- Run this in the Supabase SQL editor for existing databases.

alter table public.profiles
  add column if not exists must_change_password boolean not null default true;

-- Allow authenticated users to update their own display_name and must_change_password
-- (but not escalate their role).
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid() and
    role = public.current_app_role()
  );

-- Mark existing users as already having a valid password so they are not
-- forced through the completion flow on the next login. Remove this line
-- if you want all existing accounts to be gated.
update public.profiles set must_change_password = false;
