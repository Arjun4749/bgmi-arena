import { MonitorPlay, Play, Bell, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/context/RouterContext';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@bgmiarena';

// Featured videos — admins can wire these to the YouTube Data API later.
// For now they are placeholders that link to the channel.
const featuredVideos = [
  { id: '1', title: 'Grand Finals — Squad Championship', thumb: '', url: YOUTUBE_CHANNEL },
  { id: '2', title: 'Best Clutches of the Season', thumb: '', url: YOUTUBE_CHANNEL },
  { id: '3', title: 'Solo Showdown — Highlights', thumb: '', url: YOUTUBE_CHANNEL },
  { id: '4', title: 'Duo Masters — Full Stream Replay', thumb: '', url: YOUTUBE_CHANNEL },
  { id: '5', title: 'Top 5 Chicken Dinners', thumb: '', url: YOUTUBE_CHANNEL },
  { id: '6', title: 'Interview with the Champions', thumb: '', url: YOUTUBE_CHANNEL },
];

export function YoutubePage() {
  const { navigate } = useRouter();

  return (
    <div>
      <PageHeader title="YouTube" subtitle="Watch live streams, match highlights, and tournament recaps on our official channel." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Channel banner */}
        <Card className="relative overflow-hidden">
          <div className="h-48 sm:h-64 bg-gradient-to-r from-red-600/30 via-bg-elevated to-bg-card flex items-center justify-center relative">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <MonitorPlay size={44} className="text-red-400" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">BGMI Arena Official</h2>
              <p className="text-neutral-400 mt-1">Live streams • Highlights • Tournaments</p>
            </div>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-400">Subscribe for live match streams and winner announcements.</p>
            </div>
            <a href={YOUTUBE_CHANNEL} target="_blank" rel="noreferrer">
              <Button className="bg-red-500 hover:bg-red-600 shadow-[0_0_18px_rgba(239,68,68,0.35)]">
                <Bell size={16} /> Subscribe
              </Button>
            </a>
          </div>
        </Card>

        {/* Live stream section */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
            <h2 className="font-display text-xl font-bold text-white">Live Stream</h2>
          </div>
          <Card className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
              <Play size={28} className="text-primary-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">No live stream right now</h3>
            <p className="text-sm text-neutral-400 mt-1 mb-4">We go live during tournament matches. Subscribe to get notified.</p>
            <a href={YOUTUBE_CHANNEL} target="_blank" rel="noreferrer">
              <Button variant="outline">Visit Channel <ExternalLink size={14} /></Button>
            </a>
          </Card>
        </div>

        {/* Featured videos */}
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-5">Featured Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredVideos.map((v) => (
              <a key={v.id} href={v.url} target="_blank" rel="noreferrer">
                <Card hover className="overflow-hidden group h-full">
                  <div className="relative h-44 bg-gradient-to-br from-red-500/15 via-bg-elevated to-bg-card flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={24} className="text-red-400" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{v.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">BGMI Arena Official</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* CTA back */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/tournaments')}>Browse Tournaments</Button>
        </div>
      </div>
    </div>
  );
}
