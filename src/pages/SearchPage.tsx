import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SystemTag } from '../components/ui/SystemTag';
import { ArtistLink } from '../components/ui/ArtistLink';
import { usePlayerStore } from '../stores/playerStore';
import { useUIStore } from '../stores/uiStore';
import { demoSongs } from '../data/demoSongs';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { currentSong, playSong } = usePlayerStore();
  const { setSubView } = useUIStore();

  const results = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return demoSongs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || (s.album?.toLowerCase().includes(q) ?? false)
    );
  }, [query]);

  const allResults = query.length > 1 && results.length === 0 ? demoSongs : results;
  const getAlbumSongs = (album: string) => demoSongs.filter((s) => s.album === album);

  return (
    <div className="space-y-6">
      <SectionHeader subtitle="DATABASE QUERY">DATA SEARCH</SectionHeader>

      {/* Search input */}
      <div className="bevel-sm border flex items-center px-4 py-2.5" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <span className="font-mono text-xs mr-3" style={{ color: 'var(--text-secondary)' }}>&gt;</span>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH RECORDS..."
          className="flex-1 bg-transparent border-none outline-none font-mono text-sm tracking-wider uppercase placeholder:opacity-30"
          style={{ color: 'var(--text-primary)' }} />
      </div>

      {/* Results — matching Library grid layout */}
      {query.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_130px_120px_auto_90px] gap-2 px-4 py-2 border-b font-mono text-[10px] tracking-wider uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <span>RECORD ID / TITLE</span>
            <span>ARTIST</span>
            <span>ALBUM</span>
            <span>DUR</span>
            <span className="text-center">ACT</span>
          </div>
          <AnimatePresence mode="popLayout">
            {allResults.length === 0 ? (
              <motion.p key="empty" className="font-mono text-xs tracking-wider px-4 py-4" style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>NO RESULTS FOUND</motion.p>
            ) : (
              allResults.map((r, idx) => {
                const isActive = currentSong?.id === r.id;
                const rowStyle = { borderColor: 'var(--border)', background: isActive ? 'var(--accent)' : 'transparent' } as const;
                return (
                  <motion.div key={r.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                    className="grid grid-cols-[1fr_130px_120px_auto_90px] gap-2 px-4 py-2 border-b items-center" style={rowStyle}>
                    {/* Title */}
                    <button onClick={() => setSubView({ type: 'songDetail', song: r })}
                      className="flex items-center gap-3 min-w-0 text-left" style={{ color: isActive ? '#fff' : undefined }}>
                      <SystemTag>{r.id}</SystemTag>
                      <span className="font-ui text-sm truncate" style={{ color: isActive ? '#fff' : 'var(--text-primary)' }}>{r.title}</span>
                    </button>
                    {/* Artist */}
                    <ArtistLink artist={r.artist} isActive={isActive} />
                    {/* Album */}
                    {r.album ? (
                      <button onClick={() => setSubView({ type: 'album', album: r.album!, songs: getAlbumSongs(r.album!) })}
                        className="font-mono text-[10px] tracking-wider truncate text-left transition-all duration-200 hover:text-[var(--accent)]"
                        style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>{r.album}</button>
                    ) : (
                      <span style={{ color: isActive ? 'rgba(255,255,255,0.3)' : 'var(--text-secondary)' }}>—</span>
                    )}
                    {/* Duration */}
                    <span className="font-mono text-xs tabular-nums" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                      {Math.floor(r.duration / 60)}:{String(r.duration % 60).padStart(2, '0')}
                    </span>
                    {/* Act: Play */}
                    <div className="flex justify-center">
                      <button onClick={() => playSong(demoSongs, idx)}
                        className="font-mono text-xs transition-all duration-200 hover:scale-110"
                        style={{ color: isActive ? '#fff' : 'var(--accent)' }}>▶</button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
