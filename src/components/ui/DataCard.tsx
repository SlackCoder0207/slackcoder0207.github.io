import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface DataCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
}

export function DataCard({ children, className, variant = 'default' }: DataCardProps) {
  return (
    <div
      className={cn(
        'bevel relative p-4 border',
        variant === 'default' && 'bg-[var(--bg-secondary)] border-[var(--border)]',
        variant === 'glass' && 'backdrop-blur-sm border-[var(--border)]',
        variant === 'glass' && 'bg-[var(--glass-bg)]',
        className
      )}
    >
      {children}
    </div>
  );
}
