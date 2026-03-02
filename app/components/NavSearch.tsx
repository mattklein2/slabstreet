'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const players = [
  { name: 'Victor Wembanyama', slug: 'wemby', team: 'SAS', score: 74, signal: 'BUY'  },
  { name: 'Luka Doncic',       slug: 'luka',  team: 'LAL', score: 61, signal: 'HOLD' },
  { name: 'Ja Morant',         slug: 'ja',    team: 'MEM', score: 55, signal: 'HOLD' },
  { name: 'Anthony Edwards',   slug: 'ant',   team: 'MIN', score: 67, signal: 'HOLD' },
];

export default function NavSearch() {
  const { colors: c } = useTheme();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<typeof players>([]);
  const [open, setOpen]         = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const searchRef               = useRef<HTMLDivElement>(null);

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on browser back button
  useEffect(() => {
    function handlePopState() {
      close();
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function close() {
    setOpen(false);
    setQuery('');
    setResults([]);
    setHoveredSlug(null);
  }

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = players.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.slug.includes(lower) ||
      p.team.toLowerCase().includes(lower)
    );
    setResults(filtered);
    setOpen(true);
  }

  return (
    <div ref={searchRef} style={{ position: 'relative', width: 280 }}>
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        color: c.muted, fontSize: 14, pointerEvents: 'none', zIndex: 1,
      }}>⌕</span>
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search players..."
        style={{
          width: '100%',
          background: c.surface,
          border: `1px solid ${open ? c.green : c.border}`,
          borderRadius: open && results.length > 0 ? '3px 3px 0 0' : 3,
          padding: '7px 10px 7px 30px',
          color: c.text,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 12,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: c.surface,
          border: `1px solid ${c.green}`,
          borderTop: 'none',
          borderRadius: '0 0 3px 3px',
          zIndex: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {results.length === 0 ? (
            <div style={{
              padding: '10px 14px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 11,
              color: c.muted,
            }}>
              No players found.
            </div>
          ) : results.map(p => (
            <a
              key={p.slug}
              href={`/players/${p.slug}`}
              onMouseEnter={() => setHoveredSlug(p.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: `1px solid ${c.border}`,
                textDecoration: 'none',
                background: hoveredSlug === p.slug ? c.border : 'transparent',
                transition: 'background 0.1s',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 12,
                  color: hoveredSlug === p.slug ? c.green : c.text,
                  transition: 'color 0.1s',
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 10,
                  color: c.muted,
                  marginTop: 2,
                }}>
                  {p.team}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: 22,
                  color: c.text,
                  lineHeight: 1,
                }}>
                  {p.score}
                </span>
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 9,
                  color: signalColor[p.signal],
                  border: `1px solid ${signalColor[p.signal]}`,
                  padding: '2px 5px',
                  borderRadius: 2,
                  letterSpacing: 1,
                }}>
                  {p.signal}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
      <style>{`
        input::placeholder { color: ${c.muted}; }
      `}</style>
    </div>
  );
}
