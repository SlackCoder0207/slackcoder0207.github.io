import { usePlayerStore } from '../stores/playerStore';
import { useUIStore } from '../stores/uiStore';
import { demoSongs } from '../data/demoSongs';
import { CoverPlaceholder } from '../components/ui/CoverPlaceholder';
import { cn } from '../utils/cn';

interface Props {
  type: 'album' | 'artist';
  name: string;
  songs: typeof demoSongs;
}

export function AlbumArtistView({ type, name, songs }: Props) {
  const { currentSong, playSong } = usePlayerStore();
  const { clearSubView } = useUIStore();
  const label = type === 'album' ? 'ALBUM' : 'ARTIST';

  return (
    <div className="space-y-6">
      <button onClick={clearSubView}
        className="font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:text-[var(--accent)]"
        style={{ color: 'var(--text-primary)' }}>
        ← BACK
      </button>

      {/* Cover row: small cover + info to the right */}
      <div className="flex gap-5">
        <CoverPlaceholder name={name} size="lg" className="w-24 flex-shrink-0" />
        <div className="flex flex-col justify-center min-w-0">
          <p className="font-ui text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
          <p className="font-mono text-xs tracking-wider uppercase mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {label} · {songs.length} TRACKS
          </p>
          <p className="font-mono text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            TOTAL · {formatTotal(songs.reduce((sum, s) => sum + s.duration, 0))}
          </p>
        </div>
      </div>

      {/* Play All */}
      <button onClick={() => playSong(songs, 0)}
        className="bevel-sm w-full py-2.5 font-mono text-xs tracking-wider uppercase border transition-all duration-200 hover:brightness-110"
        style={{ borderColor: 'var(--accent)', color: 'var(--bg-primary)', background: 'var(--accent)' }}>
        ▶ PLAY ALL · {songs.length} TRACKS
      </button>

      {/* Track listing */}
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2 border-b font-mono text-[10px] tracking-wider uppercase"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <span>TRACKS</span>
          <span>DURATION</span>
        </div>

        {songs.map((track, idx) => {
          const isActive = currentSong?.id === track.id;
          const realIdx = demoSongs.indexOf(track);
          return (
            <button key={track.id} onClick={() => playSong(demoSongs, realIdx >= 0 ? realIdx : idx)}
              className={cn('w-full text-left grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 border-b transition-all duration-200')}
              style={{ borderColor: 'var(--border)', background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? '#fff' : undefined }}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[10px]" style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="font-ui text-sm truncate" style={{ color: isActive ? '#fff' : 'var(--text-primary)' }}>{track.title}</span>
                {type === 'artist' && track.album && (
                  <span className="font-mono text-[10px] tracking-wider truncate hidden sm:inline" style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>
                    · {track.album}
                  </span>
                )}
              </div>
              <span className="font-mono text-xs tabular-nums self-center" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatTotal(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
