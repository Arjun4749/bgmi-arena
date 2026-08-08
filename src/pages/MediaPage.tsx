import { useEffect, useState } from 'react';
import { Image as ImageIcon, Video, Trophy, CreditCard, Sparkles, Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Media, MediaType } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Loading, EmptyState } from '@/components/States';
import { cn } from '@/lib/utils';

const filters: { key: MediaType | 'all'; label: string; icon: typeof Trophy }[] = [
  { key: 'all', label: 'All', icon: ImageIcon },
  { key: 'winner', label: 'Winners', icon: Trophy },
  { key: 'payment', label: 'Payment Proofs', icon: CreditCard },
  { key: 'highlight', label: 'Highlights', icon: Sparkles },
  { key: 'poster', label: 'Posters', icon: Flag },
  { key: 'video', label: 'Videos', icon: Video },
];

export function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [active, setActive] = useState<MediaType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      setMedia((data as Media[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = active === 'all' ? media : media.filter((m) => m.type === active);

  return (
    <div>
      <PageHeader title="Media Gallery" subtitle="Winner screenshots, payment proofs, highlight clips, tournament posters, and videos — all in one place." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                active === f.key
                  ? 'bg-primary-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.3)]'
                  : 'bg-bg-elevated text-neutral-300 border border-border-subtle hover:border-primary-500/40',
              )}
            >
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<ImageIcon size={40} />} title="No media yet" message="Media will appear here once uploaded by admins." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m) => (
              <Card key={m.id} hover className="overflow-hidden group">
                <div className="relative h-56 overflow-hidden bg-bg-elevated">
                  {m.type === 'video' && m.video_url ? (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <iframe src={m.video_url} title={m.title || 'video'} className="w-full h-full" allowFullScreen loading="lazy" />
                    </div>
                  ) : m.image_url ? (
                    <img src={m.image_url} alt={m.title || ''} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={40} className="text-neutral-600" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs uppercase tracking-wider text-primary-400">{m.type}</span>
                  <h3 className="font-semibold text-white mt-1">{m.title || 'Untitled'}</h3>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
