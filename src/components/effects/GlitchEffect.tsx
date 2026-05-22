import { useEffect, useState, type ReactNode } from 'react';

interface GlitchEffectProps {
  children: ReactNode;
  className?: string;
  /** Probability of glitching per tick (0-1) */
  probability?: number;
}

/**
 * Applies a subtle text glitch effect.
 * Active in both themes but more visible in Deconstruction Complex.
 */
export function GlitchEffect({ children, className, probability = 0.08 }: GlitchEffectProps) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const tick = () => {
      if (Math.random() < probability) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 80 + Math.random() * 120);
      }
    };

    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [probability]);

  return (
    <span
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...(glitching && {
          transform: `translate(${Math.random() * 2 - 1}px, ${Math.random() * 1 - 0.5}px)`,
          filter: `brightness(${1 + Math.random() * 0.3})`,
          transition: 'none',
        }),
      }}
    >
      {children}
    </span>
  );
}
