import { useMemo, useRef, useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { parseLRC, getCurrentLyricIndex } from './LyricParser';
import { cn } from '../utils/cn';

interface LyricDisplayProps {
  lrcText?: string;
  className?: string;
}

export function LyricDisplay({ lrcText, className }: LyricDisplayProps) {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => (lrcText ? parseLRC(lrcText) : []), [lrcText]);
  const activeIdx = getCurrentLyricIndex(lines, currentTime);

  // Auto-scroll
  useEffect(() => {
    if (activeIdx < 0 || !containerRef.current) return;
    const active = containerRef.current.children[activeIdx + 1] as HTMLElement | undefined;
    active?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIdx]);

  if (lines.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <p className="font-mono text-xs italic opacity-40" style={{ color: 'var(--text-secondary)' }}>
          NO LYRICS
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('overflow-y-auto space-y-3 py-4', className)}>
      {lines.map((line, i) => (
        <p
          key={i}
          className={cn(
            'transition-all duration-300 font-mono text-sm leading-relaxed px-2',
            i === activeIdx
              ? 'opacity-100 font-semibold'
              : 'opacity-30 hover:opacity-50'
          )}
          style={{
            color: i === activeIdx ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderLeft: i === activeIdx ? '2px solid var(--highlight)' : '2px solid transparent',
            boxShadow: i === activeIdx ? '0 0 12px var(--glow-color)' : 'none',
            transform: i === activeIdx ? 'scale(1.02)' : 'scale(1)',
            transformOrigin: 'left center',
          }}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}
