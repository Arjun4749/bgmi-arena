import { useEffect, useState } from 'react';
import { User, Users, Trophy, BarChart3, Bell, Plus, Trash2, Wallet, Gamepad2, Target, Crown, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/components/ui/Toast';
import { useUpload } from '@/lib/upload';
import type { Team, TournamentRegistration, Tournament, PlayerStats, Notification, TeamMember, Profile } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading, EmptyState } from '@/components/States';
import { cn, formatDate, formatDateTime, formatMoney } from '@/lib/utils';

type Tab = 'profile' | 'teams' | 'tournaments' | 'stats' | 'notifications';

export function DashboardPage() {
  const { session, profile, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { upload, uploading } = useUpload();

  const [tab, setTab] = useState<Tab>('profile');
  const [teams, setTeams] = useState<Team[]>([]);
  const [myRegs, setMyRegs] = useState<(TournamentRegistration & { tournament?: Tournament })[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', tag: '', logo: null as File | null });
  const [profileForm, setProfileForm] = useState({ username: '', bio: '', avatar: null as File | null });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadData();
  }, [session]);

  const loadData = async () => {
    if (!session) return;
    const uid = session.user.id;
    const [teamsRes, regsRes, statsRes, notifRes] = await Promise.all([
      supabase.from('teams').select('*').eq('captain_id', uid),
      supabase.from('tournament_registrations').select('*, tournament:tournaments(*)').in('team_id', (await supabase.from('teams').select('id').eq('captain_id', uid)).data?.map((t) => t.id) || []),
      supabase.from('player_stats').select('*').eq('user_id', uid).maybeSingle(),
      supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    ]);
    setTeams((teamsRes.data as Team[]) || []);
    setMyRegs((regsRes.data as (TournamentRegistration & { tournament?: Tournament })[]) || []);
    setStats((statsRes.data as PlayerStats) || null);
    setNotifications((notifRes.data as Notification[]) || []);
    if (profile) setProfileForm({ username: profile.username || '', bio: profile.bio || '', avatar: null });
    setLoading(false);
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !teamForm.name) return;
    let logoUrl: string | null = null;
    if (teamForm.logo) {
      logoUrl = await upload(teamForm.logo, 'team-logos');
      if (!logoUrl) return;
    }
    const { data, error } = await supabase.from('teams').insert({
      name: teamForm.name,
      tag: teamForm.tag || null,
      logo_url: logoUrl,
      captain_id: session.user.id,
    }).select().single();
    if (error) {
      toast(error.message, 'error');
      return;
    }
    // Add captain as a team member
    await supabase.from('team_members').insert({ team_id: data.id, user_id: session.user.id, role: 'captain' });
    toast('Team created!', 'success');
    setTeams([...teams, data as Team]);
    setShowTeamModal(false);
    setTeamForm({ name: '', tag: '', logo: null });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSavingProfile(true);
    let avatarUrl = profile?.avatar_url;
    if (profileForm.avatar) {
      avatarUrl = await upload(profileForm.avatar, 'avatars');
      if (!avatarUrl) { setSavingProfile(false); return; }
    }
    const { error } = await supabase.from('profiles').update({
      username: profileForm.username,
      bio: profileForm.bio,
      avatar_url: avatarUrl,
    }).eq('id', session.user.id);
    if (error) toast(error.message, 'error');
    else { toast('Profile updated!', 'success'); refreshProfile(); }
    setSavingProfile(false);
  };

  const markNotifRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (loading) return <div className="pt-28"><Loading /></div>;
  if (!session) return null;

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'teams', label: 'My Teams', icon: Users },
    { key: 'tournaments', label: 'My Tournaments', icon: Trophy },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-primary-400" />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{profile?.username || 'Player'}</h1>
              <p className="text-sm text-neutral-400">{session.user.email}</p>
            </div>
          </div>
          <Badge tone={profile?.role === 'admin' ? 'orange' : 'blue'}>
            {profile?.role === 'admin' ? 'Admin' : 'Player'}
          </Badge>
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
                  {t.key === 'notifications' && notifications.some((n) => !n.read) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </button>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {tab === 'profile' && (
              <Card className="p-6">
                <h2 className="font-display text-xl font-bold text-white mb-5">Edit Profile</h2>
                <form onSubmit={saveProfile} className="space-y-5">
                  <Field label="Username">
                    <Input value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} placeholder="Your gamer tag" />
                  </Field>
                  <Field label="Bio">
                    <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell the community about yourself..." />
                  </Field>
                  <Field label="Avatar">
                    <input type="file" accept="image/*" onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.files?.[0] || null })} className="text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer" />
                  </Field>
                  <Button type="submit" disabled={savingProfile || uploading}>{savingProfile ? 'Saving...' : 'Save Changes'}</Button>
                </form>
              </Card>
            )}

            {tab === 'teams' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">My Teams</h2>
                  <Button onClick={() => setShowTeamModal(true)}><Plus size={16} /> Create Team</Button>
                </div>
                {teams.length === 0 ? (
                  <EmptyState icon={<Users size={40} />} title="No teams yet" message="Create a team to start joining tournaments." action={<Button onClick={() => setShowTeamModal(true)}><Plus size={16} /> Create Team</Button>} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teams.map((t) => (
                      <Card key={t.id} className="p-5 flex items-center gap-4">
                        {t.logo_url ? (
                          <img src={t.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-bg-elevated flex items-center justify-center text-xl font-bold text-primary-400">{t.name[0]}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-white truncate">{t.name}</h3>
                          {t.tag && <p className="text-xs text-neutral-500">[{t.tag}]</p>}
                          <p className="text-xs text-neutral-500 mt-1">Created {formatDate(t.created_at)}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'tournaments' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">My Tournaments</h2>
                {myRegs.length === 0 ? (
                  <EmptyState icon={<Trophy size={40} />} title="Not registered yet" message="Browse tournaments and register your team." action={<Button onClick={() => navigate('/tournaments')}>Browse Tournaments</Button>} />
                ) : (
                  <div className="space-y-3">
                    {myRegs.map((r) => (
                      <Card key={r.id} className="p-4 flex items-center justify-between hover:border-primary-500/40 cursor-pointer" onClick={() => navigate(`/tournaments/${r.tournament_id}`)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center"><Trophy size={18} className="text-primary-400" /></div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white truncate">{r.tournament?.title || 'Tournament'}</h3>
                            <p className="text-xs text-neutral-500">{formatDate(r.tournament?.start_time || null)}</p>
                          </div>
                        </div>
                        <Badge tone={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'yellow'}>{r.status}</Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'stats' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Personal Statistics</h2>
                {!stats ? (
                  <EmptyState icon={<BarChart3 size={40} />} title="No stats yet" message="Your stats will update after you play matches." />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard icon={Gamepad2} label="Matches Played" value={stats.total_matches} />
                    <StatCard icon={Target} label="Total Kills" value={stats.total_kills} />
                    <StatCard icon={Crown} label="Chicken Dinners" value={stats.total_wins} />
                    <StatCard icon={Trophy} label="Total Points" value={Number(stats.total_points).toFixed(0)} />
                    <StatCard icon={BarChart3} label="Avg Placement" value={Number(stats.avg_placement).toFixed(2)} />
                    <StatCard icon={Wallet} label="MVP Points" value={Number(stats.mvp_points).toFixed(0)} />
                  </div>
                )}
              </div>
            )}

            {tab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Notifications</h2>
                {notifications.length === 0 ? (
                  <EmptyState icon={<Bell size={40} />} title="No notifications" message="You'll be notified about registrations, matches, and results here." />
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <Card key={n.id} className={cn('p-4 flex items-start gap-3', !n.read && 'border-primary-500/30')}>
                        <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', n.read ? 'bg-neutral-600' : 'bg-primary-500')} />
                        <div className="flex-1">
                          <p className="text-sm text-neutral-200">{n.message}</p>
                          <p className="text-xs text-neutral-500 mt-1">{formatDateTime(n.created_at)}</p>
                        </div>
                        {!n.read && <button onClick={() => markNotifRead(n.id)} className="text-xs text-accent-400 hover:text-accent-300">Mark read</button>}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create team modal */}
      <Modal open={showTeamModal} onClose={() => setShowTeamModal(false)} title="Create Team">
        <form onSubmit={createTeam} className="space-y-4">
          <Field label="Team Name">
            <Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="e.g. Phoenix Esports" required />
          </Field>
          <Field label="Team Tag" hint="Short abbreviation (optional)">
            <Input value={teamForm.tag} onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value })} placeholder="e.g. PHX" maxLength={6} />
          </Field>
          <Field label="Team Logo">
            <input type="file" accept="image/*" onChange={(e) => setTeamForm({ ...teamForm, logo: e.target.files?.[0] || null })} className="text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer" />
          </Field>
          <Button type="submit" disabled={uploading} className="w-full">{uploading ? 'Uploading...' : 'Create Team'}</Button>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof User; label: string; value: number | string }) {
  return (
    <Card className="p-5">
      <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-3">
        <Icon size={20} className="text-primary-400" />
      </div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">{label}</p>
    </Card>
  );
}
