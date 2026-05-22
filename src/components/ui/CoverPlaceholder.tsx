import { useMemo } from 'react';

interface CoverPlaceholderProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-16 h-16 text-sm',
  lg: 'w-24 h-24 text-lg',
  xl: 'w-full aspect-square text-2xl',
};

// Generate a deterministic pastel gradient from a string
function hashGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 50%, 35%) 0%, hsl(${h2}, 55%, 25%) 100%)`;
}

function getInitials(name: string): string {
  return name
    .split(/[\s_\-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function CoverPlaceholder({ name, size = 'lg', className = '' }: CoverPlaceholderProps) {
  const gradient = useMemo(() => hashGradient(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  if (!name) {
    return (
      <div className={`${sizeMap[size]} bevel flex items-center justify-center ${className}`}
        style={{ background: 'var(--bg-secondary)' }}>
        <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5"
          style={{ color: 'var(--text-secondary)' }}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeMap[size]} bevel flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: gradient }}>
      <span className="font-mono font-bold tracking-wider text-white/80 drop-shadow-sm" style={{ fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.4rem' : '0.8rem' }}>
        {initials}
      </span>
    </div>
  );
}
