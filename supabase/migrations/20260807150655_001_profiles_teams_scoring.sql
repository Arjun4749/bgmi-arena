/*
# Profiles, Teams, and Scoring Configuration

## 1. Overview
Foundational tables for the BGMI Tournament Platform:
- `profiles`: extends auth.users with username, avatar, role (player/admin), ban status.
- `teams`: esports teams created by a captain.
- `team_members`: players belonging to a team.
- `scoring_configs`: configurable point system so admins can edit rules without code changes.

## 2. Security
- RLS enabled on all tables.
- `profiles`: publicly readable; each user inserts/updates their own; admins can update all.
- `teams` & `team_members`: publicly readable; only the captain manages their team and members.
- `scoring_configs`: publicly readable; only admins can write.
- Helper SECURITY DEFINER function `is_admin()` checks the caller's profile role.
*/

-- ---------- profiles (table first) ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player','admin')),
  banned boolean NOT NULL DEFAULT false,
  suspended_until timestamptz,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helper: is the current user an admin? (needs profiles to exist)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ---------- teams ----------
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text,
  logo_url text,
  captain_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_public_read" ON public.teams;
CREATE POLICY "teams_public_read" ON public.teams
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "teams_captain_insert" ON public.teams;
CREATE POLICY "teams_captain_insert" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id);

DROP POLICY IF EXISTS "teams_captain_update" ON public.teams;
CREATE POLICY "teams_captain_update" ON public.teams
  FOR UPDATE TO authenticated
  USING (auth.uid() = captain_id) WITH CHECK (auth.uid() = captain_id);

DROP POLICY IF EXISTS "teams_captain_delete" ON public.teams;
CREATE POLICY "teams_captain_delete" ON public.teams
  FOR DELETE TO authenticated USING (auth.uid() = captain_id);

-- ---------- team_members ----------
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('captain','member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_members_public_read" ON public.team_members;
CREATE POLICY "team_members_public_read" ON public.team_members
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "team_members_captain_insert" ON public.team_members;
CREATE POLICY "team_members_captain_insert" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_id AND teams.captain_id = auth.uid())
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "team_members_captain_delete" ON public.team_members;
CREATE POLICY "team_members_captain_delete" ON public.team_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_id AND teams.captain_id = auth.uid())
    OR user_id = auth.uid()
  );

-- ---------- scoring_configs ----------
CREATE TABLE IF NOT EXISTS public.scoring_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  placement_points jsonb NOT NULL DEFAULT '[{"placement":1,"points":15},{"placement":2,"points":12},{"placement":3,"points":10},{"placement":4,"points":8},{"placement":5,"points":6},{"placement":6,"points":4},{"placement":7,"points":2},{"placement":8,"points":0}]'::jsonb,
  kill_points_per_kill integer NOT NULL DEFAULT 1,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scoring_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scoring_public_read" ON public.scoring_configs;
CREATE POLICY "scoring_public_read" ON public.scoring_configs
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "scoring_admin_write" ON public.scoring_configs;
CREATE POLICY "scoring_admin_write" ON public.scoring_configs
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.scoring_configs (name, is_default)
VALUES ('Default BGMI', true)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_captain ON public.teams(captain_id);
