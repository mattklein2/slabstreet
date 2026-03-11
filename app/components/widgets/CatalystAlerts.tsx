'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';

type CatalystPlayer = {
  name: string;
  slug: string;
  team: string;
  league: string;
  score: number;
  catalystScore: number;
  signal: 'BUY' | 'SELL';
  blurb: string;
  factors: {
    performanceBreakout: number;
    teamTrajectory: number;
    marketLag: number;
    youthPremium: number;
    opportunityChange: number;
  };
  marketData: {
    weeklyChange: number | null;
    monthlyChange: number | null;
    sales24h: number | null;
    marketCap: string | null;
  };
};

const FACTOR_LABELS: Record<string, string> = {
  performanceBreakout: 'Performance',
  teamTrajectory: 'Team',
  marketLag: 'Market Lag',
  youthPremium: 'Youth',
  opportunityChange: 'Opportunity',
};

const FACTOR_MAX: Record<string, number> = {
  performanceBreakout: 25,
  teamTrajectory: 25,
  marketLag: 25,
  youthPremium: 15,
  opportunityChange: 10,
};

function CatalystRow({ player, rank, accent }: { player: CatalystPlayer; rank: number; accent: string }) {
  const { colors: c } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3" style={{ padding: '14px 16px' }}>
        {/* Rank number */}
        <div
          className="flex items-center justify-center shrink-0 font-mono text-[15px] font-bold"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${accent}14`,
            color: accent,
          }}
        >
          {rank}
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <a
              href={`/players/${player.slug}`}
              className="font-body text-[15px] font-semibold no-underline hover:underline truncate"
              style={{ color: c.text }}
            >
              {player.name}
            </a>
            <span className="font-body text-[12px] shrink-0" style={{ color: c.muted }}>
              {player.team} · {player.league}
            </span>
            <a
              href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(player.name + ' sports card')}&_sacat=212&LH_All=1&_sop=12`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] shrink-0 no-underline hover:underline"
              style={{ color: c.muted, opacity: 0.7 }}
              title={`Search eBay for ${player.name} cards`}
            >
              eBay ↗
            </a>
          </div>
          {/* Blurb */}
          <div className="font-body text-[13px] leading-relaxed mt-1" style={{ color: c.text, opacity: 0.8 }}>
            {player.blurb}
          </div>
          {/* Market cap with tooltip */}
          {player.marketData.marketCap && (
            <div className="mt-1.5 relative group inline-block">
              <span
                className="font-mono text-[11px] cursor-help"
                style={{ color: c.muted, borderBottom: `1px dotted ${c.muted}` }}
                title={`Market Cap — the total estimated value of all ${player.name}'s cards currently in circulation, based on recent sales data from CardLadder.`}
              >
                {player.marketData.marketCap} mkt cap
              </span>
            </div>
          )}
        </div>

        {/* Catalyst score + expand */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="font-mono text-[18px] font-bold leading-none"
            style={{ color: accent }}
          >
            {player.catalystScore}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            className="shrink-0 cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              color: c.muted,
              fontSize: 12,
              padding: '2px',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
            }}
          >
            ▼
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${c.border}` }}>
          <div className="font-body text-[11px] font-medium tracking-widest uppercase mt-3 mb-2" style={{ color: c.muted }}>
            CATALYST BREAKDOWN
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(player.factors)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="font-body text-[12px] w-[80px] shrink-0" style={{ color: c.muted }}>
                    {FACTOR_LABELS[key]}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: c.border }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(val / FACTOR_MAX[key]) * 100}%`,
                        background: accent,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="font-mono text-[12px] w-[28px] text-right" style={{ color: accent }}>
                    {val}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CatalystColumn({
  title,
  subtitle,
  players,
  accent,
  loading,
  error,
}: {
  title: string;
  subtitle: string;
  players: CatalystPlayer[];
  accent: string;
  loading: boolean;
  error: boolean;
}) {
  const { colors: c } = useTheme();

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-3">
        <div className="font-display text-[15px] tracking-[2px] font-bold" style={{ color: accent }}>
          {title}
        </div>
        <div className="font-body text-[12px] mt-0.5" style={{ color: c.muted }}>
          {subtitle}
        </div>
      </div>
      {loading && <WidgetSkeleton rows={6} />}
      {error && <WidgetError message="Unable to load data" />}
      {!loading && !error && players.length === 0 && (
        <WidgetEmpty message="No alerts right now" />
      )}
      {!loading && !error && players.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {players.map((p, i) => (
            <CatalystRow key={p.slug} player={p} rank={i + 1} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}

type WatchPlayer = { name: string; slug: string; team: string; league: string };

function WatchlistSection({ title, players, accent }: { title: string; players: WatchPlayer[]; accent: string }) {
  const { colors: c } = useTheme();
  if (players.length === 0) return null;

  return (
    <div className="flex-1 min-w-0">
      <div className="font-display text-[13px] tracking-[2px] font-bold mb-2" style={{ color: accent, opacity: 0.7 }}>
        {title}
      </div>
      <div className="flex flex-wrap gap-x-1.5 gap-y-1.5">
        {players.map((p) => (
          <a
            key={p.slug}
            href={`/players/${p.slug}`}
            className="font-body text-[13px] no-underline hover:underline px-2.5 py-1.5"
            style={{
              color: c.text,
              background: `${accent}08`,
              border: `1px solid ${accent}20`,
              borderRadius: 8,
            }}
          >
            {p.name} <span style={{ color: c.muted, fontSize: 11 }}>{p.team}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function CatalystAlerts() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [buys, setBuys] = useState<CatalystPlayer[]>([]);
  const [sells, setSells] = useState<CatalystPlayer[]>([]);
  const [watchBuys, setWatchBuys] = useState<WatchPlayer[]>([]);
  const [watchSells, setWatchSells] = useState<WatchPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch('/api/catalysts');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setBuys(data.buys || []);
        setSells(data.sells || []);
        setWatchBuys(data.watchBuys || []);
        setWatchSells(data.watchSells || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter by active league
  const filteredBuys = activeLeague === 'ALL' ? buys : buys.filter(p => p.league === activeLeague);
  const filteredSells = activeLeague === 'ALL' ? sells : sells.filter(p => p.league === activeLeague);
  const filteredWatchBuys = activeLeague === 'ALL' ? watchBuys : watchBuys.filter(p => p.league === activeLeague);
  const filteredWatchSells = activeLeague === 'ALL' ? watchSells : watchSells.filter(p => p.league === activeLeague);

  // Use theme-aware colors (readable on both dark and light backgrounds)
  const buyAccent = c.green;
  const sellAccent = c.red;

  return (
    <WidgetShell
      title="CATALYST ALERTS"
      icon="🔬"
      accentColor={c.green}
      minContentHeight={300}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <CatalystColumn
          title="UNDERVALUED"
          subtitle="Players with catalysts the card market hasn't priced in yet."
          players={filteredBuys}
          accent={buyAccent}
          loading={loading}
          error={error}
        />
        <CatalystColumn
          title="OVERVALUED"
          subtitle="Players whose market activity may not be justified by current performance."
          players={filteredSells}
          accent={sellAccent}
          loading={loading}
          error={error}
        />
      </div>

      {/* Keep an Eye On — compact watchlist */}
      {!loading && !error && (filteredWatchBuys.length > 0 || filteredWatchSells.length > 0) && (
        <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 24, paddingTop: 20 }}>
          <div className="font-display text-[14px] tracking-[2px] mb-1" style={{ color: c.muted }}>
            KEEP AN EYE ON
          </div>
          <div className="font-body text-[12px] mb-4" style={{ color: c.muted, opacity: 0.7 }}>
            Not strong enough to make our lists yet, but showing early signals worth watching.
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <WatchlistSection title="LEANS BUY" players={filteredWatchBuys} accent={buyAccent} />
            <WatchlistSection title="LEANS SELL" players={filteredWatchSells} accent={sellAccent} />
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
