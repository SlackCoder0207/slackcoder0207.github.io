import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { LibraryPage } from '../../pages/LibraryPage';
import { SearchPage } from '../../pages/SearchPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { CollectionPage } from '../../pages/CollectionPage';
import { PlaylistPage } from '../../pages/PlaylistPage';
import { HistoryPage } from '../../pages/HistoryPage';
import { AlbumArtistView } from '../../pages/AlbumArtistView';
import { SongDetailPage } from '../../pages/SongDetailPage';

const pages: Record<string, React.ReactNode> = {
  library: <LibraryPage />,
  search: <SearchPage />,
  collection: <CollectionPage />,
  playlist: <PlaylistPage />,
  history: <HistoryPage />,
  settings: <SettingsPage />,
};

export function DataSurface() {
  const { dataView, subView } = useUIStore();

  return (
    <AnimatePresence mode="wait">
      {subView?.type === 'album' ? (
        <motion.div key="album" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          <AlbumArtistView type="album" name={subView.album} songs={subView.songs} />
        </motion.div>
      ) : subView?.type === 'artist' ? (
        <motion.div key="artist" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          <AlbumArtistView type="artist" name={subView.artist} songs={subView.songs} />
        </motion.div>
      ) : subView?.type === 'songDetail' ? (
        <motion.div key={`song-${subView.song.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          <SongDetailPage />
        </motion.div>
      ) : (
        <motion.div key={dataView} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          {pages[dataView]}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
