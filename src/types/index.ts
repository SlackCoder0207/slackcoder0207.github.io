/* ===== Song / Track ===== */
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // seconds
  coverUrl?: string;
  audioUrl?: string;
  lrcUrl?: string;
  lrcText?: string;
}

/* ===== Playlist ===== */
export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

/* ===== Player State ===== */
export type PlayerStatus =
  | 'idle'
  | 'loading'
  | 'buffering'
  | 'playing'
  | 'paused'
  | 'ended';

export type PlayMode = 'sequential' | 'repeat-one' | 'shuffle' | 'repeat-list';

/* ===== App Views ===== */
export type AppView = 'launch' | 'login' | 'main';

export type DataView = 'library' | 'search' | 'collection' | 'playlist' | 'history' | 'settings';

export type PlaybackMode = 'lyrics' | 'mv' | 'hud';

/* ===== Netease ===== */
export interface NeteaseUser {
  uid: number;
  nickname: string;
  avatarUrl: string;
  isLogin: boolean;
}
