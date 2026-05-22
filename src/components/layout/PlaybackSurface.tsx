import { useUIStore } from '../../stores/uiStore';
import { LyricsPage } from '../../pages/LyricsPage';

export function PlaybackSurface() {
  const { playbackMode } = useUIStore();

  switch (playbackMode) {
    case 'lyrics':
      return <LyricsPage />;
    case 'mv':
      return <div className="flex-1 flex items-center justify-center font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>MV MODE</div>;
    case 'hud':
      return <div className="flex-1 flex items-center justify-center font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>HUD MODE</div>;
  }
}
