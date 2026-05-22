import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  children: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ children, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <h3
        className="font-mono text-xs tracking-[0.15em] uppercase font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {children}
      </h3>
      {subtitle && (
        <span
          className="font-mono text-[10px] tracking-wider uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
