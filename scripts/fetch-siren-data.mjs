/**
 * Monster Siren Records — Data Fetch & Map Script
 *
 * Fetches all albums/songs from the official API, maps them to the app's
 * internal Song type, and outputs a JSON file for use in the app.
 *
 * Usage:
 *   node scripts/fetch-siren-data.mjs                    # Direct API
 *   node scripts/fetch-siren-data.mjs --proxy http://...  # Via proxy
 *   node scripts/fetch-siren-data.mjs --server            # Via local express server
 *   node scripts/fetch-siren-data.mjs --output ./src/data/siren-songs.json
 *
 * The script attempts multiple strategies:
 *   1. Direct HTTPS request to monster-siren.hypergryph.com
 *   2. Via a CORS proxy (if --proxy is provided)
 *   3. Via a local monster-siren-api Express server (if --server)
 */

const BASE_URL = 'https://monster-siren.hypergryph.com/api';
const DEFAULT_OUTPUT = './src/data/siren-songs.json';

// ── Parse CLI args ──
const args = process.argv.slice(2);
const proxyUrl = getArg('--proxy');
const useServer = args.includes('--server');
const outputPath = getArg('--output') || DEFAULT_OUTPUT;

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
}

// ── HTTP helper ──
async function apiFetch(path) {
  const url = proxyUrl
    ? `${proxyUrl.replace(/\/+$/, '')}/${BASE_URL.replace(/^https?:\/\//, '')}${path}`
    : `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RIAT/1.0' },
      ...(proxyUrl ? {} : { rejectUnauthorized: false }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    throw new Error(`Failed to fetch ${path}: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function serverFetch(path) {
  const resp = await fetch(`http://localhost:3456/api${path}`);
  if (!resp.ok) throw new Error(`Server HTTP ${resp.status}`);
  return resp.json();
}

// ── Main ──
async function main() {
  console.log('📡 Monster Siren Data Fetcher\n');

  // 1. Get all albums
  console.log('Fetching albums...');
  let albums;
  try {
    const res = useServer ? await serverFetch('/albums') : await apiFetch('/api/albums');
    albums = res.data;
    console.log(`  ✅ ${albums.length} albums found`);
  } catch (err) {
    console.error(`  ❌ ${err.message}`);
    console.log('\n💡 Tips:');
    console.log('  • Use --proxy <url> to route through a CORS proxy');
    console.log('  • Use --server to use a local monster-siren-api server on port 3456');
    console.log('  • Or run monster-siren-api separately: cd node_modules/monster-siren-api && npm start\n');
    process.exit(1);
  }

  // 2. Get detail for each album
  console.log('\nFetching album details...');
  let totalSongs = 0;
  const allSongs = [];

  for (const album of albums) {
    try {
      const res = useServer
        ? await serverFetch(`/album/${album.cid}/detail`)
        : await apiFetch(`/api/album/${album.cid}/detail`);
      const detail = res.data;
      const songs = detail.songs || [];
      console.log(`  ${album.name}: ${songs.length} songs`);
      for (const song of songs) {
        allSongs.push({
          id: song.cid,
          title: song.name,
          artist: song.artists?.map((a) => a.name).join(' / ') || song.artist || album.artist || 'Unknown',
          album: song.albumName || album.name,
          duration: song.duration || 0,
          coverUrl: song.cover || album.coverUrl,
          audioUrl: song.sourceUrl,
          lrcUrl: song.lyricUrl,
          lrcText: song.lyric,
        });
        totalSongs++;
      }
    } catch (err) {
      console.warn(`  ⚠ ${album.name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Total: ${totalSongs} songs from ${albums.length} albums`);

  // 3. Output
  const fs = await import('fs');
  const output = JSON.stringify(allSongs, null, 2);
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`\n💾 Saved to ${outputPath} (${(Buffer.byteLength(output) / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
