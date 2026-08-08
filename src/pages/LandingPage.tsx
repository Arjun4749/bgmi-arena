import { useEffect, useState } from 'react';
import { Trophy, Users, Gamepad2, Zap, ArrowRight, Crown, Target, Flame, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tournament, Announcement } from '@/lib/types';
import { useRouter } from '@/context/RouterContext';
import { TournamentCard } from '@/components/TournamentCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/States';
import { formatDate } from '@/lib/utils';
import { Trophy3D } from '@/components/Trophy3D';
import { Reveal } from '@/components/Reveal';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@bgmiarena';

export function LandingPage() {
  const { navigate } = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from('tournaments').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      ]);
      setTournaments((t as Tournament[]) || []);
      setAnnouncements((a as Announcement[]) || []);
      setLoading(false);
    })();
  }, []);

  const stats = [
    { icon: Trophy, label: 'Tournaments Hosted', value: '10+' },
    { icon: Users, label: 'Active Players', value: '500+' },
    { icon: Crown, label: 'Prize Pool', value: '₹50K+' },
    { icon: Gamepad2, label: 'Matches Played', value: '100+' },
  ];

  const features = [
    { icon: Zap, title: 'Instant Registration', desc: 'Join solo, duo, or squad tournaments in seconds with automated slot management.' },
    { icon: Target, title: 'Pro Point System', desc: 'Automated scoring with placement and kill points. Real-time leaderboards updated live.' },
    { icon: Trophy, title: 'Prize Pools', desc: 'Compete for cash prizes with transparent payment proofs and winner galleries.' },
    { icon: Flame, title: 'Live Match Rooms', desc: 'Room IDs and passwords unlock automatically before each match starts.' },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-grid">
        {/* Animated background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/15 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/15 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-700/5 blur-[100px]" />
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent animate-scan" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20">
          {/* 3D Rotating Trophy */}
          <div className="mx-auto mb-8 w-48 h-48 sm:w-64 sm:h-64 opacity-90">
            <Trophy3D className="w-full h-full" />
          </div>

          <Badge tone="orange" className="mb-6">
            <Flame size={14} /> Season 2026 Now Live
          </Badge>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]">
            <span className="text-white">DOMINATE THE</span>
            <br />
            <span className="text-primary-500 text-glow-orange">BATTLEGROUND</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            India's premier BGMI esports tournament platform. Compete in solo, duo, and squad battles.
            Climb the leaderboards. Win real prizes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/tournaments')} className="group">
              Browse Tournaments
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
              Start Competing
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-bg-elevated border border-border-subtle mb-2">
                    <s.icon size={22} className="text-primary-400" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-bg-base to-transparent" />
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <Badge tone="blue">Why BGMI Arena</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4">
            Built for <span className="text-accent-400">Champions</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <Card hover className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                  <f.icon size={24} className="text-primary-400" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* UPCOMING TOURNAMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge tone="orange">Compete Now</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">Featured Tournaments</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/tournaments')}>
            View All <ArrowRight size={16} />
          </Button>
        </div>

        {loading ? (
          <Loading />
        ) : tournaments.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy size={40} className="text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">No tournaments announced yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t, i) => (
              <Reveal key={t.id} delay={i * 100}>
                <TournamentCard tournament={t} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* NEWS / ANNOUNCEMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge tone="blue">Latest</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">News & Announcements</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/news')}>
            All News <ArrowRight size={16} />
          </Button>
        </div>

        {announcements.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-neutral-400">No announcements yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((a) => (
              <Card key={a.id} hover className="cursor-pointer" onClick={() => navigate('/news')}>
                {a.image_url && (
                  <div className="h-40 overflow-hidden">
                    <img src={a.image_url} alt={a.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <Badge tone="neutral">{a.category}</Badge>
                  <h3 className="font-display font-bold text-white mt-3 mb-2">{a.title}</h3>
                  <p className="text-sm text-neutral-400 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-neutral-500 mt-3">{formatDate(a.created_at)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* YOUTUBE CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <Card className="relative overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Play size={30} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Watch on YouTube</h3>
                <p className="text-neutral-400 mt-1">Live streams, highlights, and tournament recaps.</p>
              </div>
            </div>
            <a href={YOUTUBE_CHANNEL} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="lg" className="bg-red-500 hover:bg-red-600 shadow-[0_0_18px_rgba(239,68,68,0.35)]">
                <Play size={18} /> Subscribe
              </Button>
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
