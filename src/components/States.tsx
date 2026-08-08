import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={32} className="text-primary-500 animate-spin" />
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && <div className="text-neutral-600">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-neutral-300">{title}</h3>
      {message && <p className="text-sm text-neutral-500 max-w-sm">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
