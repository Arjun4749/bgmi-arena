import { Trophy, Users, Calendar, MapPin, Clock } from 'lucide-react';
import type { Tournament } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from '@/context/RouterContext';
import { formatMoney, timeUntil, formatDate } from '@/lib/utils';

const statusTone = {
  upcoming: 'blue' as const,
  ongoing: 'orange' as const,
  completed: 'neutral' as const,
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const { navigate } = useRouter();
  const slotsLeft = tournament.slots - tournament.filled;

  return (
    <Card hover className="group cursor-pointer" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
      {/* Banner */}
      <div className="relative h-40 overflow-hidden bg-bg-elevated">
        {tournament.banner_url ? (
          <img
            src={tournament.banner_url}
            alt={tournament.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500/20 via-bg-elevated to-accent-500/20 flex items-center justify-center">
            <Trophy size={48} className="text-primary-500/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge tone={statusTone[tournament.status]}>{tournament.status}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge tone="neutral">{tournament.mode.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h3 className="font-display font-bold text-lg text-white group-hover:text-primary-400 transition-colors line-clamp-1">
          {tournament.title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} /> {formatDate(tournament.start_time)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {tournament.map || 'TBA'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div>
            <p className="text-xs text-neutral-500">Prize Pool</p>
            <p className="font-display font-bold text-primary-400">{formatMoney(tournament.prize_pool)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Entry Fee</p>
            <p className="font-display font-bold text-accent-400">{formatMoney(tournament.entry_fee)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Users size={14} /> {tournament.filled}/{tournament.slots} teams
          </span>
          {tournament.status === 'upcoming' && (
            <span className="flex items-center gap-1.5 text-accent-400">
              <Clock size={14} /> {timeUntil(tournament.start_time)}
            </span>
          )}
          {tournament.status === 'ongoing' && (
            <span className="flex items-center gap-1.5 text-primary-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary-500" /> LIVE
            </span>
          )}
        </div>

        {slotsLeft > 0 && tournament.status === 'upcoming' && (
          <div className="w-full bg-bg-elevated rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
              style={{ width: `${(tournament.filled / tournament.slots) * 100}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
