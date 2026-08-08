import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'How do I register for a tournament?', a: 'Create an account, form or join a team, then go to the Tournaments page and click Register. Solo players can register without a team for solo-mode tournaments.' },
  { q: 'What are the entry fees and prize pools?', a: 'Each tournament has its own entry fee and prize pool listed on its detail page. Entry fees are collected per team, and prize pools are distributed among top performers.' },
  { q: 'How does the point system work?', a: 'Points are calculated automatically: Placement Points (1st=15, 2nd=12, 3rd=10, 4th=8, 5th=6, 6th=4, 7th=2, 8th-16th=0) plus Kill Points (1 per kill by default). Admins can configure custom scoring rules.' },
  { q: 'When are Room IDs and passwords shared?', a: 'Room details are locked until a configurable time before each match (default 15 minutes). They unlock automatically — check the match schedule on the tournament page.' },
  { q: 'How are winners verified?', a: 'After a tournament ends, admins upload winner screenshots and payment proofs. These appear in the Winner Gallery with full match statistics and downloadable result sheets.' },
  { q: 'Can I play on multiple teams?', a: 'No. Each player can only be part of one team per tournament. Registering with multiple teams will result in disqualification.' },
  { q: 'What happens if a match is interrupted?', a: 'If server issues occur, admins may reschedule or replay the match. Report any issues within 10 minutes of the disruption.' },
  { q: 'How do I become an admin?', a: 'Admin access is granted by existing platform administrators. Contact us via the Contact page if you believe you should have admin privileges.' },
  { q: 'Is my data secure?', a: 'Yes. We use secure authentication and database systems. Your password is never stored in plain text, and payment proofs are handled securely.' },
  { q: 'How do I report a cheater?', a: 'Use the Contact page to report suspected cheating. Include evidence (screenshots, videos) and the match details. Our team reviews all reports.' },
];

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <PageHeader title="Frequently Asked Questions" subtitle="Everything you need to know about competing on BGMI Arena." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-3">
        {faqs.map((faq, i) => (
          <Card key={i} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-display font-semibold text-white">{faq.q}</span>
              <ChevronDown size={20} className={cn('text-primary-400 shrink-0 transition-transform', open === i && 'rotate-180')} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
