/**
 * Split a multi-artist string into individual artists.
 * Supports "/" separator: "A / B / C" → ["A", "B", "C"]
 */
export function splitArtists(artist: string): string[] {
  return artist
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Display a truncated version of artist string.
 */
export function displayArtist(artist: string, maxLen = 24): string {
  if (artist.length <= maxLen) return artist;
  return artist.slice(0, maxLen) + '...';
}

/**
 * Check if artist string contains multiple artists.
 */
export function hasMultipleArtists(artist: string): boolean {
  return artist.includes('/');
}
