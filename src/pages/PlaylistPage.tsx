import { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CoverPlaceholder } from '../components/ui/CoverPlaceholder';
import { usePlaylistStore } from '../stores/playlistStore';
import { usePlayerStore } from '../stores/playerStore';

export function PlaylistPage() {
  const { playlists, removeFromPlaylist } = usePlaylistStore();
  const { currentSong, playSong } = usePlayerStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (playlists.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader subtitle="0 PLAYLISTS">
          PLAYLISTS
        </SectionHeader>
        <p className="font-mono text-xs italic" style={{ color: 'var(--text-secondary)' }}>
          NO PLAYLISTS CREATED
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader subtitle={`${playlists.length} PLAYLISTS`}>
        PLAYLISTS
      </SectionHeader>

      <div className="space-y-4">
        {playlists.map((pl) => {
          const isExpanded = expandedId === pl.id;
          return (
            <div key={pl.id} className="border bevel" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              {/* Playlist header - clickable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : pl.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-ui text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {pl.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                      {pl.creator}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      {pl.songs.length} TRACKS
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs transition-transform duration-200" style={{ color: 'var(--text-secondary)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  ›
                </span>
              </button>

              {/* Expanded playlist detail */}
              {isExpanded && (
                <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                  {/* Cover + info */}
                  <div className="flex items-start gap-4 pb-3">
                    <CoverPlaceholder name={pl.name} size="lg" className="w-20 flex-shrink-0" />
                    <div className="pt-1">
                      <p className="font-ui text-base font-bold" style={{ color: 'var(--text-primary)' }}>{pl.name}</p>
                      <p className="font-mono text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'var(--text-secondary)' }}>{pl.creator}</p>
                      <p className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>{pl.songs.length} TRACKS</p>
                      {pl.description && (
                        <p className="font-mono text-[10px] italic mt-1" style={{ color: 'var(--text-secondary)' }}>{pl.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="h-px" style={{ background: 'var(--border)' }} />

                  {pl.songs.length === 0 ? (
                    <p className="font-mono text-[10px] px-2 py-2" style={{ color: 'var(--text-secondary)' }}>
                      EMPTY PLAYLIST
                    </p>
                  ) : (
                    pl.songs.map((song, idx) => {
                      const isActive = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 items-center"
                          style={{ background: isActive ? 'var(--accent)' : 'transparent' }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px]" style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>
                              {String(idx + 1).padStart(2, '0')}.
                            </span>
                            <button
                              onClick={() => playSong(pl.songs, idx)}
                              className="text-left min-w-0"
                            >
                              <span className="font-ui text-sm truncate block" style={{ color: isActive ? '#fff' : 'var(--text-primary)' }}>
                                {song.title}
                              </span>
                              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>
                                {song.artist}
                              </span>
                            </button>
                          </div>
                          <span className="font-mono text-xs tabular-nums" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                            {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                          </span>
                          <button
                            onClick={() => removeFromPlaylist(pl.id, song.id)}
                            className="font-mono text-xs opacity-30 hover:opacity-80 transition-opacity"
                            style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
