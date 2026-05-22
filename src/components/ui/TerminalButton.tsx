import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'data' | 'danger';

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

export function TerminalButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: TerminalButtonProps) {
  return (
    <button
      className={cn(
        'bevel-sm relative inline-flex items-center justify-center gap-2',
        'font-mono text-xs uppercase tracking-[0.08em]',
        'transition-all duration-bevel select-none',
        'border',
        // sizes
        size === 'sm' && 'px-2 py-1 text-[10px]',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-sm',
        // variant
        variant === 'primary' && [
          'border-[var(--accent)] text-[var(--accent)]',
          'hover:bg-[var(--accent)] hover:text-[var(--bg-primary)]',
          'active:opacity-80',
        ],
        variant === 'data' && [
          'border-[var(--border)] text-[var(--text-secondary)]',
          'hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]',
        ],
        variant === 'danger' && [
          'border-[var(--highlight)] text-[var(--highlight)]',
          'hover:bg-[var(--highlight)] hover:text-[var(--bg-primary)]',
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
