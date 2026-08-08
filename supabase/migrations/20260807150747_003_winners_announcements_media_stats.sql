/*
# Winners, Announcements, Media, Notifications, and Player Stats

## 1. Overview
- `winners`: winner gallery entries (tournament, team, prize, screenshots, payment proof, match date, stats).
- `announcements`: news/announcements published by admins.
- `media`: media gallery (winner gallery, payment proofs, highlights, posters, videos).
- `notifications`: per-user notifications.
- `player_stats`: cached per-player aggregate statistics (kills, matches, wins, avg placement, MVP points).

## 2. New Tables
- `winners` — id, tournament_id (FK), team_id (FK), team_name, team_logo_url, prize_amount, winner_screenshot_url, payment_screenshot_url, match_date, match_stats (jsonb), created_at.
- `announcements` — id, title, body, image_url, category, created_at.
- `media` — id, title, type ('winner'|'payment'|'highlight'|'poster'|'video'), image_url, video_url, created_at.
- `notifications` — id, user_id (FK profiles), message, read, link, created_at.
- `player_stats` — id, user_id (FK profiles), total_matches, total_kills, total_wins, total_points, avg_placement, mvp_points, updated_at.

## 3. Security
- `winners`, `announcements`, `media`: publicly readable; admin-only write.
- `notifications`: each user reads/updates their own; admins can insert (to send) and delete.
- `player_stats`: publicly readable; admin-only write (computed by scoring engine / admin actions).
*/

-- ---------- winners ----------
CREATE TABLE IF NOT EXISTS public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  team_name text NOT NULL,
  team_logo_url text,
  prize_amount text NOT NULL DEFAULT '0',
  winner_screenshot_url text,
  payment_screenshot_url text,
  match_date timestamptz,
  match_stats jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "winners_public_read" ON public.winners;
CREATE POLICY "winners_public_read" ON public.winners
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "winners_admin_write" ON public.winners;
CREATE POLICY "winners_admin_write" ON public.winners
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- announcements ----------
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  category text NOT NULL DEFAULT 'news',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_public_read" ON public.announcements;
CREATE POLICY "announcements_public_read" ON public.announcements
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "announcements_admin_write" ON public.announcements;
CREATE POLICY "announcements_admin_write" ON public.announcements
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- media ----------
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  type text NOT NULL CHECK (type IN ('winner','payment','highlight','poster','video')),
  image_url text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_public_read" ON public.media;
CREATE POLICY "media_public_read" ON public.media
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "media_admin_write" ON public.media;
CREATE POLICY "media_admin_write" ON public.media
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_owner_read" ON public.notifications;
CREATE POLICY "notifications_owner_read" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_owner_update" ON public.notifications;
CREATE POLICY "notifications_owner_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notifications_owner_delete" ON public.notifications;
CREATE POLICY "notifications_owner_delete" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---------- player_stats ----------
CREATE TABLE IF NOT EXISTS public.player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_matches integer NOT NULL DEFAULT 0,
  total_kills integer NOT NULL DEFAULT 0,
  total_wins integer NOT NULL DEFAULT 0,
  total_points numeric NOT NULL DEFAULT 0,
  avg_placement numeric NOT NULL DEFAULT 0,
  mvp_points numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_stats_public_read" ON public.player_stats;
CREATE POLICY "player_stats_public_read" ON public.player_stats
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "player_stats_admin_write" ON public.player_stats;
CREATE POLICY "player_stats_admin_write" ON public.player_stats
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_created ON public.winners(created_at);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
