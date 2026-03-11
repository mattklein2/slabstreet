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
      <div className="flex items-start gap-3" style={{ padding: '12px 14px' }}>
        {/* Rank number */}
        <div
          className="flex items-center justify-center shrink-0 font-mono text-[13px] font-bold"
          style={{
            width: 28,
            height: 28,
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
              className="font-body text-[13px] font-semibold no-underline hover:underline truncate"
              style={{ color: c.text }}
            >
              {player.name}
            </a>
            <span className="font-body text-[10px] shrink-0" style={{ color: c.muted }}>
              {player.team} · {player.league}
            </span>
          </div>
          {/* Blurb */}
          <div className="font-body text-[11px] leading-relaxed mt-1" style={{ color: c.text, opacity: 0.8 }}>
            {player.blurb}
          </div>
          {/* Market data inline */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            {player.marketData.marketCap && (
              <span className="font-mono text-[9px]" style={{ color: c.muted }}>
                {player.marketData.marketCap}
              </span>
            )}
            {player.marketData.weeklyChange != null && (
              <span className="font-mono text-[9px]" style={{ color: Number(player.marketData.weeklyChange) >= 0 ? '#00ff87' : '#ff3b5c' }}>
                W: {Number(player.marketData.weeklyChange) >= 0 ? '+' : ''}{Number(player.marketData.weeklyChange).toFixed(1)}%
              </span>
            )}
            {player.marketData.monthlyChange != null && (
              <span className="font-mono text-[9px]" style={{ color: Number(player.marketData.monthlyChange) >= 0 ? '#00ff87' : '#ff3b5c' }}>
                M: {Number(player.marketData.monthlyChange) >= 0 ? '+' : ''}{Number(player.marketData.monthlyChange).toFixed(1)}%
              </span>
            )}
            {player.marketData.sales24h !== null && (
              <span className="font-mono text-[9px]" style={{ color: c.muted }}>
                {player.marketData.sales24h} sales/24h
              </span>
            )}
          </div>
        </div>

        {/* Catalyst score + expand */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="font-mono text-[14px] font-bold leading-none"
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
              fontSize: 10,
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
        <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${c.border}` }}>
          <div className="font-body text-[9px] font-medium tracking-widest uppercase mt-3 mb-2" style={{ color: c.muted }}>
            CATALYST BREAKDOWN
          </div>
          <div className="flex flex-col gap-1.5">
            {Object.entries(player.factors)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="font-body text-[10px] w-[72px] shrink-0" style={{ color: c.muted }}>
                    {FACTOR_LABELS[key]}
                  </div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(val / FACTOR_MAX[key]) * 100}%`,
                        background: accent,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="font-mono text-[10px] w-[28px] text-right" style={{ color: accent }}>
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
        <div className="font-display text-[13px] tracking-[2px] font-bold" style={{ color: accent }}>
          {title}
        </div>
        <div className="font-body text-[10px] mt-0.5" style={{ color: c.muted }}>
          {subtitle}
        </div>
      </div>
      {loading && <WidgetSkeleton rows={6} />}
      {error && <WidgetError message="Unable to load data" />}
      {!loading && !error && players.length === 0 && (
        <WidgetEmpty message="No alerts right now" />
      )}
      {!loading && !error && players.length > 0 && (
        <div className="flex flex-col gap-2">
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
      <div className="font-display text-[11px] tracking-[2px] font-bold mb-2" style={{ color: accent, opacity: 0.7 }}>
        {title}
      </div>
      <div className="flex flex-wrap gap-x-1 gap-y-1">
        {players.map((p) => (
          <a
            key={p.slug}
            href={`/players/${p.slug}`}
            className="font-body text-[11px] no-underline hover:underline px-2 py-1"
            style={{
              color: c.text,
              background: `${accent}08`,
              border: `1px solid ${accent}20`,
              borderRadius: 8,
            }}
          >
            {p.name} <span style={{ color: c.muted, fontSize: 9 }}>{p.team}</span>
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
          accent="#00ff87"
          loading={loading}
          error={error}
        />
        <CatalystColumn
          title="OVERVALUED"
          subtitle="Players whose market activity may not be justified by current performance."
          players={filteredSells}
          accent="#ff3b5c"
          loading={loading}
          error={error}
        />
      </div>

      {/* Keep an Eye On — compact watchlist */}
      {!loading && !error && (filteredWatchBuys.length > 0 || filteredWatchSells.length > 0) && (
        <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 24, paddingTop: 20 }}>
          <div className="font-display text-[12px] tracking-[2px] mb-1" style={{ color: c.muted }}>
            KEEP AN EYE ON
          </div>
          <div className="font-body text-[10px] mb-4" style={{ color: c.muted, opacity: 0.7 }}>
            Not strong enough to make our lists yet, but showing early signals worth watching.
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <WatchlistSection title="LEANS BUY" players={filteredWatchBuys} accent="#00ff87" />
            <WatchlistSection title="LEANS SELL" players={filteredWatchSells} accent="#ff3b5c" />
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
