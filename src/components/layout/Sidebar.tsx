import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';
import type { DataView } from '../../types';

const navItems: { id: DataView; label: string; mono: string }[] = [
  { id: 'library', label: 'Songs', mono: 'SONGS' },
  { id: 'search', label: 'Search', mono: 'SEARCH' },
  { id: 'collection', label: 'Collection', mono: 'COLLECT' },
  { id: 'playlist', label: 'Playlist', mono: 'PLAYLIST' },
  { id: 'history', label: 'History', mono: 'HISTORY' },
  { id: 'settings', label: 'Settings', mono: 'CONFIG' },
];

export function Sidebar() {
  const { dataView, setDataView } = useUIStore();

  return (
    <nav
      className="w-60 flex flex-col py-4 overflow-y-auto flex-shrink-0 transition-all duration-300"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Logo / brand */}
      <div className="px-5 pb-6 border-b transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
        <h2
          className="font-mono text-sm tracking-[0.25em] uppercase font-extrabold"
          style={{ color: 'var(--text-primary)' }}
        >
          RIAT
        </h2>
        <span
          className="font-mono text-[10px] tracking-wider uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          v0.1.0
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setDataView(item.id)}
            className={cn(
              'w-full text-left px-3 py-2 bevel-sm',
              'font-mono text-xs tracking-[0.08em] uppercase',
              'transition-all duration-200 border',
              dataView === item.id
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-transparent text-[var(--text-secondary)]',
              dataView !== item.id && 'hover:border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/50'
            )}
          >
            <span className={cn(
              'mr-2 font-mono text-[10px] transition-all duration-200',
              dataView === item.id ? 'opacity-100' : 'opacity-0'
            )} style={{ color: 'var(--accent)' }}>
              &gt;
            </span>
            {item.mono}
          </button>
        ))}
      </div>

      {/* Bottom status */}
      <div className="px-5 pt-4 border-t space-y-1 transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 transition-all duration-300" style={{ background: 'var(--accent)' }} />
          <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
            SYSTEM ACTIVE
          </span>
        </div>
      </div>
    </nav>
  );
}
