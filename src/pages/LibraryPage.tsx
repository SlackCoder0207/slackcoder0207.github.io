import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SystemTag } from '../components/ui/SystemTag';
import { ArtistLink } from '../components/ui/ArtistLink';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import { useUIStore } from '../stores/uiStore';
import { demoSongs } from '../data/demoSongs';
import { cn } from '../utils/cn';
import type { Song } from '../types';

export function LibraryPage() {
  const { currentSong, playSong } = usePlayerStore();
  const { playlists, createPlaylist, addToPlaylist, toggleLike, isLiked } = usePlaylistStore();
  const { setSubView } = useUIStore();
  const [pickerSong, setPickerSong] = useState<Song | null>(null);
  const [newListName, setNewListName] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerSong) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerSong(null);
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [pickerSong]);

  const handleAddToPlaylist = (song: Song) => { setPickerSong(song); setNewListName(''); };

  const handleCreateAndAdd = () => {
    if (!newListName.trim() || !pickerSong) return;
    createPlaylist(newListName.trim());
    const newList = usePlaylistStore.getState().playlists;
    const created = newList[newList.length - 1];
    if (created) addToPlaylist(created.id, pickerSong);
    setNewListName('');
    setPickerSong(null);
  };

  const getAlbumSongs = (album: string) => demoSongs.filter((s) => s.album === album);

  return (
    <div className="space-y-6">
      <SectionHeader subtitle={`${demoSongs.length} RECORDS`}>AUDIO LIBRARY</SectionHeader>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_130px_120px_auto_90px] gap-2 px-4 py-2 border-b font-mono text-[10px] tracking-wider uppercase"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <span>RECORD ID / TITLE</span>
          <span>ARTIST</span>
          <span>ALBUM</span>
          <span>DURATION</span>
          <span className="text-center">ACTIONS</span>
        </div>

        {/* Rows */}
        {demoSongs.map((track, idx) => {
          const isActive = currentSong?.id === track.id;
          const liked = isLiked(track.id);
          const rowStyle = { borderColor: 'var(--border)', background: isActive ? 'var(--accent)' : 'transparent' } as const;
          return (
            <div key={track.id} className="grid grid-cols-[1fr_130px_120px_auto_90px] gap-2 px-4 py-2 border-b transition-all duration-200 items-center" style={rowStyle}>
              {/* Title — click for song detail */}
              <button onClick={() => setSubView({ type: 'songDetail', song: track })}
                className="flex items-center gap-3 min-w-0 text-left"
                style={{ color: isActive ? '#fff' : undefined }}>
                <SystemTag>{track.id}</SystemTag>
                <span className="font-ui text-sm truncate" style={{ color: isActive ? '#fff' : 'var(--text-primary)' }}>{track.title}</span>
              </button>

              {/* Artist — supports multi-artist dropdown */}
              <ArtistLink artist={track.artist} isActive={isActive} />

              {/* Album — click for album view */}
              {track.album ? (
                <button onClick={() => setSubView({ type: 'album', album: track.album!, songs: getAlbumSongs(track.album!) })}
                  className="font-mono text-[10px] tracking-wider truncate transition-all duration-200 hover:text-[var(--accent)] text-left max-w-[100px]"
                  style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>
                  {track.album}
                </button>
              ) : (
                <span className="font-mono text-[10px]" style={{ color: isActive ? 'rgba(255,255,255,0.3)' : 'var(--text-secondary)' }}>—</span>
              )}

              {/* Duration */}
              <span className="font-mono text-xs tabular-nums" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                {/* Play */}
                <button onClick={() => playSong(demoSongs, idx)}
                  className="font-mono text-xs transition-all duration-200 hover:scale-110 px-1"
                  style={{ color: isActive ? '#fff' : 'var(--accent)' }}>▶</button>
                {/* Like */}
                <button onClick={() => toggleLike(track.id)}
                  className={cn('font-mono text-xs transition-all duration-200 hover:scale-110 px-1', liked ? 'opacity-100' : 'opacity-40 hover:opacity-80')}
                  style={{ color: liked ? 'var(--highlight)' : isActive ? '#fff' : 'var(--text-secondary)' }}>
                  {liked ? '♥' : '♡'}
                </button>
                {/* Add to playlist */}
                <button onClick={() => handleAddToPlaylist(track)}
                  className="font-mono text-xs opacity-40 hover:opacity-80 transition-all duration-200 hover:scale-110 px-1"
                  style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }}>+</button>
                {/* Download */}
                <button className="font-mono text-xs opacity-40 hover:opacity-80 transition-all duration-200 hover:scale-110 px-1"
                  style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }} onClick={() => {}}>↓</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Playlist picker */}
      <AnimatePresence>
        {pickerSong && (
          <motion.div ref={pickerRef} className="fixed z-50 bevel-sm border p-3 shadow-lg"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: 240 }}
            initial={{ opacity: 0, scale: 0.92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            <p className="font-mono text-xs tracking-wider uppercase mb-3" style={{ color: 'var(--text-primary)' }}>ADD TO PLAYLIST</p>
            {playlists.length === 0 && <p className="font-mono text-[10px] mb-2" style={{ color: 'var(--text-secondary)' }}>NO PLAYLISTS YET</p>}
            <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
              {playlists.map((p) => (
                <button key={p.id} onClick={() => { addToPlaylist(p.id, pickerSong!); setPickerSong(null); }}
                  className="w-full text-left px-2 py-1.5 font-mono text-xs hover:bg-[var(--bg-secondary)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}>
                  {p.name} <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>({p.songs.length})</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)}
                placeholder="NEW PLAYLIST NAME..." className="flex-1 bevel-sm px-2 py-1.5 font-mono text-[10px] border outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()} />
              <button onClick={handleCreateAndAdd} className="bevel-sm px-2 py-1.5 font-mono text-[10px] border"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>+ NEW</button>
            </div>
            <button onClick={() => setPickerSong(null)} className="mt-2 font-mono text-[10px] opacity-50 hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}>CANCEL</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
