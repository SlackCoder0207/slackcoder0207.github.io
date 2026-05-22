import { useState } from 'react';
import { cn } from '../../utils/cn';

interface HUDItem {
  label: string;
  value: string;
}

const defaultItems: HUDItem[] = [
  { label: 'NETWORK', value: 'STABLE' },
  { label: 'SYNC', value: '--' },
  { label: 'STREAM', value: 'STANDBY' },
];

export function HUDOverlay({ className }: { className?: string }) {
  const [items] = useState<HUDItem[]>(defaultItems);

  return (
    <div
      className={cn(
        'fixed bottom-2 right-3 flex flex-col items-end gap-0.5 pointer-events-none select-none z-50',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-[0.12em] uppercase opacity-40"
            style={{ color: 'var(--text-secondary)' }}
          >
            {item.label}
          </span>
          <span
            className="text-[10px] font-mono tracking-wider uppercase"
            style={{ color: 'var(--accent)' }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
