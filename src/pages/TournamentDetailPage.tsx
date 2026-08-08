import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Clock, Trophy, Lock, Unlock, Gamepad2, FileText, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tournament, Match, TournamentRegistration, Team, TournamentStanding } from '@/lib/types';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading, EmptyState } from '@/components/States';
import { formatDate, formatDateTime, formatMoney, timeUntil, isRoomUnlocked } from '@/lib/utils';

export function TournamentDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: m }, { data: r }, { data: s }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', id).maybeSingle(),
        supabase.from('matches').select('*').eq('tournament_id', id).order('match_number', { ascending: true }),
        supabase.from('tournament_registrations').select('*, team:teams(*)').eq('tournament_id', id),
        supabase.from('tournament_standings').select('*, team:teams(*)').eq('tournament_id', id).order('rank', { ascending: true }),
      ]);
      setTournament(t as Tournament);
      setMatches((m as Match[]) || []);
      setRegistrations((r as TournamentRegistration[]) || []);
      setStandings((s as TournamentStanding[]) || []);

      if (session) {
        const { data: userTeams } = await supabase.from('teams').select('*').eq('captain_id', session.user.id);
        setTeams((userTeams as Team[]) || []);
      }
      setLoading(false);
    })();
  }, [id, session]);

  if (loading) return <div className="pt-28"><Loading /></div>;
  if (!tournament)
    return (
      <div className="pt-28 max-w-3xl mx-auto px-4">
        <EmptyState title="Tournament not found" message="This tournament may have been removed." action={<Button onClick={() => navigate('/tournaments')}>Back to Tournaments</Button>} />
      </div>
    );

  const approvedTeams = registrations.filter((r) => r.status === 'approved');
  const myRegistration = registrations.find((r) => teams.some((t) => t.id === r.team_id));
  const slotsLeft = tournament.slots - approvedTeams.length;

  const handleRegister = async (teamId: string) => {
    if (!session) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    const { error } = await supabase.from('tournament_registrations').insert({ tournament_id: id, team_id: teamId });
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Registration submitted! Awaiting admin approval.', 'success');
      const { data } = await supabase.from('tournament_registrations').select('*, team:teams(*)').eq('tournament_id', id);
      setRegistrations((data as TournamentRegistration[]) || []);
    }
    setRegistering(false);
  };

  return (
    <div className="pt-16">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-bg-elevated">
        {tournament.banner_url ? (
          <img src={tournament.banner_url} alt={tournament.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500/30 via-bg-elevated to-accent-500/30 flex items-center justify-center">
            <Trophy size={64} className="text-primary-500/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent" />
        <button
          onClick={() => navigate('/tournaments')}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-base/60 backdrop-blur-md text-sm text-neutral-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        {/* Header card */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge tone={tournament.status === 'ongoing' ? 'orange' : tournament.status === 'upcoming' ? 'blue' : 'neutral'}>
                  {tournament.status}
                </Badge>
                <Badge tone="neutral">{tournament.mode.toUpperCase()}</Badge>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">{tournament.title}</h1>
              {tournament.description && <p className="mt-3 text-neutral-400 max-w-3xl">{tournament.description}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <InfoTile icon={Calendar} label="Date" value={formatDate(tournament.start_time)} />
                <InfoTile icon={MapPin} label="Map" value={tournament.map || 'TBA'} />
                <InfoTile icon={Users} label="Slots" value={`${approvedTeams.length}/${tournament.slots}`} />
                <InfoTile icon={Clock} label="Status" value={tournament.status === 'upcoming' ? timeUntil(tournament.start_time) : tournament.status} />
              </div>
            </div>

            {/* Prize + register */}
            <div className="lg:w-72 shrink-0 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 p-5 text-center">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Prize Pool</p>
                <p className="font-display text-3xl font-black text-primary-400 text-glow-orange mt-1">{formatMoney(tournament.prize_pool)}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle text-sm">
                  <span className="text-neutral-400">Entry Fee</span>
                  <span className="font-bold text-accent-400">{formatMoney(tournament.entry_fee)}</span>
                </div>
              </div>

              {tournament.status === 'upcoming' && (
                <>
                  {myRegistration ? (
                    <Card className="p-4 text-center">
                      <p className="text-sm text-neutral-300 mb-2">Your team is registered</p>
                      <Badge tone={myRegistration.status === 'approved' ? 'green' : myRegistration.status === 'rejected' ? 'red' : 'yellow'}>
                        {myRegistration.status === 'approved' ? <CheckCircle size={12} /> : myRegistration.status === 'rejected' ? <XCircle size={12} /> : null}
                        {myRegistration.status}
                      </Badge>
                    </Card>
                  ) : session ? (
                    teams.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Select a team to register</p>
                        {teams.map((t) => (
                          <Button key={t.id} variant="outline" className="w-full justify-start" onClick={() => handleRegister(t.id)} disabled={registering || slotsLeft <= 0}>
                            {t.name} {t.tag && `(${t.tag})`}
                          </Button>
                        ))}
                        {slotsLeft <= 0 && <p className="text-xs text-error-500 text-center">Tournament is full</p>}
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => navigate('/dashboard?tab=teams')}>
                        Create a Team First
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" onClick={() => navigate('/login')}>Login to Register</Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Rules */}
        {tournament.rules && (
          <Card className="p-6 mt-6">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary-400" /> Tournament Rules
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">{tournament.rules}</p>
            </div>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/rules')}>
              View General Rules <ArrowLeft size={14} className="rotate-180" />
            </Button>
          </Card>
        )}

        {/* Matches + Room details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Gamepad2 size={20} className="text-accent-400" /> Match Schedule
            </h2>
            {matches.length === 0 ? (
              <p className="text-sm text-neutral-500">No matches scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  const unlocked = isRoomUnlocked(m);
                  return (
                    <div key={m.id} className="rounded-lg bg-bg-elevated border border-border-subtle p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">Match {m.match_number}{m.title ? ` — ${m.title}` : ''}</span>
                        <Badge tone={m.status === 'live' ? 'orange' : m.status === 'completed' ? 'green' : 'neutral'}>{m.status}</Badge>
                      </div>
                      <p className="text-xs text-neutral-400 mb-3">{formatDateTime(m.scheduled_at)}</p>
                      {m.room_id && (
                        <div className="flex items-center gap-2 text-sm">
                          {unlocked ? (
                            <Unlock size={14} className="text-success-500" />
                          ) : (
                            <Lock size={14} className="text-neutral-500" />
                          )}
                          <span className={unlocked ? 'text-neutral-200' : 'text-neutral-500'}>
                            {unlocked ? `Room: ${m.room_id} • Pass: ${m.room_password || '—'}` : `Unlocks ${formatDateTime(m.room_locked_until)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Standings */}
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-primary-400" /> Standings
            </h2>
            {standings.length === 0 ? (
              <p className="text-sm text-neutral-500">Standings will appear after matches are played.</p>
            ) : (
              <div className="space-y-2">
                {standings.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2.5">
                    <span className={`font-display font-bold w-8 text-center ${s.rank === 1 ? 'text-primary-400' : s.rank === 2 ? 'text-neutral-300' : s.rank === 3 ? 'text-amber-600' : 'text-neutral-500'}`}>
                      {s.rank}
                    </span>
                    {s.team?.logo_url ? (
                      <img src={s.team.logo_url} alt="" className="w-7 h-7 rounded object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded bg-bg-card flex items-center justify-center text-xs font-bold text-neutral-400">
                        {(s.team?.name || '?')[0]}
                      </div>
                    )}
                    <span className="flex-1 text-sm font-medium text-neutral-200 truncate">{s.team?.name || 'Unknown'}</span>
                    <span className="text-xs text-neutral-400">{s.total_kills} kills</span>
                    <span className="font-display font-bold text-primary-400 text-sm w-12 text-right">{Number(s.total_points).toFixed(0)}pts</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Approved teams */}
        <Card className="p-6 mt-6 mb-10">
          <h2 className="font-display text-xl font-bold text-white mb-4">Participating Teams</h2>
          {approvedTeams.length === 0 ? (
            <p className="text-sm text-neutral-500">No teams approved yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {approvedTeams.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2.5">
                  {r.team?.logo_url ? (
                    <img src={r.team.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-bg-card flex items-center justify-center text-xs font-bold text-neutral-400">
                      {(r.team?.name || '?')[0]}
                    </div>
                  )}
                  <span className="text-sm text-neutral-200 truncate">{r.team?.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
        <Icon size={12} /> {label}
      </div>
      <p className="text-sm font-semibold text-neutral-200 truncate">{value}</p>
    </div>
  );
}
