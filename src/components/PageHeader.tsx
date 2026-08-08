import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="relative pt-28 pb-10 bg-radial-glow bg-grid border-b border-border-subtle overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl animate-glow-pulse" />
        <div className="absolute -top-10 right-1/4 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-neutral-400 max-w-2xl text-base sm:text-lg">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
