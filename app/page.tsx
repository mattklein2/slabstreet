'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from './components/ThemeProvider';

const tickerItems = [
  { label: 'WEMBY AUTO /25',      value: '$2,840',       change: '+8.4%',    up: true  },
  { label: 'WEMBY LOGOMAN 1/1',   value: 'UNACCOUNTED',  change: '⚡ SIGNAL', up: true  },
  { label: 'WEMBY RC PSA 10',     value: '$480',         change: '-2.1%',    up: false },
  { label: 'MVP ODDS',            value: '-320',         change: '+DK',      up: true  },
  { label: 'WEMBY PRIZM SILVER',  value: '$220',         change: '+12.7%',   up: true  },
  { label: 'POP REPORT PSA 10',   value: '847',          change: '+23 NEW',  up: true  },
];

const players = [
  { name: 'Victor Wembanyama', slug: 'wemby', team: 'SAS', score: 74, signal: 'BUY'  },
  { name: 'Luka Doncic',       slug: 'luka',  team: 'LAL', score: 61, signal: 'HOLD' },
  { name: 'Ja Morant',         slug: 'ja',    team: 'MEM', score: 55, signal: 'HOLD' },
  { name: 'Anthony Edwards',   slug: 'ant',   team: 'MIN', score: 67, signal: 'HOLD' },
];

const features = [
  { num: '01', icon: '📈', title: 'Card Tracker',       desc: 'Price charts, trend signals, volume spikes, and edge alerts per card. Every eBay sale feeds directly into your dashboard in real time.',  status: 'Live' },
  { num: '02', icon: '🧠', title: 'Player Intel',        desc: 'MVP odds, game logs, stats, news feed, and card correlation tables. Know how performance moves card prices before the market does.',     status: 'Live' },
  { num: '03', icon: '⚡', title: 'Pull Tracker',        desc: 'Confirmed vs unaccounted 1/1 registry. The most powerful trading signal in the hobby — know the moment a key card surfaces publicly.',   status: 'Live' },
  { num: '04', icon: '💼', title: 'Portfolio Tracker',   desc: 'Cost basis, unrealized P&L, buy/sell signals, and year-end tax summary. Your entire collection valued in real time.',                   status: 'Coming Soon' },
  { num: '05', icon: '🔬', title: 'Grade Decision Tool', desc: 'Should you grade this card? ROI calculator weighs grading fees against pop report data and comparable sales. No more guessing.',         status: 'Coming Soon' },
];

