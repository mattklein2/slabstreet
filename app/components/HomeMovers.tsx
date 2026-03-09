'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { supabase } from '../../lib/supabase';

type Mover = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

export default function HomeMovers() {
  const { colors: c } = useTheme();
  const [risers, setRisers] = useState<Mover[]>([]);
  const [fallers, setFallers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    function onChange(e: MediaQueryListEvent) { setIsMobile(e.matches); }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    async function load() {
      const [buyRes, sellRes] = await Promise.all([
        supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .eq('signal', 'BUY')
          .order('score', { ascending: false })
          .limit(5),
        supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .eq('signal', 'SELL')
          .order('score', { ascending: true })
          .limit(5),
      ]);
      setRisers((buyRes.data as Mover[]) || []);
      setFallers((sellRes.data as Mover[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  function renderRow(p: Mover, idx: number, type: 'riser' | 'faller') {
    const accent = type === 'riser' ? c.green : c.red;
    return (
      <a
        key={p.slug}
        href={`/players/${p.slug}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: isMobile ? '10px 12px' : '10px 14px',
          borderBottom: `1px solid ${c.border}22`, textDecoration: 'none',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = `${accent}08`)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <span style={{
            fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: c.muted,
            width: 22, textAlign: 'center', flexShrink: 0,
          }}>{idx + 1}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 11 : 12,
              color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{p.name}</div>
            <div style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, marginTop: 1,
            }}>{p.team} · {p.league}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontFamily: 'Bebas Neue, sans-serif', fontSize: isMobile ? 20 : 24,
            color: c.text, lineHeight: 1,
          }}>{p.score}</span>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 9,
            color: signalColor[p.signal] || c.muted,
            border: `1px solid ${signalColor[p.signal] || c.muted}`,
            padding: '2px 6px', borderRadius: 2, letterSpacing: 1,
          }}>{p.signal}</span>
        </div>
      </a>
    );
  }

  if (loading) {
    return (
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted, textAlign: 'center', padding: 40 }}>
        Loading movers...
      </div>
    );
  }

  if (risers.length === 0 && fallers.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 16,
    }}>
      {/* Risers */}
      <div style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderTop: `3px solid ${c.green}`, borderRadius: 4,
      }}>
        <div style={{
          padding: isMobile ? '12px 12px 8px' : '14px 14px 10px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, color: c.green }}>▲</span>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.green,
              letterSpacing: 2, fontWeight: 600,
            }}>TOP RISERS</span>
          </div>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, letterSpacing: 1,
          }}>BUY SIGNAL</span>
        </div>
        {risers.length > 0 ? (
          risers.map((p, i) => renderRow(p, i, 'riser'))
        ) : (
          <div style={{ padding: 20, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, textAlign: 'center' }}>
            No risers right now
          </div>
        )}
      </div>

      {/* Fallers */}
      <div style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderTop: `3px solid ${c.red}`, borderRadius: 4,
      }}>
        <div style={{
          padding: isMobile ? '12px 12px 8px' : '14px 14px 10px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, color: c.red }}>▼</span>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.red,
              letterSpacing: 2, fontWeight: 600,
            }}>TOP FALLERS</span>
          </div>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, letterSpacing: 1,
          }}>SELL SIGNAL</span>
        </div>
        {fallers.length > 0 ? (
          fallers.map((p, i) => renderRow(p, i, 'faller'))
        ) : (
          <div style={{ padding: 20, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, textAlign: 'center' }}>
            No fallers right now
          </div>
        )}
      </div>
    </div>
  );
}
