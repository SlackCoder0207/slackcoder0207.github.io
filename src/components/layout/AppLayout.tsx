import { type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomPlayer } from './BottomPlayer';
import { FullscreenLyrics } from './FullscreenLyrics';
import { NoiseLayer } from '../ui/NoiseLayer';
import { ScanEffect } from '../effects/ScanEffect';
import { usePlayerStore } from '../../stores/playerStore';
import { useAppStore } from '../../stores/appStore';

interface AppLayoutProps {
  dataSurface: ReactNode;
  playbackSurface: ReactNode;
}

export function AppLayout({ dataSurface, playbackSurface }: AppLayoutProps) {
  const fullscreenLyrics = usePlayerStore((s) => s.fullscreenLyrics);
  const mainRevealed = useAppStore((s) => s.mainRevealed);

  return (
    <div className="h-full flex flex-col">
      <NoiseLayer />
      <ScanEffect />
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main
          className="flex-1 overflow-y-auto p-6 transition-all duration-500"
          style={{
            borderLeft: '1px solid var(--border)',
            opacity: mainRevealed ? 1 : 0,
            transform: mainRevealed ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {dataSurface}
        </main>

        <aside
          className="w-80 overflow-y-auto border-l p-4 transition-all duration-500"
          style={{
            borderColor: 'var(--border)',
            opacity: mainRevealed ? 1 : 0,
            transform: mainRevealed ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: mainRevealed ? '0.1s' : '0s',
          }}
        >
          {playbackSurface}
        </aside>
      </div>

      <div
        className="transition-all duration-500"
        style={{
          opacity: mainRevealed ? 1 : 0,
          transform: mainRevealed ? 'translateY(0)' : 'translateY(8px)',
          transitionDelay: mainRevealed ? '0.2s' : '0s',
        }}
      >
        <BottomPlayer />
      </div>

      <AnimatePresence>
        {fullscreenLyrics && <FullscreenLyrics />}
      </AnimatePresence>
    </div>
  );
}
