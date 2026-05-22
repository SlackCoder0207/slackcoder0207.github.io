import { useMemo } from 'react';
import { cn } from '../../utils/cn';

interface MatrixProgressProps {
  value: number; // 0-1
  blockCount?: number;
  className?: string;
  height?: number;
}

export function MatrixProgress({
  value,
  blockCount = 40,
  className,
  height = 20,
}: MatrixProgressProps) {
  const filled = Math.round(value * blockCount);

  const blocks = useMemo(
    () =>
      Array.from({ length: blockCount }, (_, i) => ({
        key: i,
        active: i < filled,
        isLeading: i === filled - 1,
      })),
    [blockCount, filled]
  );

  return (
    <div
      className={cn('flex gap-[2px] items-stretch', className)}
      style={{ height }}
    >
      {blocks.map((b) => (
        <div
          key={b.key}
          className={cn(
            'flex-1 transition-all duration-200',
            b.active
              ? 'bg-[var(--accent)]'
              : 'bg-[var(--border)] opacity-30'
          )}
          style={
            b.isLeading
              ? {
                  boxShadow: '0 0 6px var(--accent), 0 0 12px var(--accent)',
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
