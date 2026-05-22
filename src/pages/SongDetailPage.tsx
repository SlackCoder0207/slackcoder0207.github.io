import { useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';
import { usePlayerStore } from '../stores/playerStore';
import { demoSongs } from '../data/demoSongs';
import { CoverPlaceholder } from '../components/ui/CoverPlaceholder';
import { ArtistLink } from '../components/ui/ArtistLink';

const demoComments = [
  { user: 'DR. 巴别塔的善灵', text: '这首曲子让我想起了在萨尔贡的沙漠夜晚，星光洒落如同细语。', time: '2 days ago' },
  { user: 'AMYA', text: '罗德岛战术指挥部的推荐曲目，任务前听一曲能提升集中力。', time: '1 week ago' },
  { user: 'W', text: '爆炸般的节奏，我喜欢。', time: '2 weeks ago' },
];

export function SongDetailPage() {
  const { subView, clearSubView, setSubView } = useUIStore();
  const { playSong } = usePlayerStore();

  // Hooks must be BEFORE early return
  const similarSongs = useMemo(() => {
    if (!subView || subView.type !== 'songDetail') return [];
    const song = subView.song;
    const sameAlbum = song.album ? demoSongs.filter((s) => s.album === song.album && s.id !== song.id) : [];
    if (sameAlbum.length > 0) return sameAlbum;
    return demoSongs.filter((s) => s.id !== song.id).slice(0, 3);
  }, [subView]);

  if (!subView || subView.type !== 'songDetail') return null;
  const song = subView.song;
  const realIdx = demoSongs.indexOf(song);

  const albumSongs = song.album
    ? demoSongs.filter((s) => s.album === song.album)
    : [];

  const getAlbumSongs = (album: string) => demoSongs.filter((s) => s.album === album);

  return (
    <div className="space-y-6">
      <button onClick={clearSubView}
        className="font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:text-[var(--accent)]"
        style={{ color: 'var(--text-primary)' }}>
        ← BACK
      </button>

      {/* Cover row */}
      <div className="flex gap-5">
        <CoverPlaceholder name={song.title} size="lg" className="w-24 flex-shrink-0" />
        <div className="flex flex-col justify-center min-w-0">
          <p className="font-ui text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{song.title}</p>
          <div className="mt-0.5">
            <ArtistLink artist={song.artist} />
          </div>
          {song.album && (
            <button onClick={() => setSubView({ type: 'album', album: song.album!, songs: getAlbumSongs(song.album!) })}
              className="font-mono text-[10px] tracking-wider uppercase hover:text-[var(--accent)] transition-colors text-left mt-0.5"
              style={{ color: 'var(--text-secondary)' }}>
              {song.album}
            </button>
          )}
          <p className="font-mono text-[10px] tracking-wider uppercase mt-1" style={{ color: 'var(--text-secondary)' }}>
            {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')} · {song.id}
          </p>
        </div>
      </div>

      {/* Play button */}
      <button onClick={() => playSong(demoSongs, realIdx >= 0 ? realIdx : 0)}
        className="bevel-sm w-full py-2.5 font-mono text-xs tracking-wider uppercase border transition-all duration-200 hover:brightness-110"
        style={{ borderColor: 'var(--accent)', color: 'var(--bg-primary)', background: 'var(--accent)' }}>
        PLAY TRACK
      </button>

      {/* Album tracks */}
      {albumSongs.length > 1 && (
        <div className="space-y-1">
          <p className="font-mono text-[10px] tracking-wider uppercase px-1" style={{ color: 'var(--text-secondary)' }}>
            FROM &ldquo;{song.album}&rdquo;
          </p>
          <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-2 border-b font-mono text-[10px] tracking-wider uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <span>TRACKS</span>
            <span>DURATION</span>
          </div>
          {albumSongs.map((s, i) => {
            const idx = demoSongs.indexOf(s);
            return (
              <button key={s.id} onClick={() => playSong(demoSongs, idx >= 0 ? idx : i)}
                className="w-full text-left grid grid-cols-[1fr_auto] gap-3 px-4 py-2 border-b transition-all duration-200"
                style={{
                  borderColor: 'var(--border)',
                  background: s.id === song.id ? 'var(--accent)' : 'transparent',
                  color: s.id === song.id ? '#fff' : undefined,
                }}>
                <span className="font-ui text-sm" style={{ color: s.id === song.id ? '#fff' : 'var(--text-primary)' }}>{s.title}</span>
                <span className="font-mono text-xs tabular-nums" style={{ color: s.id === song.id ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                  {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Similar songs — with cover thumbnails */}
      {similarSongs.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[10px] tracking-wider uppercase px-1" style={{ color: 'var(--text-secondary)' }}>
            RECOMMENDED
          </p>
          <div className="flex flex-wrap gap-3">
            {similarSongs.map((s) => (
                <button key={s.id} onClick={() => setSubView({ type: 'songDetail', song: s })}
                  className="bevel-sm border text-left transition-all duration-200 hover:border-[var(--accent)] overflow-hidden"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', width: 140 }}>
                  <div className="w-full aspect-square">
                    <CoverPlaceholder name={s.title} size="sm" className="w-full h-full" />
                  </div>
                  <div className="p-2">
                    <p className="font-ui text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    <p className="font-mono text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{s.artist}</p>
                  </div>
                </button>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3 pt-2">
        <p className="font-mono text-[10px] tracking-wider uppercase px-1" style={{ color: 'var(--text-secondary)' }}>
          COMMENTS
        </p>
        {demoComments.map((c, i) => (
          <div key={i} className="px-3 py-2.5 border-l-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="font-ui text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.user}</span>
              <span className="font-mono text-[9px] ml-auto" style={{ color: 'var(--text-secondary)' }}>{c.time}</span>
            </div>
            <p className="font-ui text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
