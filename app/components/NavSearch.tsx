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
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState<typeof players>([]);
  const [open, setOpen]               = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const searchRef                     = useRef<HTMLDivElement>(null);

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  function close() {
    setOpen(false);
    setQuery('');
    setResults([]);
    setHoveredSlug(null);
  }

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); setOpen(false); return; }
    const lower = q.toLowerCase();
    setResults(players.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.slug.includes(lower) ||
      p.team.toLowerCase().includes(lower)
    ));
    setOpen(true);
  }

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: c.green, fontSize: 17, pointerEvents: 'none', zIndex: 1,
      }}>⌕</span>
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search players, teams, cards..."
        style={{
          width: '100%',
          background: c.surface,
          border: `1px solid ${open ? c.green : c.border}`,
          borderRadius: open && results.length > 0 ? '4px 4px 0 0' : 4,
          padding: '10px 14px 10px 40px',
          color: c.text,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 13,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? `0 0 0 2px ${c.green}22` : 'none',
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
          borderRadius: '0 0 4px 4px',
          zIndex: 999,
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted }}>
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
                padding: '12px 16px',
                borderBottom: `1px solid ${c.border}`,
                textDecoration: 'none',
                background: hoveredSlug === p.slug ? `${c.green}12` : 'transparent',
                borderLeft: hoveredSlug === p.slug ? `3px solid ${c.green}` : '3px solid transparent',
                transition: 'background 0.1s, border-left 0.1s',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: hoveredSlug === p.slug ? c.green : c.text, transition: 'color 0.1s' }}>
                  {p.name}
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginTop: 2 }}>
                  {p.team}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: c.text, lineHeight: 1 }}>{p.score}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: signalColor[p.signal], border: `1px solid ${signalColor[p.signal]}`, padding: '2px 6px', borderRadius: 2, letterSpacing: 1 }}>{p.signal}</span>
              </div>
            </a>
          ))}
        </div>
      )}
      <style>{`input::placeholder { color: ${c.muted}; }`}</style>
    </div>
  );
}
