import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: 'orange' | 'blue' | 'none';
}

export function Card({ children, className, hover = false, glow = 'none', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card-surface rounded-xl overflow-hidden transition-all duration-300',
        hover && 'hover:border-primary-500/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
        glow === 'orange' && 'border-glow-orange',
        glow === 'blue' && 'border-glow-blue',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
