/*
# Tournaments, Matches, Registrations, and Results

## 1. Overview
Core tournament tables:
- `tournaments`: tournament metadata (name, mode, fee, prize, map, schedule, slots, status, banner, scoring config).
- `tournament_registrations`: a team's entry into a tournament with approval status.
- `matches`: individual matches within a tournament, with room id/password and a lock-until time.
- `match_results`: per-team per-match results (placement, kills, computed points).
- `tournament_standings`: cached aggregate standings per tournament (computed by the scoring engine).

## 2. New Tables
- `tournaments` — id, title, description, mode ('solo'|'duo'|'squad'), entry_fee, prize_pool, map, start_time, end_time, slots, filled, status ('upcoming'|'ongoing'|'completed'), banner_url, rules, scoring_config_id (FK), room_unlock_minutes (int), created_at.
- `tournament_registrations` — id, tournament_id (FK), team_id (FK), status ('pending'|'approved'|'rejected'), created_at. Unique on (tournament_id, team_id).
- `matches` — id, tournament_id (FK), match_number, title, scheduled_at, room_id, room_password, room_locked_until (timestamptz), status ('scheduled'|'live'|'completed'), created_at.
- `match_results` — id, match_id (FK), team_id (FK), placement, kills, placement_points, kill_points, total_points, chicken_dinner (bool), created_at.
- `tournament_standings` — id, tournament_id (FK), team_id (FK), matches_played, total_kills, total_points, chicken_dinners, avg_placement, rank.

## 3. Security
- `tournaments`: publicly readable; only admins write.
- `tournament_registrations`: publicly readable (so rosters show); captains insert for their team; admins update status; captains can delete their own registration.
- `matches`: publicly readable; only admins write.
- `match_results`: publicly readable; only admins write.
- `tournament_standings`: publicly readable; only admins write.
*/

-- ---------- tournaments ----------
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  mode text NOT NULL DEFAULT 'squad' CHECK (mode IN ('solo','duo','squad')),
  entry_fee numeric NOT NULL DEFAULT 0,
  prize_pool text NOT NULL DEFAULT '0',
  map text,
  start_time timestamptz,
  end_time timestamptz,
  slots integer NOT NULL DEFAULT 25,
  filled integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  banner_url text,
  rules text,
  scoring_config_id uuid REFERENCES public.scoring_configs(id) ON DELETE SET NULL,
  room_unlock_minutes integer NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournaments_public_read" ON public.tournaments;
CREATE POLICY "tournaments_public_read" ON public.tournaments
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tournaments_admin_write" ON public.tournaments;
CREATE POLICY "tournaments_admin_write" ON public.tournaments
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- tournament_registrations ----------
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, team_id)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations_public_read" ON public.tournament_registrations;
CREATE POLICY "registrations_public_read" ON public.tournament_registrations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "registrations_captain_insert" ON public.tournament_registrations;
CREATE POLICY "registrations_captain_insert" ON public.tournament_registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_id AND teams.captain_id = auth.uid())
  );

DROP POLICY IF EXISTS "registrations_admin_update" ON public.tournament_registrations;
CREATE POLICY "registrations_admin_update" ON public.tournament_registrations
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "registrations_captain_delete" ON public.tournament_registrations;
CREATE POLICY "registrations_captain_delete" ON public.tournament_registrations
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_id AND teams.captain_id = auth.uid())
  );

-- ---------- matches ----------
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_number integer NOT NULL DEFAULT 1,
  title text,
  scheduled_at timestamptz,
  room_id text,
  room_password text,
  room_locked_until timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_public_read" ON public.matches;
CREATE POLICY "matches_public_read" ON public.matches
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "matches_admin_write" ON public.matches;
CREATE POLICY "matches_admin_write" ON public.matches
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- match_results ----------
CREATE TABLE IF NOT EXISTS public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  placement integer NOT NULL DEFAULT 0,
  kills integer NOT NULL DEFAULT 0,
  placement_points numeric NOT NULL DEFAULT 0,
  kill_points numeric NOT NULL DEFAULT 0,
  total_points numeric NOT NULL DEFAULT 0,
  chicken_dinner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, team_id)
);

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "results_public_read" ON public.match_results;
CREATE POLICY "results_public_read" ON public.match_results
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "results_admin_write" ON public.match_results;
CREATE POLICY "results_admin_write" ON public.match_results
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- tournament_standings ----------
CREATE TABLE IF NOT EXISTS public.tournament_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  matches_played integer NOT NULL DEFAULT 0,
  total_kills integer NOT NULL DEFAULT 0,
  total_points numeric NOT NULL DEFAULT 0,
  chicken_dinners integer NOT NULL DEFAULT 0,
  avg_placement numeric NOT NULL DEFAULT 0,
  rank integer,
  UNIQUE (tournament_id, team_id)
);

ALTER TABLE public.tournament_standings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "standings_public_read" ON public.tournament_standings;
CREATE POLICY "standings_public_read" ON public.tournament_standings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "standings_admin_write" ON public.tournament_standings;
CREATE POLICY "standings_admin_write" ON public.tournament_standings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_results_match ON public.match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_results_team ON public.match_results(team_id);
CREATE INDEX IF NOT EXISTS idx_standings_tournament ON public.tournament_standings(tournament_id);
