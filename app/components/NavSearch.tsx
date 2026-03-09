'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { supabase } from '../../lib/supabase';

type PlayerRow = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

export default function NavSearch() {
  const { colors: c } = useTheme();
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState<PlayerRow[]>([]);
  const [open, setOpen]               = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [isMobile, setIsMobile]       = useState(false);
  const searchRef                     = useRef<HTMLDivElement>(null);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout>>(null);

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  const pathname = usePathname();
  useEffect(() => { close(); }, [pathname]);

  // Close when page is restored from bfcache (back/forward button)
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) close();
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Track mobile breakpoint for responsive dropdown
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    function onChange(e: MediaQueryListEvent) { setIsMobile(e.matches); }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  function close() {
    setOpen(false);
    setQuery('');
    setResults([]);
    setHoveredSlug(null);
  }

  const searchPlayers = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }

    const pattern = `%${q.trim()}%`;
    const { data } = await supabase
      .from('players')
      .select('name, slug, team, score, signal, league')
      .eq('active', true)
      .or(`name.ilike.${pattern},slug.ilike.${pattern},team.ilike.${pattern}`)
      .order('score', { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      setResults(data as PlayerRow[]);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(true);
    }
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlayers(q), 200);
  }

  // Calculate dropdown top for fixed positioning on mobile
  const getDropdownTop = () => {
    if (!isMobile || !searchRef.current) return undefined;
    const rect = searchRef.current.getBoundingClientRect();
    return rect.bottom;
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : 480, minWidth: 0 }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: c.green, fontSize: isMobile ? 15 : 17, pointerEvents: 'none', zIndex: 1,
      }}>⌕</span>
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder={isMobile ? 'Search...' : 'Search players, teams, cards...'}
        style={{
          width: '100%',
          background: c.surface,
          border: `1px solid ${open ? c.green : c.border}`,
          borderRadius: open && results.length > 0 && !isMobile ? '4px 4px 0 0' : 4,
          padding: isMobile ? '8px 10px 8px 34px' : '10px 14px 10px 40px',
          color: c.text,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: isMobile ? 12 : 13,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? `0 0 0 2px ${c.green}22` : 'none',
        }}
      />
      {open && (
        <div style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? getDropdownTop() : '100%',
          left: isMobile ? 12 : 0,
          right: isMobile ? 12 : 0,
          background: c.surface,
          border: `1px solid ${c.green}`,
          borderTop: isMobile ? `1px solid ${c.green}` : 'none',
          borderRadius: isMobile ? 4 : '0 0 4px 4px',
          zIndex: 9999,
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          maxHeight: isMobile ? '60vh' : 400,
          overflowY: 'auto',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted }}>
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
                gap: 8,
                padding: isMobile ? '10px 12px' : '12px 16px',
                borderBottom: `1px solid ${c.border}`,
                textDecoration: 'none',
                background: hoveredSlug === p.slug ? `${c.green}12` : 'transparent',
                borderLeft: hoveredSlug === p.slug ? `3px solid ${c.green}` : '3px solid transparent',
                transition: 'background 0.1s, border-left 0.1s',
                cursor: 'pointer',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 12 : 13,
                  color: hoveredSlug === p.slug ? c.green : c.text, transition: 'color 0.1s',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.team} · <span style={{ color: c.green }}>{p.league ?? 'NBA'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, flexShrink: 0 }}>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: isMobile ? 18 : 24, color: c.text, lineHeight: 1 }}>{p.score}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: signalColor[p.signal] || c.muted, border: `1px solid ${signalColor[p.signal] || c.muted}`, padding: '2px 6px', borderRadius: 2, letterSpacing: 1 }}>{p.signal}</span>
              </div>
            </a>
          ))}
        </div>
      )}
      <style>{`input::placeholder { color: ${c.muted}; }`}</style>
    </div>
  );
}
