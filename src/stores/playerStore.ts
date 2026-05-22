import { create } from 'zustand';
import type { PlayerStatus, PlayMode, Song } from '../types';

interface PlayerState {
  status: PlayerStatus;
  currentSong: Song | null;
  queue: Song[];
  originalQueue: Song[];
  queueIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  analyserData: Uint8Array | null;
  fullscreenLyrics: boolean;
  showPlaylist: boolean;

  setStatus: (status: PlayerStatus) => void;
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  playSong: (songs: Song[], index: number) => void;
  next: () => void;
  prev: () => void;
  playAtQueueIndex: (idx: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  setPlayMode: (m: PlayMode) => void;
  setAnalyserData: (d: Uint8Array | null) => void;
  setFullscreenLyrics: (v: boolean) => void;
  setShowPlaylist: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  status: 'idle',
  currentSong: null,
  queue: [],
  originalQueue: [],
  queueIndex: -1,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  playMode: 'sequential',
  analyserData: null,
  fullscreenLyrics: false,
  showPlaylist: false,

  setStatus: (status) => set({ status }),
  setCurrentSong: (currentSong) => set({ currentSong }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setAnalyserData: (analyserData) => set({ analyserData }),
  setFullscreenLyrics: (fullscreenLyrics) => set({ fullscreenLyrics }),
  setShowPlaylist: (showPlaylist) => set({ showPlaylist }),

  setQueue: (songs, startIndex = 0) =>
    set({ queue: songs, originalQueue: [...songs], queueIndex: startIndex }),

  setPlayMode: (playMode) => {
    const { originalQueue, queue } = get();
    // Restore original order when leaving shuffle
    if (playMode !== 'shuffle') {
      const curId = queue[get().queueIndex]?.id;
      const restoredIdx = originalQueue.findIndex((s) => s.id === curId);
      set({ playMode, queue: [...originalQueue], queueIndex: Math.max(0, restoredIdx) });
    } else {
      // Enter shuffle: randomize queue order
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      const curId = queue[get().queueIndex]?.id;
      const newIdx = shuffled.findIndex((s) => s.id === curId);
      set({ playMode, queue: shuffled, queueIndex: Math.max(0, newIdx) });
    }
  },

  playSong: (songs, index) => {
    const song = songs[index];
    if (!song) return;
    set({
      queue: songs,
      originalQueue: [...songs],
      queueIndex: index,
      currentSong: song,
      status: 'playing',
      currentTime: 0,
      duration: song.duration,
      analyserData: null,
    });
  },

  next: () => {
    const { queue, queueIndex, playMode } = get();
    if (queue.length === 0) return;
    let nextIdx: number;
    switch (playMode) {
      case 'repeat-one': nextIdx = queueIndex; break;
      case 'shuffle': nextIdx = Math.floor(Math.random() * queue.length); break;
      case 'repeat-list': nextIdx = (queueIndex + 1) % queue.length; break;
      default: nextIdx = Math.min(queueIndex + 1, queue.length - 1);
    }
    const song = queue[nextIdx];
    if (song) {
      set({ queueIndex: nextIdx, currentSong: song, status: 'playing', currentTime: 0, duration: song.duration });
    }
  },

  prev: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const prevIdx = queueIndex > 0 ? queueIndex - 1 : 0;
    const song = queue[prevIdx];
    if (song) {
      set({ queueIndex: prevIdx, currentSong: song, status: 'playing', currentTime: 0, duration: song.duration });
    }
  },

  playAtQueueIndex: (idx: number) => {
    const { queue } = get();
    const song = queue[idx];
    if (song) {
      set({ queueIndex: idx, currentSong: song, status: 'playing', currentTime: 0, duration: song.duration });
    }
  },
}));
