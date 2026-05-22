import { useEffect, useRef } from 'react';
import { useTheme } from '../../themes/ThemeProvider';

/**
 * A scanning line that moves vertically across the screen.
 * Slow for Clinical Archive, fast for Deconstruction Complex.
 */
export function ScanEffect() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const duration = theme.id === 'clinical' ? 4000 : 2000;
    el.style.animationDuration = `${duration}ms`;

    let dir = 1;
    let pos = 0;
    const step = () => {
      pos += dir * (theme.id === 'clinical' ? 0.3 : 0.8);
      if (pos > 100 || pos < 0) {
        dir *= -1;
        pos = Math.max(0, Math.min(100, pos));
      }
      el.style.transform = `translateY(${pos}%)`;
    };

    const id = setInterval(step, 30);
    return () => clearInterval(id);
  }, [theme.id]);

  return (
    <div
      ref={ref}
      className="fixed left-0 right-0 h-px pointer-events-none z-40"
      style={{
        background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
        opacity: 0.15,
      }}
    />
  );
}
