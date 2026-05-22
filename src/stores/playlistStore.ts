import { create } from 'zustand';
import type { Song } from '../types';

export interface PlaylistData {
  id: string;
  name: string;
  description: string;
  creator: string;
  songs: Song[];
  createdAt: number;
}

interface PlaylistState {
  playlists: PlaylistData[];
  likedIds: Set<string>;
  createPlaylist: (name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  likedIds: new Set(),

  createPlaylist: (name, description = '') => {
    const newList: PlaylistData = {
      id: `PL-${Date.now()}`,
      name,
      description,
      creator: 'DOCTOR',
      songs: [],
      createdAt: Date.now(),
    };
    set((s) => ({ playlists: [...s.playlists, newList] }));
  },

  addToPlaylist: (playlistId, song) => {
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.some((x) => x.id === song.id) ? p.songs : [...p.songs, song] }
          : p
      ),
    }));
  },

  removeFromPlaylist: (playlistId, songId) => {
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId ? { ...p, songs: p.songs.filter((x) => x.id !== songId) } : p
      ),
    }));
  },

  toggleLike: (songId) => {
    set((s) => {
      const next = new Set(s.likedIds);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return { likedIds: next };
    });
  },

  isLiked: (songId) => get().likedIds.has(songId),
}));
