export interface LyricLine {
  time: number; // seconds
  text: string;
}

/**
 * Parse LRC lyric text into structured lines.
 * Supports [mm:ss.xx] and [mm:ss.xxx] formats.
 */
export function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = regex.exec(trimmed);
    if (!match) continue;

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    let millis = 0;
    if (match[3]) {
      millis = Number(match[3].padEnd(3, '0'));
    }

    const time = minutes * 60 + seconds + millis / 1000;
    const text = trimmed.replace(regex, '').trim();

    if (text) {
      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Get the current lyric line index based on playback time.
 */
export function getCurrentLyricIndex(lines: LyricLine[], time: number): number {
  let i = 0;
  for (; i < lines.length; i++) {
    if (lines[i].time > time) break;
  }
  return i - 1;
}
