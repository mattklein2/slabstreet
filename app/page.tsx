'use client';

import { useState } from 'react';

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

const signalColor: Record<string, string> = { BUY: '#00ff87', HOLD: '#f59e0b', SELL: '#ff3b5c' };

const features = [
  { num: '01', icon: '📈', title: 'Card Tracker',       desc: 'Price charts, trend signals, volume spikes, and edge alerts per card. Every eBay sale feeds directly into your dashboard in real time.',  status: 'Live' },
  { num: '02', icon: '🧠', title: 'Player Intel',        desc: 'MVP odds, game logs, stats, news feed, and card correlation tables. Know how performance moves card prices before the market does.',     status: 'Live' },
  { num: '03', icon: '⚡', title: 'Pull Tracker',        desc: 'Confirmed vs unaccounted 1/1 registry. The most powerful trading signal in the hobby — know the moment a key card surfaces publicly.',   status: 'Live' },
  { num: '04', icon: '💼', title: 'Portfolio Tracker',   desc: 'Cost basis, unrealized P&L, buy/sell signals, and year-end tax summary. Your entire collection valued in real time.',                   status: 'Coming Soon' },
  { num: '05', icon: '🔬', title: 'Grade Decision Tool', desc: 'Should you grade this card? ROI calculator weighs grading fees against pop report data and comparable sales. No more guessing.',         status: 'Coming Soon' },
];

