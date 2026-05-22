/**
 * Monster Siren Records API service.
 *
 * In development, requests are proxied via Vite (vite.config.ts → /siren-api/*).
 * In production, this can be replaced with a Cloudflare Worker or similar.
 *
 * Falls back to bundled static data if the API is unavailable.
 */
import type { SirenApiResponse, SirenAlbum, SirenAlbumDetail, SirenSong } from './sirenTypes';
import { mapSirenToSong, mapSirenAlbumToSongs } from './dataMapper';
import type { Song } from '../types';

const API_BASE = '/siren-api';
const STATIC_FALLBACK = '/data/siren-songs.json';

async function fetchJson<T>(path: string): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`);
  if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`);
  return resp.json();
}

export async function fetchAlbums(): Promise<SirenAlbum[]> {
  const res = await fetchJson<SirenApiResponse<SirenAlbum[]>>('/albums');
  return res.data;
}

export async function fetchAlbumDetail(id: string): Promise<SirenAlbumDetail> {
  const res = await fetchJson<SirenApiResponse<SirenAlbumDetail>>(`/album/${id}/detail`);
  return res.data;
}

export async function fetchSong(id: string): Promise<SirenSong> {
  const res = await fetchJson<SirenApiResponse<SirenSong>>(`/song/${id}`);
  return res.data;
}

export async function fetchAllSongs(): Promise<Song[]> {
  try {
    const albums = await fetchAlbums();
    const all: Song[] = [];
    for (const album of albums) {
      try {
        const detail = await fetchAlbumDetail(album.cid);
        all.push(...mapSirenAlbumToSongs(detail));
      } catch {
        // skip failed albums
      }
    }
    return all;
  } catch {
    // Fallback to static data
    const resp = await fetch(STATIC_FALLBACK);
    if (!resp.ok) return [];
    return resp.json();
  }
}

export async function searchSongs(keyword: string): Promise<Song[]> {
  try {
    const res = await fetchJson<SirenApiResponse<{ albums: SirenAlbum[]; songs: SirenSong[] }>>(
      `/search?keyword=${encodeURIComponent(keyword)}`
    );
    const songs: Song[] = [];
    for (const s of res.data.songs || []) {
      songs.push(mapSirenToSong(s));
    }
    return songs;
  } catch {
    return [];
  }
}
