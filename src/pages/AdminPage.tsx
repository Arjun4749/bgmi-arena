import { useEffect, useState } from 'react';
import { Shield, Trophy, Users, Bell, BarChart3, Target, Crown, Settings, Plus, Edit2, Trash2, Check, X, Lock, Upload, FileDown, Gamepad2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/components/ui/Toast';
import { useUpload } from '@/lib/upload';
import type { Tournament, TournamentRegistration, Team, Match, MatchResult, Announcement, Profile, ScoringConfig, Winner, Media } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading, EmptyState } from '@/components/States';
import { cn, formatDate, formatMoney } from '@/lib/utils';

type Tab = 'overview' | 'tournaments' | 'registrations' | 'matches' | 'scoring' | 'winners' | 'announcements' | 'players' | 'scoring-config';

export function AdminPage() {
  const { session, profile, isAdmin } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [regs, setRegs] = useState<(TournamentRegistration & { team?: Team; tournament?: Tournament })[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [scoringConfigs, setScoringConfigs] = useState<ScoringConfig[]>([]);

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    if (profile && !isAdmin) { navigate('/dashboard'); return; }
    if (profile && isAdmin) loadData();
  }, [session, profile, isAdmin]);

  const loadData = async () => {
    const [tRes, rRes, mRes, pRes, aRes, wRes, sRes] = await Promise.all([
      supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
      supabase.from('tournament_registrations').select('*, team:teams(*), tournament:tournaments(*)').order('created_at', { ascending: false }),
      supabase.from('matches').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('winners').select('*').order('created_at', { ascending: false }),
      supabase.from('scoring_configs').select('*').order('created_at', { ascending: false }),
    ]);
    setTournaments((tRes.data as Tournament[]) || []);
    setRegs((rRes.data as (TournamentRegistration & { team?: Team; tournament?: Tournament })[]) || []);
    setMatches((mRes.data as Match[]) || []);
    setPlayers((pRes.data as Profile[]) || []);
    setAnnouncements((aRes.data as Announcement[]) || []);
    setWinners((wRes.data as Winner[]) || []);
    setScoringConfigs((sRes.data as ScoringConfig[]) || []);
    setLoading(false);
  };

  if (loading) return <div className="pt-28"><Loading /></div>;
  if (!isAdmin) return null;

  const pendingRegs = regs.filter((r) => r.status === 'pending');

  const tabs: { key: Tab; label: string; icon: typeof Shield; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'tournaments', label: 'Tournaments', icon: Trophy },
    { key: 'registrations', label: 'Registrations', icon: Users, badge: pendingRegs.length },
    { key: 'matches', label: 'Matches & Rooms', icon: Gamepad2 },
    { key: 'scoring', label: 'Score & Results', icon: Target },
    { key: 'winners', label: 'Winner Gallery', icon: Crown },
    { key: 'announcements', label: 'Announcements', icon: Bell },
    { key: 'players', label: 'Players', icon: Users },
    { key: 'scoring-config', label: 'Point System', icon: Settings },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Shield size={24} className="text-primary-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-neutral-400">Manage tournaments, players, and results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-3 space-y-1 lg:sticky lg:top-24">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                    tab === t.key ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-neutral-300 hover:bg-white/5',
                  )}
                >
                  <t.icon size={18} /> {t.label}
                  {t.badge ? <span className="ml-auto text-xs bg-primary-500 text-white px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
                </button>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {tab === 'overview' && <OverviewTab tournaments={tournaments} players={players} regs={regs} matches={matches} winners={winners} />}
            {tab === 'tournaments' && <TournamentsTab tournaments={tournaments} onRefresh={loadData} />}
            {tab === 'registrations' && <RegistrationsTab regs={regs} onRefresh={loadData} />}
            {tab === 'matches' && <MatchesTab tournaments={tournaments} matches={matches} onRefresh={loadData} />}
            {tab === 'scoring' && <ScoringTab tournaments={tournaments} onRefresh={loadData} />}
            {tab === 'winners' && <WinnersTab tournaments={tournaments} winners={winners} onRefresh={loadData} />}
            {tab === 'announcements' && <AnnouncementsTab announcements={announcements} onRefresh={loadData} />}
            {tab === 'players' && <PlayersTab players={players} onRefresh={loadData} />}
            {tab === 'scoring-config' && <ScoringConfigTab configs={scoringConfigs} onRefresh={loadData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewTab({ tournaments, players, regs, matches, winners }: { tournaments: Tournament[]; players: Profile[]; regs: TournamentRegistration[]; matches: Match[]; winners: Winner[] }) {
  const stats = [
    { label: 'Tournaments', value: tournaments.length, icon: Trophy, tone: 'orange' as const },
    { label: 'Players', value: players.length, icon: Users, tone: 'blue' as const },
    { label: 'Registrations', value: regs.length, icon: BarChart3, tone: 'orange' as const },
    { label: 'Matches', value: matches.length, icon: Gamepad2, tone: 'blue' as const },
    { label: 'Winners Crowned', value: winners.length, icon: Crown, tone: 'orange' as const },
    { label: 'Pending Approvals', value: regs.filter((r) => r.status === 'pending').length, icon: Bell, tone: 'blue' as const },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-5">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', s.tone === 'orange' ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-accent-500/10 border border-accent-500/20')}>
            <s.icon size={20} className={s.tone === 'orange' ? 'text-primary-400' : 'text-accent-400'} />
          </div>
          <p className="font-display text-2xl font-bold text-white">{s.value}</p>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Tournaments CRUD ---------- */
function TournamentsTab({ tournaments, onRefresh }: { tournaments: Tournament[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const { upload, uploading } = useUpload();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', mode: 'squad' as Tournament['mode'], entry_fee: '0', prize_pool: '0',
    map: '', start_time: '', slots: '25', rules: '', room_unlock_minutes: '15', banner: null as File | null, scoring_config_id: '',
  });

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', mode: 'squad', entry_fee: '0', prize_pool: '0', map: '', start_time: '', slots: '25', rules: '', room_unlock_minutes: '15', banner: null, scoring_config_id: '' }); setModal(true); };
  const openEdit = (t: Tournament) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || '', mode: t.mode, entry_fee: String(t.entry_fee), prize_pool: t.prize_pool,
      map: t.map || '', start_time: t.start_time ? t.start_time.slice(0, 16) : '', slots: String(t.slots), rules: t.rules || '',
      room_unlock_minutes: String(t.room_unlock_minutes), banner: null, scoring_config_id: t.scoring_config_id || '',
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    let bannerUrl = editing?.banner_url || null;
    if (form.banner) {
      bannerUrl = await upload(form.banner, 'banners');
      if (!bannerUrl) return;
    }
    const payload = {
      title: form.title,
      description: form.description || null,
      mode: form.mode,
      entry_fee: parseFloat(form.entry_fee) || 0,
      prize_pool: form.prize_pool,
      map: form.map || null,
      start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
      slots: parseInt(form.slots) || 25,
      rules: form.rules || null,
      room_unlock_minutes: parseInt(form.room_unlock_minutes) || 15,
      banner_url: bannerUrl,
      scoring_config_id: form.scoring_config_id || null,
    };
    if (editing) {
      const { error } = await supabase.from('tournaments').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error'); else toast('Tournament updated!', 'success');
    } else {
      const { error } = await supabase.from('tournaments').insert(payload);
      if (error) toast(error.message, 'error'); else toast('Tournament created!', 'success');
    }
    setModal(false);
    onRefresh();
  };

  const del = async (t: Tournament) => {
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('tournaments').delete().eq('id', t.id);
    if (error) toast(error.message, 'error'); else { toast('Tournament deleted', 'success'); onRefresh(); }
  };

  const exportData = (t: Tournament) => {
    const blob = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tournament-${t.title.replace(/\s+/g, '_')}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Tournaments</h2>
        <Button onClick={openCreate}><Plus size={16} /> Create</Button>
      </div>
      {tournaments.length === 0 ? (
        <EmptyState icon={<Trophy size={40} />} title="No tournaments" message="Create your first tournament." action={<Button onClick={openCreate}><Plus size={16} /> Create</Button>} />
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <Card key={t.id} className="p-4 flex items-center gap-4">
              {t.banner_url ? <img src={t.banner_url} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-bg-elevated flex items-center justify-center"><Trophy size={20} className="text-primary-400" /></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{t.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone={t.status === 'ongoing' ? 'orange' : t.status === 'upcoming' ? 'blue' : 'neutral'}>{t.status}</Badge>
                  <Badge tone="neutral">{t.mode}</Badge>
                  <span className="text-xs text-neutral-500">{formatDate(t.start_time)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => exportData(t)} className="p-2 rounded-lg text-neutral-400 hover:text-accent-400 hover:bg-accent-500/10" title="Export"><FileDown size={16} /></button>
                <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10" title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => del(t)} className="p-2 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-500/10" title="Delete"><Trash2 size={16} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Tournament' : 'Create Tournament'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mode"><Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as Tournament['mode'] })}><option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option></Select></Field>
            <Field label="Map"><Input value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })} placeholder="Erangel" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Entry Fee (₹)"><Input type="number" value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: e.target.value })} /></Field>
            <Field label="Prize Pool (₹)"><Input value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time"><Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></Field>
            <Field label="Slots"><Input type="number" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} /></Field>
          </div>
          <Field label="Room Unlock Minutes" hint="Room details unlock this many minutes before match time">
            <Input type="number" value={form.room_unlock_minutes} onChange={(e) => setForm({ ...form, room_unlock_minutes: e.target.value })} />
          </Field>
          <Field label="Rules"><Textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /></Field>
          <Field label="Banner Image">
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, banner: e.target.files?.[0] || null })} className="text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer" />
          </Field>
          <Button type="submit" disabled={uploading} className="w-full">{uploading ? 'Uploading...' : editing ? 'Update' : 'Create'}</Button>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- Registrations approval ---------- */
