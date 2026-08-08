import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tournament, TournamentStatus } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { TournamentCard } from '@/components/TournamentCard';
import { Card } from '@/components/ui/Card';
import { Loading, EmptyState } from '@/components/States';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const tabs: { key: TournamentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
];

export function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [active, setActive] = useState<TournamentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      setTournaments((data as Tournament[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = active === 'all' ? tournaments : tournaments.filter((t) => t.status === active);

  return (
    <div>
      <PageHeader title="Tournaments" subtitle="Browse all upcoming, live, and completed BGMI tournaments. Register your team and compete for the prize pool." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                active === tab.key
                  ? 'bg-primary-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.3)]'
                  : 'bg-bg-elevated text-neutral-300 border border-border-subtle hover:border-primary-500/40',
              )}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">
                {tab.key === 'all' ? tournaments.length : tournaments.filter((t) => t.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Trophy size={40} />}
            title="No tournaments here"
            message="Check back soon — new tournaments are added regularly."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <TournamentCard tournament={t} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
