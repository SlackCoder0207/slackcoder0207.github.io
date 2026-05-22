import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore';
import { parseLRC, getCurrentLyricIndex } from '../../player/LyricParser';
import { cn } from '../../utils/cn';
import { Visualizer } from '../../player/Visualizer';
import { CoverPlaceholder } from '../ui/CoverPlaceholder';
import { useTheme } from '../../themes/ThemeProvider';
import type { PlayMode } from '../../types';

const modeIcons: Record<PlayMode, string> = {
  sequential: '→',
  'repeat-one': '①↺',
  shuffle: '⇄',
  'repeat-list': '↺',
};
const modeCycle: PlayMode[] = ['sequential', 'repeat-list', 'shuffle', 'repeat-one'];

export function FullscreenLyrics() {
  const { theme } = useTheme();
  const {
    currentSong, currentTime, duration, volume,
    setVolume, setCurrentTime, setFullscreenLyrics,
    status, setStatus, next, prev,
    playMode, setPlayMode, queue, queueIndex, playAtQueueIndex,
  } = usePlayerStore();

  const lyricsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = duration > 0 ? currentTime / duration : 0;
  const mvProgressRef = useRef<HTMLDivElement>(null);

  // MV hover states
  const [mvHover, setMvHover] = useState(false);
  const mvHoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [showProgress, setShowProgress] = useState(false);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const videoEndThreshold = useRef<number>(0);

  const lines = useMemo(
    () => (currentSong?.lrcText ? parseLRC(currentSong.lrcText) : []),
    [currentSong?.lrcText]
  );
  const activeIdx = getCurrentLyricIndex(lines, currentTime);
  const [entered, setEntered] = useState(false);
  const [mvMode, setMvMode] = useState(false);

  // Entrance animation trigger
  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, [currentSong?.id]);

  // Auto-scroll lyrics — center active line using scrollIntoView
  useEffect(() => {
    if (activeIdx < 0 || !lyricsRef.current || !entered) return;
    const active = lyricsRef.current.children[activeIdx] as HTMLElement | undefined;
    if (active) {
      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeIdx, entered]);

  // ── MV: sync video with playback ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mvMode) return;
    // Seek to current position
    video.currentTime = currentTime;
    if (status === 'playing' && video.paused) video.play().catch(() => {});
    if (status !== 'playing' && !video.paused) video.pause();
  }, [mvMode, currentTime, status]);

  // ── MV: update src on song change (no key remount) ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mvMode) return;
    // Force reload on song change to get fresh timeline
    video.load();
  }, [currentSong?.id, mvMode]);

  // ── MV re-entry: when seeking back before video end, re-enter MV ──
  useEffect(() => {
    if (mvMode) {
      videoEndThreshold.current = 0;
      return;
    }
    if (videoEndThreshold.current > 0 && currentTime < videoEndThreshold.current - 0.3 && currentTime > 0) {
      videoEndThreshold.current = 0;
      setMvMode(true);
    }
  }, [currentTime, mvMode]);

  // MV hover show/hide
  const handleMvMouseMove = useCallback(() => {
    setMvHover(true);
    setShowProgress(true);
    clearTimeout(mvHoverTimer.current);
    clearTimeout(progressTimer.current);
    mvHoverTimer.current = setTimeout(() => setMvHover(false), 3000);
    progressTimer.current = setTimeout(() => setShowProgress(false), 2000);
  }, []);

  const handleMvProgressClick = useCallback((e: React.MouseEvent) => {
    const rect = mvProgressRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pct * (duration || 0));
    // Also sync video
    if (videoRef.current) videoRef.current.currentTime = pct * (duration || 0);
  }, [duration, setCurrentTime]);


  const handleLyricClick = useCallback((time: number) => {
    setCurrentTime(time);
  }, [setCurrentTime]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pct * (duration || 1));
  }, [duration, setCurrentTime]);

  const togglePlay = () => {
    if (status === 'playing') setStatus('paused');
    else if (status === 'paused' || currentSong) setStatus('playing');
  };

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const gradId = 'fl-progress-grad';
  const isClinical = theme.id === 'clinical';
  const gradEnd = isClinical ? '#002FA7' : 'var(--accent)';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex"
      style={{ background: 'var(--bg-primary)' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Close — top-left chevron */}
      <button
        onClick={() => setFullscreenLyrics(false)}
        className="absolute z-10 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:opacity-80"
        style={{ color: 'var(--text-secondary)', top: '28px', left: '28px', width: '36px', height: '36px' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Left panel — slides left on MV */}
      <motion.div className="w-[360px] flex-shrink-0 flex flex-col pt-14 px-8 pb-8 border-r overflow-y-auto"
        style={{ borderColor: 'var(--border)' }}
        animate={mvMode ? { x: '-100%', opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
        {/* Cover */}
        <div className="mb-6 flex-shrink-0">
          <CoverPlaceholder name={currentSong?.title ?? ''} size="xl" />
        </div>

        {/* Song info */}
        <div className="space-y-1 mb-6">
          <p className="font-ui text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {currentSong?.title ?? 'NO TRACK SELECTED'}
          </p>
          <p className="font-mono text-xs tracking-wider uppercase truncate" style={{ color: 'var(--text-secondary)' }}>
            {currentSong?.artist ?? 'STANDBY'}
          </p>
          {currentSong?.album && (
            <p className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
              {currentSong.album}
            </p>
          )}
        </div>

        <Visualizer barCount={20} height={36} className="mb-4" />

        {/* Progress bar */}
        <div className="w-full h-1.5 relative cursor-pointer mb-2 group" onClick={handleProgressClick}>
          <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'var(--text-secondary)' }} />
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'hidden' }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor={gradEnd} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={`${progress * 100}%`} height="100%" rx="999" fill={`url(#${gradId})`} />
          </svg>
        </div>
        <div className="flex justify-between font-mono text-[10px] tabular-nums mb-4" style={{ color: 'var(--text-secondary)' }}>
          <span>{format(currentTime)}</span>
          <span>{format(duration)}</span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>VOL</span>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(90deg, var(--accent) ${volume * 100}%, var(--border) ${volume * 100}%)` }} />
          <span className="font-mono text-[10px] tabular-nums w-8 text-right" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(volume * 100)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={prev} className="font-mono text-2xl transition-all duration-200 hover:text-[var(--accent)] hover:scale-110" style={{ color: 'var(--text-secondary)', background: 'transparent' }}>⏮</button>
          <button onClick={togglePlay} className="font-mono text-3xl transition-all duration-200 hover:text-[var(--accent)] hover:scale-110 px-2" style={{ color: 'var(--text-secondary)', background: 'transparent' }}>
            {status === 'playing' ? '⏸' : '▶'}
          </button>
          <button onClick={next} className="font-mono text-2xl transition-all duration-200 hover:text-[var(--accent)] hover:scale-110" style={{ color: 'var(--text-secondary)', background: 'transparent' }}>⏭</button>
        </div>

        {/* Play mode toggle — no border, matches play/pause style */}
        <div className="flex items-center justify-center mt-3">
          <button onClick={() => { const idx = modeCycle.indexOf(playMode); setPlayMode(modeCycle[(idx + 1) % modeCycle.length]); }}
            className="font-mono text-lg transition-all duration-200 hover:text-[var(--accent)] hover:scale-110 px-2"
            style={{ color: 'var(--text-secondary)', background: 'transparent' }}>
            {modeIcons[playMode]}
          </button>
        </div>

        {/* Playlist panel */}
        {queue.length > 0 && (
          <div className="mt-4 border-t pt-3 flex-1 overflow-y-auto scrollbar-none" style={{ borderColor: 'var(--border)' }}>
            <p className="font-mono text-[10px] tracking-wider uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
              QUEUE · {queueIndex + 1}/{queue.length}
            </p>
            {queue.map((s, i) => (
              <button key={`${s.id}-${i}`} onClick={() => playAtQueueIndex(i)}
                className="w-full text-left px-2 py-1.5 flex items-center gap-2 transition-colors duration-150"
                style={{
                  background: i === queueIndex ? 'var(--accent)' : 'transparent',
                  color: i === queueIndex ? '#fff' : 'var(--text-primary)',
                }}>
                <span className="font-mono text-[10px] w-4 flex-shrink-0" style={{ color: i === queueIndex ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>{i + 1}</span>
                <span className="font-ui text-xs truncate">{s.title}</span>
                <span className="font-mono text-[10px] ml-auto flex-shrink-0" style={{ color: i === queueIndex ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>
                  {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        )}
        {/* MV toggle */}
        <div className="flex items-center justify-center mt-2 pt-2 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setMvMode(!mvMode)}
            className="font-mono text-sm transition-all duration-200 hover:text-[var(--accent)] hover:scale-110 px-2"
            style={{ color: mvMode ? 'var(--accent)' : 'var(--text-secondary)', background: 'transparent' }}>
            {mvMode ? '✕ MV' : '▶ MV'}
          </button>
        </div>
      </motion.div>

      {/* Right panel: lyrics — slides right on MV */}
      <motion.div className="flex-1 flex flex-col p-8 overflow-hidden"
        animate={mvMode ? { x: '100%', opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>LYRICS</span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>

        <div
          ref={lyricsRef}
          className="flex-1 overflow-y-auto space-y-2 scroll-smooth scrollbar-none"
          style={{ scrollBehavior: 'smooth', paddingTop: '40vh', paddingBottom: '40vh' }}
        >
          <AnimatePresence mode="popLayout">
            {lines.length === 0 ? (
              <p className="font-mono text-xs italic opacity-40 mt-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                NO LYRICS AVAILABLE
              </p>
            ) : (
              lines.map((line, i) => {
                const isActive = i === activeIdx;
                const isPast = i < activeIdx;
                return (
                  <motion.div
                    key={`${currentSong?.id}-${i}`}
                    layout
                    initial={entered ? false : { opacity: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        layout: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
                        opacity: { duration: 0.3, delay: entered ? 0 : i * 0.02 },
                        y: { duration: 0.3, delay: entered ? 0 : i * 0.02 },
                      },
                    }}
                  >
                    <button
                      onClick={() => handleLyricClick(line.time)}
                      className={cn(
                        'block w-full text-left py-3 px-6 transition-[color,opacity,border,box-shadow] duration-300 rounded-none',
                      )}
                      style={{
                        color: isActive ? 'var(--text-primary)' : isPast ? 'var(--text-secondary)' : 'var(--text-secondary)',
                        opacity: isActive ? 1 : isPast ? 0.45 : 0.55,
                        borderLeft: '3px solid transparent',
                        fontSize: isActive ? '1.45em' : '0.9em',
                        fontWeight: isActive ? 700 : 400,
                        lineHeight: isActive ? 1.7 : 1.5,
                        padding: isActive ? '14px 28px' : '12px 28px',
                        boxShadow: isActive ? '0 0 30px var(--glow-color)' : 'none',
                        background: isActive ? 'var(--glass-bg)' : 'transparent',
                        backdropFilter: isActive ? 'blur(8px)' : 'none',
                        WebkitBackdropFilter: isActive ? 'blur(8px)' : 'none',
                        borderRadius: isActive ? '6px' : '0',
                        transformOrigin: 'left center',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      }}
                    >
                      {line.text}
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── MV Overlay ── */}
      <AnimatePresence>
        {mvMode && (
          <motion.div className="absolute inset-0 z-20 overflow-hidden"
            style={{ background: '#000' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 0.3, delay: 0.15 }}
            onMouseEnter={handleMvMouseMove}
            onMouseLeave={() => { setMvHover(false); setShowProgress(false); }}>
            {/* Video — memoized, preloaded, brightness filter instead of overlay div */}
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"
              src="/Running%20in%20The%20Dark.mp4" muted playsInline preload="auto"
              style={{ filter: 'brightness(0.7)' }}
              onEnded={() => { videoEndThreshold.current = currentTime; setMvMode(false); }}
              onTimeUpdate={() => { /* keep in sync with player */ }} />

            {/* Glass card — bottom-left, auto-hide on inactivity */}
            <motion.div className="absolute bottom-6 left-6 flex items-center gap-4 cursor-pointer rounded-lg overflow-hidden"
              onClick={() => setMvMode(false)}
              style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              animate={{ opacity: mvHover ? 1 : 0 }}
              transition={{ duration: 0.6 }}>
              <motion.div className="flex-shrink-0"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <CoverPlaceholder name={currentSong?.title ?? ''} size="md" className="w-14 h-14 rounded-none" />
              </motion.div>
              <div className="pr-4 py-2">
                <p className="font-ui text-sm font-bold text-white/90 truncate max-w-[140px]">{currentSong?.title ?? ''}</p>
                <p className="font-mono text-[10px] tracking-wider uppercase text-white/60 truncate max-w-[140px]">{currentSong?.artist ?? ''}</p>
              </div>
            </motion.div>

            {/* Pill-shaped progress bar — centered, auto-hide */}
            <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 400, width: '60%', minWidth: 200 }}
              animate={{ opacity: showProgress ? 1 : 0, y: showProgress ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setShowProgress(true)}
              onMouseLeave={() => { progressTimer.current = setTimeout(() => setShowProgress(false), 500); }}>
              <div className="px-4 py-2.5">
                <div ref={mvProgressRef} className="w-full h-1 relative cursor-pointer" onClick={handleMvProgressClick}>
                  <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, #ffffff, var(--accent))` }} />
                  {progress > 0 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md"
                      style={{ left: `${progress * 100}%`, marginLeft: '-4px' }} />
                  )}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="font-mono text-[10px] tabular-nums text-white/60">{format(currentTime)}</span>
                  <span className="font-mono text-[10px] tabular-nums text-white/60">{format(duration)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
