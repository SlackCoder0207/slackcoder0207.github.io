import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './stores/appStore';
import { useTheme } from './themes/ThemeProvider';
import { usePlayerStore } from './stores/playerStore';
import { LoginLaunchPage } from './pages/LoginLaunchPage';
import { AppLayout } from './components/layout/AppLayout';
import { DataSurface } from './components/layout/DataSurface';
import { PlaybackSurface } from './components/layout/PlaybackSurface';

export default function App() {
  const { view, setView, setMainRevealed } = useAppStore();
  useTheme();

  const handleLaunchComplete = () => {
    setView('main');
    setTimeout(() => setMainRevealed(true), 100);
  };

  useEffect(() => {
    if (view !== 'main') {
      usePlayerStore.getState().setFullscreenLyrics(false);
    }
  }, [view]);

  return (
    <AnimatePresence mode="wait">
      {view === 'launch' ? (
        <motion.div key="launch" className="h-full"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}>
          <LoginLaunchPage onComplete={handleLaunchComplete} />
        </motion.div>
      ) : (
        <motion.div key="main" className="h-full"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}>
          <AppLayout
            dataSurface={<DataSurface />}
            playbackSurface={<PlaybackSurface />}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
