import { cn } from '../../utils/cn';

interface SystemTagProps {
  children: string;
  color?: 'accent' | 'highlight' | 'default';
  className?: string;
}

const colorMap = {
  accent: 'var(--accent)',
  highlight: 'var(--highlight)',
  default: 'var(--text-secondary)',
};

export function SystemTag({ children, color = 'default', className }: SystemTagProps) {
  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-[0.12em] uppercase',
        className
      )}
      style={{ color: colorMap[color] }}
    >
      {children}
    </span>
  );
}
