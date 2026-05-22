/**
 * Maps Monster Siren Records API responses to internal Song/Album types.
 */
import type { Song as AppSong } from '../types';
import type { SirenAlbum, SirenSong, SirenAlbumDetail } from './sirenTypes';

export function mapSirenToSong(song: SirenSong, album?: SirenAlbum): AppSong {
  const artistName = song.artist
    ?? song.artists?.map((a) => a.name).join(' / ')
    ?? album?.artist
    ?? album?.artists?.map((a) => a.name).join(' / ')
    ?? 'Unknown';

  return {
    id: song.cid,
    title: song.name,
    artist: artistName,
    album: song.albumName ?? album?.name,
    duration: song.duration ?? 0,
    coverUrl: song.cover ?? album?.coverUrl,
    audioUrl: song.sourceUrl,
    lrcUrl: song.lyricUrl,
    lrcText: song.lyric,
  };
}

export function mapSirenAlbumToSongs(detail: SirenAlbumDetail): AppSong[] {
  return detail.songs.map((s) => mapSirenToSong(s, detail.album));
}

export function mapSirenAlbumsToSongs(
  albums: SirenAlbum[],
  getDetail: (albumId: string) => Promise<SirenAlbumDetail | null>
): Promise<AppSong[]> {
  return Promise.all(
    albums.map(async (album) => {
      const detail = await getDetail(album.cid);
      if (!detail) return [];
      return mapSirenAlbumToSongs(detail);
    })
  ).then((results) => results.flat());
}
