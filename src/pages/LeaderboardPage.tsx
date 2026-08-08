import { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PlayerStats, Profile } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading, EmptyState } from '@/components/States';
import { cn } from '@/lib/utils';

type Tab = 'overall' | 'mvp' | 'kills';

export function LeaderboardPage() {
  const [stats, setStats] = useState<(PlayerStats & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overall');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('player_stats')
        .select('*, profile:profiles(*)')
        .order('total_points', { ascending: false })
        .limit(50);
      setStats((data as (PlayerStats & { profile?: Profile })[]) || []);
      setLoading(false);
    })();
  }, []);

  const sorted = [...stats].sort((a, b) => {
    if (tab === 'mvp') return Number(b.mvp_points) - Number(a.mvp_points);
    if (tab === 'kills') return b.total_kills - a.total_kills;
    return Number(b.total_points) - Number(a.total_points);
  });

  const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
    { key: 'overall', label: 'Overall', icon: Trophy },
    { key: 'mvp', label: 'MVP Ranking', icon: Zap },
    { key: 'kills', label: 'Kill Leaderboard', icon: Target },
  ];

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="The best BGMI players on the platform. Rankings update automatically after every match result is published." />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                tab === t.key
                  ? 'bg-primary-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.3)]'
                  : 'bg-bg-elevated text-neutral-300 border border-border-subtle hover:border-primary-500/40',
              )}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : sorted.length === 0 ? (
          <EmptyState icon={<Trophy size={40} />} title="No rankings yet" message="Leaderboards will populate once matches are scored." />
        ) : (
          <Card className="overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border-subtle text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">Matches</div>
              <div className="col-span-2 text-center">Kills</div>
              <div className="col-span-2 text-center">{tab === 'kills' ? 'Kills' : tab === 'mvp' ? 'MVP' : 'Points'}</div>
            </div>
            {sorted.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'grid grid-cols-12 gap-2 px-5 py-3 items-center border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-elevated',
                )}
              >
                <div className="col-span-1">
                  <span className={cn(
                    'font-display font-bold w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                    i === 0 ? 'bg-primary-500/20 text-primary-400' : i === 1 ? 'bg-neutral-400/20 text-neutral-300' : i === 2 ? 'bg-amber-700/20 text-amber-500' : 'text-neutral-500',
                  )}>
                    {i === 0 ? <Crown size={16} /> : i + 1}
                  </span>
                </div>
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  {s.profile?.avatar_url ? (
                    <img src={s.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-bold text-neutral-400">
                      {(s.profile?.username || '?')[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-neutral-200 truncate">{s.profile?.username || 'Unknown'}</span>
                </div>
                <div className="col-span-2 text-center text-sm text-neutral-400">{s.total_matches}</div>
                <div className="col-span-2 text-center text-sm text-neutral-400">{s.total_kills}</div>
                <div className="col-span-2 text-center">
                  <span className="font-display font-bold text-primary-400">
                    {tab === 'kills' ? s.total_kills : tab === 'mvp' ? Number(s.mvp_points).toFixed(0) : Number(s.total_points).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Stats legend */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Badge tone="orange">Total Points = Placement + Kill Points</Badge>
          <Badge tone="blue">MVP = Total Points across all matches</Badge>
          <Badge tone="green">Kills = Total eliminations</Badge>
        </div>
      </div>
    </div>
  );
}