function RegistrationsTab({ regs, onRefresh }: { regs: (TournamentRegistration & { team?: Team; tournament?: Tournament })[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const filtered = filter === 'all' ? regs : regs.filter((r) => r.status === filter);

  const setStatus = async (r: TournamentRegistration, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('tournament_registrations').update({ status }).eq('id', r.id);
    if (error) toast(error.message, 'error');
    else { toast(`Team ${status}!`, 'success'); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-white">Team Registrations</h2>
      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium', filter === f ? 'bg-primary-500 text-white' : 'bg-bg-elevated text-neutral-300 border border-border-subtle')}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="No registrations" />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{r.team?.name || 'Unknown Team'}</h3>
                <p className="text-xs text-neutral-500 truncate">{r.tournament?.title || ''}</p>
              </div>
              <Badge tone={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'yellow'}>{r.status}</Badge>
              {r.status === 'pending' && (
                <div className="flex gap-1">
                  <button onClick={() => setStatus(r, 'approved')} className="p-2 rounded-lg text-success-500 hover:bg-success-500/10"><Check size={16} /></button>
                  <button onClick={() => setStatus(r, 'rejected')} className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"><X size={16} /></button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Matches & Room management ---------- */
function MatchesTab({ tournaments, matches, onRefresh }: { tournaments: Tournament[]; matches: Match[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ tournament_id: '', match_number: '1', title: '', scheduled_at: '', room_id: '', room_password: '' });

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = tournaments.find((x) => x.id === form.tournament_id);
    if (!t) { toast('Select a tournament', 'error'); return; }
    const scheduled = form.scheduled_at ? new Date(form.scheduled_at) : null;
    const lockUntil = scheduled ? new Date(scheduled.getTime() - t.room_unlock_minutes * 60000) : null;
    const { error } = await supabase.from('matches').insert({
      tournament_id: form.tournament_id,
      match_number: parseInt(form.match_number) || 1,
      title: form.title || null,
      scheduled_at: scheduled?.toISOString() || null,
      room_id: form.room_id || null,
      room_password: form.room_password || null,
      room_locked_until: lockUntil?.toISOString() || null,
    });
    if (error) toast(error.message, 'error'); else { toast('Match created!', 'success'); setModal(false); setForm({ tournament_id: '', match_number: '1', title: '', scheduled_at: '', room_id: '', room_password: '' }); onRefresh(); }
  };

  const setMatchStatus = async (m: Match, status: Match['status']) => {
    await supabase.from('matches').update({ status }).eq('id', m.id);
    toast(`Match marked ${status}`, 'success'); onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Matches & Room Details</h2>
        <Button onClick={() => setModal(true)}><Plus size={16} /> Add Match</Button>
      </div>
      {matches.length === 0 ? (
        <EmptyState icon={<Gamepad2 size={40} />} title="No matches" message="Create matches and publish room IDs." />
      ) : (
        <div className="space-y-2">
          {matches.map((m) => {
            const t = tournaments.find((x) => x.id === m.tournament_id);
            return (
              <Card key={m.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">Match {m.match_number}{m.title ? ` — ${m.title}` : ''}</h3>
                    <p className="text-xs text-neutral-500">{t?.title || ''} • {formatDate(m.scheduled_at)}</p>
                  </div>
                  <Badge tone={m.status === 'live' ? 'orange' : m.status === 'completed' ? 'green' : 'neutral'}>{m.status}</Badge>
                </div>
                {m.room_id && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                    <Lock size={12} /> Room: {m.room_id} • Pass: {m.room_password || '—'}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setMatchStatus(m, 'live')}>Set Live</Button>
                  <Button size="sm" variant="ghost" onClick={() => setMatchStatus(m, 'completed')}>Complete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Match" size="lg">
        <form onSubmit={createMatch} className="space-y-4">
          <Field label="Tournament">
            <Select value={form.tournament_id} onChange={(e) => setForm({ ...form, tournament_id: e.target.value })} required>
              <option value="">Select tournament</option>
              {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Match Number"><Input type="number" value={form.match_number} onChange={(e) => setForm({ ...form, match_number: e.target.value })} /></Field>
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional" /></Field>
          </div>
          <Field label="Scheduled At"><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Room ID"><Input value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })} /></Field>
            <Field label="Room Password"><Input value={form.room_password} onChange={(e) => setForm({ ...form, room_password: e.target.value })} /></Field>
          </div>
          <Button type="submit" className="w-full">Create Match</Button>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- Scoring & Results (auto import) ---------- */
function ScoringTab({ tournaments, onRefresh }: { tournaments: Tournament[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [results, setResults] = useState<(MatchResult & { team?: Team })[]>([]);
  const [approvedTeams, setApprovedTeams] = useState<{ team: Team }[]>([]);

  useEffect(() => {
    if (!selectedTournament) return;
    (async () => {
      const { data: m } = await supabase.from('matches').select('*').eq('tournament_id', selectedTournament).order('match_number');
      setTournamentMatches((m as Match[]) || []);
      const { data: regs } = await supabase.from('tournament_registrations').select('team:teams(*)').eq('tournament_id', selectedTournament).eq('status', 'approved');
      setApprovedTeams((regs as unknown as { team: Team }[]) || []);
    })();
  }, [selectedTournament]);

  useEffect(() => {
    if (!selectedMatch) { setResults([]); return; }
    (async () => {
      const { data } = await supabase.from('match_results').select('*, team:teams(*)').eq('match_id', selectedMatch);
      setResults((data as (MatchResult & { team?: Team })[]) || []);
    })();
  }, [selectedMatch]);

  const addResultRow = async (teamId: string) => {
    if (!selectedMatch) return;
    const { error } = await supabase.from('match_results').insert({ match_id: selectedMatch, team_id: teamId, placement: 0, kills: 0 });
    if (error) toast(error.message, 'error'); else { toast('Row added', 'success'); const { data } = await supabase.from('match_results').select('*, team:teams(*)').eq('match_id', selectedMatch); setResults((data as (MatchResult & { team?: Team })[]) || []); }
  };

  const updateResult = async (r: MatchResult, field: 'placement' | 'kills', value: string) => {
    const num = parseInt(value) || 0;
    await supabase.from('match_results').update({ [field]: num }).eq('id', r.id);
    setResults(results.map((x) => (x.id === r.id ? { ...x, [field]: num } : x)));
  };

  const computeResults = async () => {
    if (!selectedMatch) return;
    const { error } = await supabase.rpc('compute_match_results', { p_match_id: selectedMatch });
    if (error) toast(error.message, 'error'); else { toast('Points calculated! Standings updated.', 'success'); const { data } = await supabase.from('match_results').select('*, team:teams(*)').eq('match_id', selectedMatch); setResults((data as (MatchResult & { team?: Team })[]) || []); }
  };

  const publishResults = async () => {
    if (!selectedTournament) return;
    if (!confirm('Publish final results? This will mark the tournament complete and update the winner gallery.')) return;
    const { error } = await supabase.rpc('publish_tournament_results', { p_tournament_id: selectedTournament });
    if (error) toast(error.message, 'error'); else { toast('Results published! Winner gallery updated.', 'success'); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-white">Score & Auto-Import Results</h2>
      <Card className="p-5 space-y-4">
        <Field label="Select Tournament">
          <Select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)}>
            <option value="">Choose...</option>
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </Select>
        </Field>
        {selectedTournament && (
          <Field label="Select Match">
            <Select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}>
              <option value="">Choose...</option>
              {tournamentMatches.map((m) => <option key={m.id} value={m.id}>Match {m.match_number}</option>)}
            </Select>
          </Field>
        )}
      </Card>

      {selectedMatch && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Enter Results</h3>
            <Button size="sm" onClick={computeResults}><Target size={14} /> Calculate Points</Button>
          </div>
          {/* Add team row */}
          <Select value="" onChange={(e) => e.target.value && addResultRow(e.target.value)}>
            <option value="">Add team to results...</option>
            {approvedTeams.map((r) => <option key={r.team.id} value={r.team.id}>{r.team.name}</option>)}
          </Select>
          {/* Results table */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 items-center bg-bg-elevated rounded-lg p-3">
                  <span className="col-span-5 text-sm text-neutral-200 truncate">{r.team?.name || 'Unknown'}</span>
                  <div className="col-span-3"><Input type="number" placeholder="Place" value={r.placement} onChange={(e) => updateResult(r, 'placement', e.target.value)} /></div>
                  <div className="col-span-3"><Input type="number" placeholder="Kills" value={r.kills} onChange={(e) => updateResult(r, 'kills', e.target.value)} /></div>
                  <span className="col-span-1 text-sm font-bold text-primary-400 text-center">{Number(r.total_points).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-border-subtle">
            <Button variant="secondary" onClick={publishResults}><Crown size={16} /> Publish Final Results</Button>
          </div>
          <p className="text-xs text-neutral-500">Publishing calculates all points, updates leaderboards, player statistics, and the winner gallery automatically.</p>
        </Card>
      )}
    </div>
  );
}

/* ---------- Winners management ---------- */
function WinnersTab({ tournaments, winners, onRefresh }: { tournaments: Tournament[]; winners: Winner[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const { upload, uploading } = useUpload();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ tournament_id: '', team_name: '', prize_amount: '', match_date: '', winner_shot: null as File | null, payment_shot: null as File | null });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    let winnerUrl: string | null = null, paymentUrl: string | null = null;
    if (form.winner_shot) winnerUrl = await upload(form.winner_shot, 'winner-screenshots');
    if (form.payment_shot) paymentUrl = await upload(form.payment_shot, 'payment-proofs');
    const { error } = await supabase.from('winners').insert({
      tournament_id: form.tournament_id || null,
      team_name: form.team_name,
      prize_amount: form.prize_amount,
      match_date: form.match_date ? new Date(form.match_date).toISOString() : null,
      winner_screenshot_url: winnerUrl,
      payment_screenshot_url: paymentUrl,
    });
    if (error) toast(error.message, 'error'); else { toast('Winner added!', 'success'); setModal(false); setForm({ tournament_id: '', team_name: '', prize_amount: '', match_date: '', winner_shot: null, payment_shot: null }); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Winner Gallery</h2>
        <Button onClick={() => setModal(true)}><Plus size={16} /> Add Winner</Button>
      </div>
      {winners.length === 0 ? (
        <EmptyState icon={<Crown size={40} />} title="No winners yet" message="Add winners after tournaments complete." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {winners.map((w) => (
            <Card key={w.id} className="p-4 flex items-center gap-3">
              {w.winner_screenshot_url ? <img src={w.winner_screenshot_url} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-bg-elevated flex items-center justify-center"><Crown size={20} className="text-primary-400" /></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{w.team_name}</h3>
                <p className="text-xs text-neutral-500">{formatMoney(w.prize_amount)} • {formatDate(w.match_date)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Winner" size="lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Tournament (optional)">
            <Select value={form.tournament_id} onChange={(e) => setForm({ ...form, tournament_id: e.target.value })}>
              <option value="">None</option>
              {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team Name"><Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} required /></Field>
            <Field label="Prize Amount"><Input value={form.prize_amount} onChange={(e) => setForm({ ...form, prize_amount: e.target.value })} placeholder="₹5000" /></Field>
          </div>
          <Field label="Match Date"><Input type="date" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} /></Field>
          <Field label="Winner Screenshot">
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, winner_shot: e.target.files?.[0] || null })} className="text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer" />
          </Field>
          <Field label="Payment Proof Screenshot">
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, payment_shot: e.target.files?.[0] || null })} className="text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer" />
          </Field>
          <Button type="submit" disabled={uploading} className="w-full">{uploading ? 'Uploading...' : 'Add Winner'}</Button>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- Announcements ---------- */
function AnnouncementsTab({ announcements, onRefresh }: { announcements: Announcement[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'news' });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('announcements').insert({ title: form.title, body: form.body, category: form.category });
    if (error) toast(error.message, 'error'); else { toast('Announcement published!', 'success'); setModal(false); setForm({ title: '', body: '', category: 'news' }); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Announcements</h2>
        <Button onClick={() => setModal(true)}><Plus size={16} /> New</Button>
      </div>
      {announcements.length === 0 ? (
        <EmptyState icon={<Bell size={40} />} title="No announcements" />
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center gap-2 mb-1"><Badge tone="orange">{a.category}</Badge><span className="text-xs text-neutral-500">{formatDate(a.created_at)}</span></div>
              <h3 className="font-semibold text-white">{a.title}</h3>
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{a.body}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement">
        <form onSubmit={save} className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Body"><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Button type="submit" className="w-full">Publish</Button>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- Players management ---------- */
function PlayersTab({ players, onRefresh }: { players: Profile[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();

  const toggleBan = async (p: Profile) => {
    const { error } = await supabase.from('profiles').update({ banned: !p.banned }).eq('id', p.id);
    if (error) toast(error.message, 'error'); else { toast(p.banned ? 'Player unbanned' : 'Player banned', 'success'); onRefresh(); }
  };

  const makeAdmin = async (p: Profile) => {
    const { error } = await supabase.from('profiles').update({ role: p.role === 'admin' ? 'player' : 'admin' }).eq('id', p.id);
    if (error) toast(error.message, 'error'); else { toast('Role updated', 'success'); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-white">Manage Players</h2>
      {players.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="No players" />
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-3">
              {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-neutral-400">{(p.username || '?')[0]}</div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{p.username || 'Unnamed'}</h3>
                <p className="text-xs text-neutral-500">Joined {formatDate(p.created_at)}</p>
              </div>
              <Badge tone={p.role === 'admin' ? 'orange' : 'neutral'}>{p.role}</Badge>
              {p.banned && <Badge tone="red">Banned</Badge>}
              <div className="flex gap-1">
                <button onClick={() => makeAdmin(p)} className="px-2 py-1 rounded-lg text-xs text-accent-400 hover:bg-accent-500/10">{p.role === 'admin' ? 'Make Player' : 'Make Admin'}</button>
                <button onClick={() => toggleBan(p)} className={cn('px-2 py-1 rounded-lg text-xs', p.banned ? 'text-success-500 hover:bg-success-500/10' : 'text-error-500 hover:bg-error-500/10')}>{p.banned ? 'Unban' : 'Ban'}</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Scoring Config ---------- */
function ScoringConfigTab({ configs, onRefresh }: { configs: ScoringConfig[]; onRefresh: () => Promise<void> }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<ScoringConfig | null>(null);
  const [form, setForm] = useState<{ name: string; kill_points: string; placements: { placement: number; points: number }[] }>({ name: '', kill_points: '1', placements: [] });

  const openEdit = (c: ScoringConfig) => {
    setEditing(c);
    setForm({ name: c.name, kill_points: String(c.kill_points_per_kill), placements: c.placement_points });
  };
  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', kill_points: '1', placements: [{ placement: 1, points: 15 }, { placement: 2, points: 12 }, { placement: 3, points: 10 }, { placement: 4, points: 8 }, { placement: 5, points: 6 }, { placement: 6, points: 4 }, { placement: 7, points: 2 }, { placement: 8, points: 0 }] });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, kill_points_per_kill: parseInt(form.kill_points) || 1, placement_points: form.placements };
    if (editing) {
      const { error } = await supabase.from('scoring_configs').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error'); else { toast('Config updated!', 'success'); onRefresh(); }
    } else {
      const { error } = await supabase.from('scoring_configs').insert(payload);
      if (error) toast(error.message, 'error'); else { toast('Config created!', 'success'); onRefresh(); }
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Point System</h2>
        <Button onClick={openCreate}><Plus size={16} /> New Config</Button>
      </div>
      <div className="space-y-3">
        {configs.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{c.name}</h3>
                {c.is_default && <Badge tone="green">Default</Badge>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit2 size={14} /> Edit</Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {c.placement_points.map((p) => (
                <div key={p.placement} className="text-center bg-bg-elevated rounded-lg p-2">
                  <p className="text-xs text-neutral-500">#{p.placement}</p>
                  <p className="font-display font-bold text-primary-400">{p.points}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">Kill Points: {c.kill_points_per_kill} per kill</p>
          </Card>
        ))}
      </div>

      {editing !== null || form.placements.length > 0 ? (
        <Modal open={!!editing || form.placements.length > 0} onClose={() => { setEditing(null); setForm({ name: '', kill_points: '1', placements: [] }); }} title={editing ? 'Edit Config' : 'New Config'} size="lg">
          <form onSubmit={save} className="space-y-4">
            <Field label="Config Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Kill Points per Kill"><Input type="number" value={form.kill_points} onChange={(e) => setForm({ ...form, kill_points: e.target.value })} /></Field>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Placement Points</p>
              <div className="space-y-2">
                {form.placements.map((p, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2"><span className="text-xs text-neutral-500 w-8">#{p.placement}</span><Input type="number" value={p.points} onChange={(e) => { const placements = [...form.placements]; placements[i] = { ...p, points: parseInt(e.target.value) || 0 }; setForm({ ...form, placements }); }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">Save Config</Button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
