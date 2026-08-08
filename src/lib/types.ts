// Shared TypeScript types for the BGMI Tournament Platform.
// These mirror the database schema and are used across the app.

export type UserRole = 'player' | 'admin';

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  banned: boolean;
  suspended_until: string | null;
  bio: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string | null;
  logo_url: string | null;
  captain_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'captain' | 'member';
  joined_at: string;
  profile?: Profile;
}

export type TournamentMode = 'solo' | 'duo' | 'squad';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Tournament {
  id: string;
  title: string;
  description: string | null;
  mode: TournamentMode;
  entry_fee: number;
  prize_pool: string;
  map: string | null;
  start_time: string | null;
  end_time: string | null;
  slots: number;
  filled: number;
  status: TournamentStatus;
  banner_url: string | null;
  rules: string | null;
  scoring_config_id: string | null;
  room_unlock_minutes: number;
  created_at: string;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  team_id: string;
  status: RegistrationStatus;
  created_at: string;
  team?: Team;
}

export type MatchStatus = 'scheduled' | 'live' | 'completed';

export interface Match {
  id: string;
  tournament_id: string;
  match_number: number;
  title: string | null;
  scheduled_at: string | null;
  room_id: string | null;
  room_password: string | null;
  room_locked_until: string | null;
  status: MatchStatus;
  created_at: string;
}

export interface MatchResult {
  id: string;
  match_id: string;
  team_id: string;
  placement: number;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
  chicken_dinner: boolean;
  created_at: string;
  team?: Team;
}

export interface TournamentStanding {
  id: string;
  tournament_id: string;
  team_id: string;
  matches_played: number;
  total_kills: number;
  total_points: number;
  chicken_dinners: number;
  avg_placement: number;
  rank: number | null;
  team?: Team;
}

export interface ScoringConfig {
  id: string;
  name: string;
  placement_points: { placement: number; points: number }[];
  kill_points_per_kill: number;
  is_default: boolean;
  created_at: string;
}

export interface Winner {
  id: string;
  tournament_id: string | null;
  team_id: string | null;
  team_name: string;
  team_logo_url: string | null;
  prize_amount: string;
  winner_screenshot_url: string | null;
  payment_screenshot_url: string | null;
  match_date: string | null;
  match_stats: Record<string, unknown>;
  created_at: string;
  tournament?: Tournament;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  category: string;
  created_at: string;
}

export type MediaType = 'winner' | 'payment' | 'highlight' | 'poster' | 'video';

export interface Media {
  id: string;
  title: string | null;
  type: MediaType;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  user_id: string;
  total_matches: number;
  total_kills: number;
  total_wins: number;
  total_points: number;
  avg_placement: number;
  mvp_points: number;
  updated_at: string;
  profile?: Profile;
}