export default function HomePage() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<typeof players>([]);
  const [searched, setSearched] = useState(false);

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); setSearched(false); return; }
    const lower = q.toLowerCase();
    const found = players.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.slug.toLowerCase().includes(lower) ||
      p.team.toLowerCase().includes(lower)
    );
    setResults(found);
    setSearched(true);
  }

  return (
    <div style={{ background: '#090b0f', minHeight: '100vh', color: '#e8edf5', fontFamily: 'IBM Plex Sans, sans-serif', overflowX: 'hidden' }}>

      {/* TICKER */}
      <div style={{ background: '#0f1318', borderBottom: '1px solid #1e2530', overflow: 'hidden', whiteSpace: 'nowrap', padding: '8px 0' }}>
        <div style={{ display: 'inline-flex', animation: 'ticker 28s linear infinite' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', borderRight: '1px solid #1e2530', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
              <span style={{ color: '#8899aa', letterSpacing: 1 }}>{item.label}</span>
              <span style={{ color: '#e8edf5', fontWeight: 700 }}>{item.value}</span>
              <span style={{ color: item.up ? '#00ff87' : '#ff3b5c' }}>{item.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #1e2530', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#090b0f', zIndex: 100 }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, color: '#00ff87' }}>SLABSTREET</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#features" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', textDecoration: 'none', letterSpacing: 1 }}>[Features]</a>
          <a href="#features" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', textDecoration: 'none', letterSpacing: 1 }}>Learn More</a>
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div style={{ borderBottom: '1px solid #1e2530', padding: '10px 24px', background: '#0f1318', position: 'relative', zIndex: 90 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8899aa', fontSize: 14, pointerEvents: 'none' }}>⌕</span>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search players, teams, cards..."
            style={{
              width: '100%',
              background: '#090b0f',
              border: '1px solid #1e2530',
              borderRadius: 3,
              padding: '9px 12px 9px 32px',
              color: '#e8edf5',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 16, /* iOS zoom fix — must be >= 16px */
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searched && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f1318', border: '1px solid #1e2530', borderTop: 'none', borderRadius: '0 0 3px 3px', zIndex: 200 }}>
              {results.length === 0 ? (
                <div style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#8899aa' }}>No players found.</div>
              ) : results.map(p => (
                <a key={p.slug} href={`/players/${p.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1e2530', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: '#e8edf5' }}>{p.name}</div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa', marginTop: 2 }}>{p.team}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#e8edf5' }}>{p.score}</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: signalColor[p.signal], border: `1px solid ${signalColor[p.signal]}`, padding: '2px 6px', borderRadius: 2, letterSpacing: 1 }}>{p.signal}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#00ff87', letterSpacing: 3, marginBottom: 16 }}>Card Market Intelligence</div>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(42px, 8vw, 80px)', lineHeight: 1.05, letterSpacing: 2, color: '#e8edf5', margin: '0 0 24px' }}>
          THE EDGE SERIOUS<br />TRADERS NEED
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 16, color: '#8899aa', maxWidth: 560, lineHeight: 1.7, margin: '0 0 32px' }}>
          Bloomberg Terminal meets card collecting. Real-time eBay comps, graded card signals, 1/1 pull tracking, and MVP odds — all in one platform built for collectors who trade to win.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="#features" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: 2, padding: '12px 24px', background: '#00ff87', color: '#090b0f', borderRadius: 3, textDecoration: 'none', fontWeight: 700 }}>See Features</a>
          <a href="/players/wemby" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: 2, padding: '12px 24px', background: 'transparent', color: '#00ff87', border: '1px solid #00ff87', borderRadius: 3, textDecoration: 'none' }}>Search Players →</a>
        </div>
      </div>

      {/* TERMINAL MOCKUP */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderTop: '3px solid #00ff87', borderRadius: 4, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: '#00ff87' }}>Wemby Card Tracker</span>
            <span>·</span>
            <span>Live Feed</span>
            <span style={{ marginLeft: 'auto', color: '#00ff87', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff87', display: 'inline-block' }}></span>
              LIVE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {[
              { name: '2023 Prizm Silver Auto /25', sub: 'PSA 10 · Serial #14/25',       price: '$2,840', change: '▲ +8.4% 7d',   up: true  },
              { name: '2023 Prizm RC Base PSA 10',  sub: 'Pop: 847 · /10 variant avail',  price: '$480',   change: '▼ -2.1% 7d',   up: false },
              { name: 'NT Logoman Auto 1/1',        sub: 'Status: UNACCOUNTED ⚡',         price: '~$150K', change: '▲ BUY SIGNAL', up: true  },
              { name: '2024 Hoops Prizm Gold /10',  sub: 'Serial #03/10 · BGS 9.5',       price: '$1,200', change: '▲ +12.7% 7d',  up: true  },
            ].map((c, i) => (
              <div key={i} style={{ background: '#090b0f', border: '1px solid #1e2530', borderRadius: 3, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#e8edf5', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#8899aa', marginBottom: 8 }}>{c.sub}</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#e8edf5', lineHeight: 1 }}>{c.price}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.up ? '#00ff87' : '#ff3b5c', marginTop: 4 }}>{c.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ borderTop: '1px solid #1e2530', borderBottom: '1px solid #1e2530', background: '#0f1318', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { val: '500K+', label: 'Cards Tracked' },
            { val: '$2.4M', label: 'Sales Indexed Daily' },
            { val: '1/1',   label: 'Pull Registry Active' },
            { val: 'RT+',   label: 'Real-Time eBay Feed' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: '#00ff87', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa', marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', letterSpacing: 3, marginBottom: 8 }}>Platform Features</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(32px, 6vw, 52px)', letterSpacing: 2, color: '#e8edf5', marginBottom: 40 }}>BUILT FOR<br />TRADERS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#0f1318', border: '1px solid #1e2530', borderTop: `3px solid ${f.status === 'Live' ? '#00ff87' : '#1e2530'}`, borderRadius: 4, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa', letterSpacing: 1 }}>{f.num}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: 1, padding: '2px 7px', borderRadius: 2, border: `1px solid ${f.status === 'Live' ? '#00ff87' : '#1e2530'}`, color: f.status === 'Live' ? '#00ff87' : '#8899aa' }}>{f.status}</span>
              </div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 1, color: '#e8edf5', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#8899aa', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1e2530', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 3, color: '#00ff87', marginBottom: 6 }}>SLABSTREET</div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa' }}>© 2026 Slab Street · slabstreet.io · All rights reserved</div>
      </footer>

      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        input::placeholder { color: #8899aa; }
        input:focus { border-color: #00ff87 !important; }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
