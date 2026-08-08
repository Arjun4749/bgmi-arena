import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading, EmptyState } from '@/components/States';
import { formatDate } from '@/lib/utils';

export function NewsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      setItems((data as Announcement[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader title="News & Announcements" subtitle="Stay updated with the latest tournament announcements, patch notes, and community news." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState icon={<Newspaper size={40} />} title="No news yet" message="Announcements will appear here as they are published." />
        ) : (
          <div className="space-y-6">
            {items.map((a) => (
              <Card key={a.id} hover className="overflow-hidden">
                {a.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img src={a.image_url} alt={a.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge tone="orange">{a.category}</Badge>
                    <span className="text-xs text-neutral-500">{formatDate(a.created_at)}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-white mb-2">{a.title}</h2>
                  <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">{a.body}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
