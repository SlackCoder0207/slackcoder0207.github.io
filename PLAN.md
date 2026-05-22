# RIAT — Rhodes Island Audio Terminal

> 一个存在于《明日方舟》世界观中的音频终端系统

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **TailwindCSS** v3 (custom bevel system)
- **Zustand** (state management)
- **Framer Motion** (animations)
- **WebAudio API** (audio engine)

## Data Sources

### Primary: Monster Siren Records (塞壬唱片)

- **Official API**: `https://monster-siren.hypergryph.com/api`
- **Endpoints**: `/albums`, `/album/{id}/detail`, `/song/{id}`, `/search`
- **Dev Proxy**: Vite proxy at `/siren-api/*` → remote API
- **Static Fallback**: Pre-fetched JSON at `src/data/siren-songs.json`
- **Fetch Script**: `scripts/fetch-siren-data.mjs`

### Secondary: Netease Cloud Music (网易云)

- Self-hosted API proxy (Binaryify fork)
- For user search & personal library
- Requires separate server deployment

## Architecture

```
src/
  api/
    sirenTypes.ts      — API response types
    sirenService.ts    — API service with fallback
    dataMapper.ts      — Map API data → app types
  data/
    demoSongs.ts       — 7 demo songs (fallback)
    siren-songs.json   — Pre-fetched MSR data (generated)
  components/
    layout/            — AppLayout, Sidebar, TopBar, BottomPlayer, FullscreenLyrics
    ui/                — TerminalButton, CoverPlaceholder, ArtistLink, etc.
    effects/           — ScanEffect, GlitchEffect, AmbientGlow
  pages/               — LoginLaunch, Library, Search, Settings, Playlist, SongDetail, AlbumArtist
  player/              — AudioEngine, LyricParser, Visualizer
  stores/              — appStore, playerStore, playlistStore, uiStore
  themes/              — Clinical Archive, Deconstruction Complex
  types/               — App-wide TypeScript types
```

## Deployment

- **URL**: https://slackcoder0207.github.io
- **Repo**: https://github.com/SlackCoder0207/slackcoder0207.github.io
- Auto-deploy via `git push` to `master` branch
- GitHub Actions workflow included (`.github/workflows/deploy.yml`)

## Key Features

- Dual themes (Clinical Archive / Deconstruction Complex)
- 45° bevel cuts (clip-path)
- Three-column layout
- WebAudio playback with FFT visualizer
- Synced lyrics with karaoke highlight
- Fullscreen MV mode (video + glass UI)
- Playlist management
- Multi-artist support with dropdown
- Album / Artist detail views
- Song recommendations
- Persistent state (localStorage)
- Netease-style account login (root/root)

## Fetch Real Data

```bash
# Direct API (requires China network access)
node scripts/fetch-siren-data.mjs

# Via local proxy
node scripts/fetch-siren-data.mjs --proxy https://my-proxy.com

# Via local monster-siren-api server
cd node_modules/monster-siren-api && npm start &
node scripts/fetch-siren-data.mjs --server
```
