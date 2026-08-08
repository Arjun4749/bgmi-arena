/*
# Scoring Engine: Auto-Compute Points, Standings, Stats, and Winners

## 1. Overview
Creates SECURITY DEFINER RPC functions callable by admins to power the automatic result import system:
- `compute_match_results(match_uuid)`: reads raw placement+kills for a match, computes placement_points + kill_points + total_points + chicken_dinner, and updates match_results. Then recomputes tournament_standings for that tournament.
- `recompute_tournament_standings(tournament_uuid)`: aggregates match_results into tournament_standings (matches_played, total_kills, total_points, chicken_dinners, avg_placement, rank).
- `recompute_player_stats()`: aggregates across all match_results into player_stats (per-user totals + MVP points + avg placement).
- `publish_tournament_results(tournament_uuid)`: marks tournament completed, recomputes standings + player stats, and inserts a winner gallery entry for the top team.

## 2. Functions
All SECURITY DEFINER so they can write to admin-only tables via RPC. They check `is_admin()` and error otherwise.

## 3. Security
- Functions are SECURITY DEFINER with `SET search_path = public`.
- Each function first asserts `public.is_admin()` and aborts with an exception if not admin.
- Executed via `supabase.rpc(...)` from the admin UI.
*/

-- Compute placement points from a scoring config jsonb given a placement
CREATE OR REPLACE FUNCTION public.placement_points_for(config jsonb, placement integer)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (e->>'points')::numeric
     FROM jsonb_array_elements(config) AS e
     WHERE (e->>'placement')::int = placement),
    0
  );
$$;

-- Compute + persist match_results for a match, then recompute standings
CREATE OR REPLACE FUNCTION public.compute_match_results(p_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tournament_id uuid;
  v_scoring jsonb;
  v_kill_pts integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT t.scoring_config_id INTO v_tournament_id
  FROM public.matches m
  JOIN public.tournaments t ON t.id = m.tournament_id
  WHERE m.id = p_match_id;

  SELECT m.tournament_id INTO v_tournament_id FROM public.matches m WHERE m.id = p_match_id;

  SELECT COALESCE(sc.placement_points, '[{"placement":1,"points":15},{"placement":2,"points":12},{"placement":3,"points":10},{"placement":4,"points":8},{"placement":5,"points":6},{"placement":6,"points":4},{"placement":7,"points":2},{"placement":8,"points":0}]'::jsonb),
         COALESCE(sc.kill_points_per_kill, 1)
  INTO v_scoring, v_kill_pts
  FROM public.matches m
  JOIN public.tournaments t ON t.id = m.tournament_id
  LEFT JOIN public.scoring_configs sc ON sc.id = t.scoring_config_id
  WHERE m.id = p_match_id;

  -- Update each result row with computed points
  UPDATE public.match_results r
  SET
    placement_points = public.placement_points_for(v_scoring, r.placement),
    kill_points = r.kills * v_kill_pts,
    total_points = public.placement_points_for(v_scoring, r.placement) + (r.kills * v_kill_pts),
    chicken_dinner = (r.placement = 1)
  WHERE r.match_id = p_match_id;

  -- Recompute standings for the tournament
  PERFORM public.recompute_tournament_standings(v_tournament_id);
END;
$$;

-- Recompute tournament_standings from match_results
CREATE OR REPLACE FUNCTION public.recompute_tournament_standings(p_tournament_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete existing standings rows for this tournament
  DELETE FROM public.tournament_standings WHERE tournament_id = p_tournament_id;

  -- Insert recomputed standings
  INSERT INTO public.tournament_standings (tournament_id, team_id, matches_played, total_kills, total_points, chicken_dinners, avg_placement)
  SELECT
    p_tournament_id,
    r.team_id,
    COUNT(*)::int AS matches_played,
    SUM(r.kills)::int AS total_kills,
    SUM(r.total_points) AS total_points,
    SUM(CASE WHEN r.chicken_dinner THEN 1 ELSE 0 END)::int AS chicken_dinners,
    ROUND(AVG(r.placement), 2) AS avg_placement
  FROM public.match_results r
  JOIN public.matches m ON m.id = r.match_id
  WHERE m.tournament_id = p_tournament_id
  GROUP BY r.team_id;

  -- Assign rank by total_points desc, then total_kills desc
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_points DESC, total_kills DESC) AS rn
    FROM public.tournament_standings
    WHERE tournament_id = p_tournament_id
  )
  UPDATE public.tournament_standings s
  SET rank = ranked.rn
  FROM ranked
  WHERE s.id = ranked.id;
END;
$$;

-- Recompute per-player stats across all results
CREATE OR REPLACE FUNCTION public.recompute_player_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Refresh player_stats from team membership + match_results
  DELETE FROM public.player_stats;

  INSERT INTO public.player_stats (user_id, total_matches, total_kills, total_wins, total_points, avg_placement, mvp_points)
  SELECT
    tm.user_id,
    COUNT(DISTINCT r.match_id)::int AS total_matches,
    COALESCE(SUM(r.kills), 0)::int AS total_kills,
    SUM(CASE WHEN r.chicken_dinner THEN 1 ELSE 0 END)::int AS total_wins,
    COALESCE(SUM(r.total_points), 0) AS total_points,
    ROUND(COALESCE(AVG(r.placement), 0), 2) AS avg_placement,
    COALESCE(SUM(r.total_points), 0) AS mvp_points
  FROM public.team_members tm
  LEFT JOIN public.match_results r ON r.team_id = tm.team_id
  GROUP BY tm.user_id
  HAVING COUNT(DISTINCT r.match_id) > 0;

  -- Mark match as completed
  UPDATE public.player_stats SET updated_at = now();
END;
$$;

-- Publish final results: complete tournament, recompute, insert winner gallery entry
CREATE OR REPLACE FUNCTION public.publish_tournament_results(p_tournament_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner_team_id uuid;
  v_winner_team_name text;
  v_winner_logo text;
  v_prize text;
  v_match_date timestamptz;
  v_winner_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  PERFORM public.recompute_tournament_standings(p_tournament_id);
  PERFORM public.recompute_player_stats();

  -- Mark tournament completed
  UPDATE public.tournaments
  SET status = 'completed', end_time = COALESCE(end_time, now())
  WHERE id = p_tournament_id;

  -- Get top team
  SELECT s.team_id, t.name, t.logo_url
  INTO v_winner_team_id, v_winner_team_name, v_winner_logo
  FROM public.tournament_standings s
  JOIN public.teams t ON t.id = s.team_id
  WHERE s.tournament_id = p_tournament_id AND s.rank = 1
  LIMIT 1;

  SELECT prize_pool INTO v_prize FROM public.tournaments WHERE id = p_tournament_id;
  SELECT start_time INTO v_match_date FROM public.tournaments WHERE id = p_tournament_id;

  IF v_winner_team_id IS NOT NULL THEN
    INSERT INTO public.winners (tournament_id, team_id, team_name, team_logo_url, prize_amount, match_date)
    VALUES (p_tournament_id, v_winner_team_id, v_winner_team_name, v_winner_logo, v_prize, COALESCE(v_match_date, now()))
    RETURNING id INTO v_winner_id;

    -- Insert a media entry for the winner gallery
    INSERT INTO public.media (title, type)
    VALUES (v_winner_team_name || ' - Winner', 'winner');
  END IF;

  RETURN v_winner_id;
END;
$$;

-- Grant execute to authenticated (function checks is_admin internally)
GRANT EXECUTE ON FUNCTION public.compute_match_results(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_tournament_standings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_player_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_tournament_results(uuid) TO authenticated;
