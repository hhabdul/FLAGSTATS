-- Migration: allow coaches (and admins) to create and manage seasons.
-- Run in the Supabase SQL editor.

-- Drop the admin-only policy and replace with one that covers Admin + Coach.
DROP POLICY IF EXISTS "seasons_admin_manage" ON public.seasons;

CREATE POLICY "seasons_coach_admin_manage"
  ON public.seasons FOR ALL
  TO authenticated
  USING (public.is_captain_or_admin())
  WITH CHECK (public.is_captain_or_admin());
