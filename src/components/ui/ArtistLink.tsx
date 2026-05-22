import { useState, useRef, useEffect } from 'react';
import { splitArtists, displayArtist, hasMultipleArtists } from '../../utils/artistUtils';
import { useUIStore } from '../../stores/uiStore';
import { demoSongs } from '../../data/demoSongs';
import { cn } from '../../utils/cn';

interface ArtistLinkProps {
  artist: string;
  isActive?: boolean;
  className?: string;
}

export function ArtistLink({ artist, isActive, className }: ArtistLinkProps) {
  const { setSubView } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowDropdown(false);
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showDropdown]);

  const artists = splitArtists(artist);
  const getSongs = (a: string) => demoSongs.filter((s) => s.artist.includes(a));

  const handleClick = (e: React.MouseEvent) => {
    if (hasMultipleArtists(artist)) {
      e.stopPropagation();
      setShowDropdown(!showDropdown);
    } else {
      setSubView({ type: 'artist', artist, songs: getSongs(artist) });
    }
  };

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button onClick={handleClick}
        className="font-mono text-xs truncate max-w-[130px] text-left transition-all duration-200 hover:text-[var(--accent)]"
        style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}
        title={hasMultipleArtists(artist) ? `${artists.length} ARTISTS · CLICK TO SELECT` : artist}>
        {displayArtist(artist)}
      </button>

      {showDropdown && (
        <div className="absolute z-50 mt-1 bevel-sm border py-1 shadow-lg" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', minWidth: 140 }}>
          {artists.map((a) => (
            <button
              key={a}
              onClick={() => { setSubView({ type: 'artist', artist: a, songs: getSongs(a) }); setShowDropdown(false); }}
              className="block w-full text-left px-3 py-1.5 font-mono text-xs transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
