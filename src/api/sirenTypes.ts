/* ===== Monster Siren Records API Response Types ===== */

export interface SirenAlbum {
  cid: string;
  name: string;
  coverUrl: string;
  coverLargeUrl?: string;
  artist?: string;
  artists?: { artistId?: number; name: string }[];
 belongsTo?: string;
}

export interface SirenSong {
  cid: string;
  name: string;
  albumCid?: string;
  albumName?: string;
  artist?: string;
  artists?: { artistId?: number; name: string }[];
  sourceUrl?: string;
  lyricUrl?: string;
  lyric?: string;
  duration?: number;
  cover?: string;
}

export interface SirenAlbumDetail {
  album: SirenAlbum;
  songs: SirenSong[];
}

export interface SirenApiResponse<T> {
  code: number;
  msg?: string;
  data: T;
}