export default function HomePage() {
  const { theme, toggle, colors: c } = useTheme();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<typeof players>([]);
  const [searched, setSearched] = useState(false);
  const searchRef               = useRef<HTMLDivElement>(null);

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearched(false); setQuery(''); setResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); setSearched(false); return; }
    const lower = q.toLowerCase();
    setResults(players.filter(p =>
      p.name.toLowerCase().includes(lower) || p.slug.includes(lower) || p.team.toLowerCase().includes(lower)
    ));
    setSearched(true);
  }

  return (
    <div style={{ color: c.text, fontFamily: 'IBM Plex Sans, sans-serif', overflowX: 'hidden' }}>

      {/* TICKER */}
      <div style={{ background: c.surface, borderBottom: `1px solid ${c.border}`, overflow: 'hidden', whiteSpace: 'nowrap', padding: '8px 0' }}>
        <div style={{ display: 'inline-flex', animation: 'ticker 28s linear infinite' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', borderRight: `1px solid ${c.border}`, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
              <span style={{ color: c.muted, letterSpacing: 1 }}>{item.label}</span>
              <span style={{ color: c.text, fontWeight: 700 }}>{item.value}</span>
              <span style={{ color: item.up ? c.green : c.red }}>{item.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${c.border}`, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: c.navBg, zIndex: 100, boxShadow: theme === 'light' ? '0 1px 8px rgba(0,0,0,0.06)' : 'none' }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, color: c.green }}>SLABSTREET</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="#features" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, textDecoration: 'none', letterSpacing: 1 }}>[Features]</a>
          <a href="#features" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, textDecoration: 'none', letterSpacing: 1 }}>Learn More</a>
          {/* THEME TOGGLE */}
          <button onClick={toggle} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 20, width: 44, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'all 0.2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: c.green, transform: theme === 'dark' ? 'translateX(0)' : 'translateX(20px)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </nav>

      {/* SEARCH */}
      <div style={{ borderBottom: `1px solid ${c.border}`, padding: '10px 24px', background: c.surface, position: 'relative', zIndex: 90 }}>
        <div ref={searchRef} style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.muted, fontSize: 14, pointerEvents: 'none' }}>⌕</span>
          <input type="text" value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search players, teams, cards..."
            style={{ width: '100%', background: c.bg, border: `1px solid ${c.border}`, borderRadius: searched ? '3px 3px 0 0' : 3, padding: '9px 12px 9px 32px', color: c.text, fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'background 0.2s' }}
          />
          {searched && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: c.surface, border: `1px solid ${c.border}`, borderTop: 'none', borderRadius: '0 0 3px 3px', zIndex: 200 }}>
              {results.length === 0
                ? <div style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted }}>No players found.</div>
                : results.map(p => (
                  <a key={p.slug} href={`/players/${p.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${c.border}`, textDecoration: 'none' }}>
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: c.text }}>{p.name}</div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginTop: 2 }}>{p.team}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: c.text }}>{p.score}</span>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: signalColor[p.signal], border: `1px solid ${signalColor[p.signal]}`, padding: '2px 6px', borderRadius: 2, letterSpacing: 1 }}>{p.signal}</span>
                    </div>
                  </a>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.green, letterSpacing: 3, marginBottom: 16 }}>Card Market Intelligence</div>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(42px, 8vw, 80px)', lineHeight: 1.05, letterSpacing: 2, color: c.text, margin: '0 0 24px' }}>THE EDGE SERIOUS<br />TRADERS NEED</h1>
        <p style={{ fontSize: 16, color: c.muted, maxWidth: 560, lineHeight: 1.7, margin: '0 0 32px' }}>Bloomberg Terminal meets card collecting. Real-time eBay comps, graded card signals, 1/1 pull tracking, and MVP odds — all in one platform built for collectors who trade to win.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="#features" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: 2, padding: '12px 24px', background: c.green, color: '#090b0f', borderRadius: 3, textDecoration: 'none', fontWeight: 700 }}>See Features</a>
          <a href="/players/wemby" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: 2, padding: '12px 24px', background: 'transparent', color: c.green, border: `1px solid ${c.green}`, borderRadius: 3, textDecoration: 'none' }}>Search Players →</a>
        </div>
      </div>

      {/* TERMINAL MOCKUP */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderTop: `3px solid ${c.green}`, borderRadius: 4, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: c.green }}>Wemby Card Tracker</span><span>·</span><span>Live Feed</span>
            <span style={{ marginLeft: 'auto', color: c.green, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {[
              { name: '2023 Prizm Silver Auto /25', sub: 'PSA 10 · Serial #14/25',      price: '$2,840', change: '▲ +8.4% 7d',   up: true  },
              { name: '2023 Prizm RC Base PSA 10',  sub: 'Pop: 847 · /10 variant avail', price: '$480',   change: '▼ -2.1% 7d',   up: false },
              { name: 'NT Logoman Auto 1/1',        sub: 'Status: UNACCOUNTED ⚡',        price: '~$150K', change: '▲ BUY SIGNAL', up: true  },
              { name: '2024 Hoops Prizm Gold /10',  sub: 'Serial #03/10 · BGS 9.5',      price: '$1,200', change: '▲ +12.7% 7d',  up: true  },
            ].map((card, i) => (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 3, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.text, marginBottom: 4 }}>{card.name}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, marginBottom: 8 }}>{card.sub}</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: c.text, lineHeight: 1 }}>{card.price}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: card.up ? c.green : c.red, marginTop: 4 }}>{card.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, background: c.surface, padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[{ val: '500K+', label: 'Cards Tracked' }, { val: '$2.4M', label: 'Sales Indexed Daily' }, { val: '1/1', label: 'Pull Registry Active' }, { val: 'RT+', label: 'Real-Time eBay Feed' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: c.green, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, letterSpacing: 3, marginBottom: 8 }}>Platform Features</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(32px, 6vw, 52px)', letterSpacing: 2, color: c.text, marginBottom: 40 }}>BUILT FOR<br />TRADERS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderTop: `3px solid ${f.status === 'Live' ? c.green : c.border}`, borderRadius: 4, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, letterSpacing: 1 }}>{f.num}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: 1, padding: '2px 7px', borderRadius: 2, border: `1px solid ${f.status === 'Live' ? c.green : c.border}`, color: f.status === 'Live' ? c.green : c.muted }}>{f.status}</span>
              </div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 1, color: c.text, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '24px', textAlign: 'center', background: c.surface }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 3, color: c.green, marginBottom: 6 }}>SLABSTREET</div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>© 2026 Slab Street · slabstreet.io · All rights reserved</div>
      </footer>

      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        input::placeholder { color: ${c.muted}; }
        input:focus { border-color: ${c.green} !important; }
      `}</style>
    </div>
  );
}