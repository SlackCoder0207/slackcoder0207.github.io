import { useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore';
import { useTheme } from '../../themes/ThemeProvider';
import { cn } from '../../utils/cn';
import { parseLRC, getCurrentLyricIndex } from '../../player/LyricParser';
import type { PlayMode } from '../../types';

const modeIcons: Record<PlayMode, string> = {
  sequential: '→',
  'repeat-one': '①↺',
  shuffle: '⇄',
  'repeat-list': '↺',
};
const modeCycle: PlayMode[] = ['sequential', 'repeat-list', 'shuffle', 'repeat-one'];

export function BottomPlayer() {
  const {
    currentSong, status, currentTime, duration,
    volume, setVolume, next, prev, playMode, setPlayMode,
    setCurrentTime, setFullscreenLyrics, showPlaylist, setShowPlaylist, queue, queueIndex, playAtQueueIndex,
  } = usePlayerStore();
  const { theme } = useTheme();

  const progressRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? currentTime / duration : 0;

  // ── Karaoke lyrics ──
  const lines = useMemo(() => (currentSong?.lrcText ? parseLRC(currentSong.lrcText) : []), [currentSong?.lrcText]);
  const activeIdx = getCurrentLyricIndex(lines, currentTime);
  const currentLine = lines[activeIdx];
  const nextLine = lines[activeIdx + 1];
  const lineProgress = currentLine && nextLine
    ? Math.max(0, Math.min(1, (currentTime - currentLine.time) / (nextLine.time - currentLine.time)))
    : 1;

  // Karaoke split: characters before/after progress point
  const karaokeParts = useMemo(() => {
    if (!currentLine) return null;
    const text = currentLine.text;
    const splitAt = Math.floor(text.length * lineProgress);
    return { before: text.slice(0, splitAt), after: text.slice(splitAt) };
  }, [currentLine, lineProgress]);

  // Simulated playback tick
  useEffect(() => {
    const store = usePlayerStore.getState();
    if (store.status !== 'playing') return;
    const id = setInterval(() => {
      const s = usePlayerStore.getState();
      if (s.status !== 'playing') return;
      const next = s.currentTime + 0.1;
      if (next >= s.duration) { s.setStatus('ended'); s.setCurrentTime(s.duration); }
      else s.setCurrentTime(next);
    }, 100);
    return () => clearInterval(id);
  }, [status]);

  const togglePlay = () => {
    const s = usePlayerStore.getState();
    if (s.status === 'playing') s.setStatus('paused');
    else if (s.status === 'paused') s.setStatus('playing');
    else if (s.currentSong) s.setStatus('playing');
  };

  const cycleMode = () => {
    const idx = modeCycle.indexOf(playMode);
    setPlayMode(modeCycle[(idx + 1) % modeCycle.length]);
  };

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Progress: click to seek
  const isDraggingRef = useRef(false);
  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pct * (duration || 0));
  }, [duration, setCurrentTime]);
  const handleProgressDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleProgressClick(e as any);
  }, [handleProgressClick]);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrentTime(pct * (duration || 0));
    };
    const up = () => { isDraggingRef.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [duration, setCurrentTime]);

  const gradId = 'bp-progress';
  const isClinical = theme.id === 'clinical';
  const gradStart = '#ffffff';
  const gradEnd = isClinical ? '#002FA7' : 'var(--accent)';

  return (
    <footer
      className="flex-shrink-0 border-t px-3 py-2 flex items-center gap-2 select-none"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
    >
      {/* Left: song info */}
      <button onClick={() => setFullscreenLyrics(true)}
        className="flex items-center gap-2 min-w-0 w-32 flex-shrink-0 text-left hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bevel-sm border border-[var(--accent)]/30 flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--bg-primary)' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: currentSong ? 'var(--accent)' : 'var(--text-secondary)' }} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-ui text-xs font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>{currentSong?.title ?? 'NO TRACK'}</p>
          <p className="font-mono text-[10px] tracking-wider truncate leading-tight" style={{ color: 'var(--text-secondary)' }}>{currentSong?.artist ?? 'STANDBY'}</p>
        </div>
      </button>

      {/* Controls + Volume */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={prev} className="px-1 text-sm transition-all duration-200 hover:text-[var(--accent)] hover:scale-110" style={{ color: 'var(--text-secondary)' }}>⏮</button>
        <button onClick={togglePlay} className="w-7 h-7 bevel-sm flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
          style={{ color: 'var(--bg-primary)', background: 'var(--accent)' }}>{status === 'playing' ? '⏸' : '▶'}</button>
        <button onClick={next} className="px-1 text-sm transition-all duration-200 hover:text-[var(--accent)] hover:scale-110" style={{ color: 'var(--text-secondary)' }}>⏭</button>
        <button onClick={cycleMode} className="font-mono text-xs font-bold px-1.5 transition-all duration-200 hover:text-[var(--accent)] flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }} title={playMode}>{modeIcons[playMode]}</button>
        {/* Volume — between controls and lyrics */}
        <div className="flex items-center gap-1 w-14 flex-shrink-0">
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(90deg, var(--accent) ${volume * 100}%, var(--border) ${volume * 100}%)` }} />
        </div>
      </div>

      {/* Center: karaoke lyrics */}
      <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden h-8">
        {karaokeParts ? (
          <p className="font-ui text-sm truncate whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{karaokeParts.before}</span>
            <span style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>{karaokeParts.after}</span>
          </p>
        ) : (
          <p className="font-mono text-[10px] tracking-widest uppercase truncate" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
            {currentSong ? '♪ PLAYING' : 'NO TRACK'}
          </p>
        )}
      </div>

      {/* Time / Progress */}
      <span className="font-mono text-[10px] tabular-nums w-7 text-right flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{format(currentTime)}</span>
      <div ref={progressRef} className="w-24 h-3 relative cursor-pointer group flex-shrink-0 flex items-center"
        onMouseDown={handleProgressDown} style={{ touchAction: 'none' }}>
        <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'var(--text-secondary)', height: '6px', top: '50%', transform: 'translateY(-50%)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'hidden' }}>
          <defs><linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={gradStart} /><stop offset="100%" stopColor={gradEnd} /></linearGradient></defs>
          <rect x="0" y="calc(50% - 3px)" width={`${progress * 100}%`} height="6" rx="999" fill={`url(#${gradId})`}
            style={{ transition: isDraggingRef.current ? 'none' : 'width 0.1s linear' }} />
        </svg>
        {progress > 0 && (
          <div className={cn('absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-200 opacity-0 group-hover:opacity-100')}
            style={{ left: `${progress * 100}%`, marginLeft: '-6px', borderColor: 'var(--accent)', background: 'var(--bg-primary)' }} />
        )}
      </div>
      <span className="font-mono text-[10px] tabular-nums w-7 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{format(duration)}</span>

      {/* Playlist button — far right */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setShowPlaylist(!showPlaylist)}
          className="font-mono text-base font-bold px-2 py-1 border-2 transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: showPlaylist ? 'var(--accent)' : 'var(--border)', color: showPlaylist ? 'var(--accent)' : 'var(--text-secondary)' }}>
          ☰
        </button>

        {/* Playlist panel — animated upward */}
        <AnimatePresence>
          {showPlaylist && queue.length > 0 && (
            <motion.div className="absolute bottom-full right-0 mb-1 w-64 max-h-56 overflow-y-auto border bevel-sm p-2 shadow-lg z-30"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', transformOrigin: 'bottom' }}
              initial={{ opacity: 0, y: 8, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: 8, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}>
              <p className="font-mono text-[10px] tracking-wider uppercase mb-2 px-1" style={{ color: 'var(--text-secondary)' }}>
                QUEUE · {queueIndex + 1}/{queue.length}
              </p>
              {queue.map((s, i) => (
                <button key={`${s.id}-${i}`} onClick={() => playAtQueueIndex(i)}
                  className="w-full text-left px-2 py-1.5 flex items-center gap-2 transition-colors duration-150"
                  style={{ background: i === queueIndex ? 'var(--accent)' : 'transparent', color: i === queueIndex ? '#fff' : 'var(--text-primary)' }}>
                  <span className="font-mono text-[10px] w-4 flex-shrink-0" style={{ color: i === queueIndex ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>{i + 1}</span>
                  <span className="font-ui text-xs truncate">{s.title}</span>
                  <span className="font-mono text-[10px] ml-auto flex-shrink-0" style={{ color: i === queueIndex ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>
                    {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}
