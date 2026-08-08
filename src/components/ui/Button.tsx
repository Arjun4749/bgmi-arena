import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 shadow-[0_0_18px_rgba(249,115,22,0.35)] hover:shadow-[0_0_26px_rgba(249,115,22,0.5)]',
  secondary:
    'bg-accent-500 text-bg-base hover:bg-accent-400 shadow-[0_0_18px_rgba(34,211,238,0.3)] hover:shadow-[0_0_26px_rgba(34,211,238,0.45)]',
  ghost: 'bg-transparent text-neutral-300 hover:bg-bg-elevated hover:text-white',
  danger: 'bg-error-500 text-white hover:bg-red-600',
  outline:
    'bg-transparent border border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
