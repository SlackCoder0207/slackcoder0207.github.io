import { create } from 'zustand';
import type { DataView, PlaybackMode, Song } from '../types';

export type SubView =
  | null
  | { type: 'album'; album: string; songs: Song[] }
  | { type: 'artist'; artist: string; songs: Song[] }
  | { type: 'songDetail'; song: Song };

interface UIState {
  dataView: DataView;
  playbackMode: PlaybackMode;
  sidebarExpanded: boolean;
  subView: SubView;
  setDataView: (view: DataView) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  toggleSidebar: () => void;
  setSubView: (sub: SubView) => void;
  clearSubView: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  dataView: 'library',
  playbackMode: 'lyrics',
  sidebarExpanded: true,
  subView: null,
  setDataView: (dataView) => set({ dataView, subView: null }),
  setPlaybackMode: (playbackMode) => set({ playbackMode }),
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setSubView: (subView) => set({ subView }),
  clearSubView: () => set({ subView: null }),
}));
