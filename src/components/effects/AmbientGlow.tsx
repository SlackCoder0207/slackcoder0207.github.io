import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface AmbientGlowProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  color?: string;
}

/**
 * A micro glow effect for active elements.
 * Extremely subtle — just a hint of radiance.
 */
export function AmbientGlow({ children, active = false, className, color }: AmbientGlowProps) {
  return (
    <div
      className={cn('relative', className)}
      style={
        active
          ? {
              boxShadow: `0 0 8px ${color ?? 'var(--glow-color)'}, 0 0 20px ${color ?? 'var(--glow-color)'}`,
              transition: 'box-shadow 120ms',
            }
          : { transition: 'box-shadow 120ms' }
      }
    >
      {children}
    </div>
  );
}
