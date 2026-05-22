import { create } from 'zustand';
import type { AppView } from '../types';

const STORAGE_KEY = 'riat-state';

function loadPersisted(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return {
      view: data.view === 'main' ? 'main' : 'launch',
      doctorId: data.doctorId || '巴别塔的善灵',
      mainRevealed: data.view === 'main',
    };
  } catch {
    return {};
  }
}

interface AppState {
  view: AppView;
  mainRevealed: boolean;
  doctorId: string;
  setView: (view: AppView) => void;
  setMainRevealed: (v: boolean) => void;
  setDoctorId: (id: string) => void;
}

const persisted = loadPersisted();

export const useAppStore = create<AppState>((set) => ({
  view: persisted.view ?? 'launch',
  mainRevealed: persisted.mainRevealed ?? false,
  doctorId: persisted.doctorId ?? '巴别塔的善灵',
  setView: (view) => {
    set({ view, mainRevealed: view !== 'main' ? false : false });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ view, doctorId: useAppStore.getState().doctorId }));
    } catch {}
  },
  setMainRevealed: (mainRevealed) => set({ mainRevealed }),
  setDoctorId: (doctorId) => set({ doctorId }),
}));
