'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '../components/ThemeProvider';

type CardResult = {
  id: string;
  slug: string;
  playerSlug: string;
  year: number;
  setName: string;
  parallel: string;
  cardNumber: string;
  numberedTo: number | null;
  league: string;
  imageUrl: string | null;
};

type PlayerResult = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

function formatCardName(card: CardResult): string {
  const parts = [String(card.year), card.setName];
  if (card.parallel && card.parallel !== 'Base') parts.push(card.parallel);
  if (card.cardNumber) parts.push(`#${card.cardNumber}`);
  return parts.join(' ');
}

function formatPlayerSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span>Loading...</span></div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const { colors: c } = useTheme();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [cards, setCards] = useState<CardResult[]>([]);
  const [players, setPlayers] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'cards' | 'players'>('cards');

  useEffect(() => {
    if (!q || q.length < 2) {
      setCards([]);
      setPlayers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=50`).then(r => r.ok ? r.json() : { cards: [] }),
      fetch(`/api/players/search?q=${encodeURIComponent(q)}`).then(r => r.ok ? r.json() : { players: [] }).catch(() => ({ players: [] })),
    ]).then(([cardsData, playersData]) => {
      setCards(cardsData.cards || []);
      setPlayers(playersData.players || []);
      setLoading(false);
    });
  }, [q]);

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  return (
    <div className="min-h-screen" style={{ color: c.text }}>
      <main className="max-w-[1200px] mx-auto px-8 md:px-12 lg:px-16 py-8">
        <h1 className="font-display text-2xl tracking-wide mb-2" style={{ color: c.text }}>
          Search Results
        </h1>
        {q && (
          <p className="font-body text-sm mb-6" style={{ color: c.muted }}>
            Showing results for &quot;{q}&quot;
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button
            onClick={() => setTab('cards')}
            className="font-body text-sm px-4 py-2.5"
            style={{
              color: tab === 'cards' ? c.green : c.muted,
              borderBottom: tab === 'cards' ? `2px solid ${c.green}` : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              border: 'none',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: tab === 'cards' ? c.green : 'transparent',
            }}
          >
            Cards {!loading && `(${cards.length})`}
          </button>
          <button
            onClick={() => setTab('players')}
            className="font-body text-sm px-4 py-2.5"
            style={{
              color: tab === 'players' ? c.green : c.muted,
              background: 'transparent',
              cursor: 'pointer',
              border: 'none',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: tab === 'players' ? c.green : 'transparent',
            }}
          >
            Players {!loading && `(${players.length})`}
          </button>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded h-16"
                style={{
                  background: `linear-gradient(90deg, ${c.border} 25%, ${c.surface} 50%, ${c.border} 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        )}

        {!loading && tab === 'cards' && (
          cards.length === 0 ? (
            <div className="py-16 text-center font-body text-sm" style={{ color: c.muted }}>
              No cards found for &quot;{q}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map(card => (
                <a
                  key={card.slug}
                  href={`/cards/${card.slug}`}
                  className="rounded-md overflow-hidden no-underline"
                  style={{
                    background: c.surface,
                    border: `1px solid ${c.border}`,
                    transition: 'border-color 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = c.green;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = c.border;
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >
                  {card.imageUrl ? (
                    <div style={{ height: 180, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={card.imageUrl} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{ height: 180, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 40, opacity: 0.2 }}>🃏</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="font-body text-xs font-medium mb-1" style={{ color: c.text }}>
                      {formatCardName(card)}
                    </div>
                    <div className="font-body text-[10px]" style={{ color: c.muted }}>
                      {formatPlayerSlug(card.playerSlug)}
                      {card.numberedTo && <span> · /{card.numberedTo}</span>}
                    </div>
                    <div className="mt-2">
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                        style={{ color: c.green, background: `${c.green}15`, border: `1px solid ${c.green}33` }}
                      >
                        {card.league}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        )}

        {!loading && tab === 'players' && (
          players.length === 0 ? (
            <div className="py-16 text-center font-body text-sm" style={{ color: c.muted }}>
              No players found for &quot;{q}&quot;
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {players.map(p => (
                <a
                  key={p.slug}
                  href={`/players/${p.slug}`}
                  className="flex items-center justify-between gap-4 rounded-md px-5 py-4 no-underline"
                  style={{
                    background: c.surface,
                    border: `1px solid ${c.border}`,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = c.green; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = c.border; }}
                >
                  <div>
                    <div className="font-body text-sm font-medium" style={{ color: c.text }}>{p.name}</div>
                    <div className="font-body text-xs mt-0.5" style={{ color: c.muted }}>{p.team} · {p.league}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl" style={{ color: c.text }}>{p.score}</span>
                    <span
                      className="font-mono text-[9px] px-2 py-1 rounded"
                      style={{
                        color: signalColor[p.signal] || c.muted,
                        border: `1px solid ${signalColor[p.signal] || c.muted}`,
                      }}
                    >
                      {p.signal}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
