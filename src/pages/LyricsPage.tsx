import { useMemo } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useTheme } from '../themes/ThemeProvider';
import { Visualizer } from '../player/Visualizer';
import { parseLRC, getCurrentLyricIndex } from '../player/LyricParser';

export function LyricsPage() {
  const { currentSong, currentTime, duration, status, setStatus } = usePlayerStore();
  const { theme } = useTheme();
  const progress = duration > 0 ? currentTime / duration : 0;

  const lines = useMemo(
    () => (currentSong?.lrcText ? parseLRC(currentSong.lrcText) : []),
    [currentSong?.lrcText]
  );
  const activeIdx = getCurrentLyricIndex(lines, currentTime);

  const togglePlay = () => {
    if (status === 'playing') setStatus('paused');
    else if (currentSong) setStatus('playing');
  };

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const gradId = 'sb-progress';
  const isClinical = theme.id === 'clinical';
  const gradStart = '#ffffff';
  const gradEnd = isClinical ? '#002FA7' : 'var(--accent)';

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Cover */}
      <div
        className="bevel w-full aspect-square border flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
      >
        {currentSong ? (
          <svg viewBox="0 0 24 24" className="w-12 h-12" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ) : (
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>
            NO MEDIA
          </span>
        )}
      </div>

      {/* Track info */}
      <div className="space-y-1 px-1 flex-shrink-0">
        <p className="font-ui text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {currentSong?.title ?? 'NO TRACK SELECTED'}
        </p>
        <p className="font-mono text-[10px] tracking-wider uppercase truncate" style={{ color: 'var(--text-secondary)' }}>
          {currentSong?.artist ?? 'STANDBY'}
        </p>
        {currentSong?.album && (
          <p className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
            {currentSong.album}
          </p>
        )}
      </div>

      {/* Mini player controls */}
      {currentSong && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="w-7 h-7 bevel-sm flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
            style={{ color: 'var(--bg-primary)', background: 'var(--accent)' }}
          >
            {status === 'playing' ? '⏸' : '▶'}
          </button>
          <span className="font-mono text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {format(currentTime)} / {format(duration)}
          </span>
        </div>
      )}

      {/* Visualizer */}
      <Visualizer barCount={24} height={28} className="flex-shrink-0" />

      {/* Static gradient progress bar (non-interactive) */}
      <div className="w-full h-1.5 relative flex-shrink-0">
        <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'var(--text-secondary)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'hidden' }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradStart} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={`${progress * 100}%`} height="100%" rx="999" fill={`url(#${gradId})`} />
        </svg>
      </div>

      {/* Lyrics preview — hide scrollbar */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 px-1 scrollbar-none">
        {lines.length === 0 ? (
          <p className="font-mono text-xs italic opacity-40" style={{ color: 'var(--text-secondary)' }}>
            {(currentSong && currentSong.lrcText) ? 'PARSING...' : 'NO LYRICS'}
          </p>
        ) : (
          lines.slice(Math.max(0, activeIdx - 2), activeIdx + 8).map((line, i) => {
            const realIdx = Math.max(0, activeIdx - 2) + i;
            const isActive = realIdx === activeIdx;
            return (
              <p
                key={i}
                className="transition-all duration-300"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: isActive ? 1 : 0.5,
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: '2px solid transparent',
                  paddingLeft: '8px',
                  fontSize: isActive ? '0.9em' : '0.8em',
                }}
              >
                {line.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}
