import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'orange' | 'blue' | 'green' | 'red' | 'yellow' | 'neutral';

const tones: Record<Tone, string> = {
  orange: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  blue: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
  green: 'bg-success-500/15 text-success-500 border-success-500/30',
  red: 'bg-error-500/15 text-error-500 border-error-500/30',
  yellow: 'bg-warning-500/15 text-warning-500 border-warning-500/30',
  neutral: 'bg-neutral-800 text-neutral-300 border-neutral-700',
};

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
