'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';

interface FeedItem {
  id: string;
  type: 'sold' | 'active';
  title: string;
  price: number;
  currency: string;
  playerName: string;
  playerSlug: string;
  league: string;
  date: string;
  imageUrl: string;
  url: string;
  condition: string;
}

interface FeedStats {
  totalSold: number;
  totalActive: number;
  avgSoldPrice: number;
  topSale: number;
  hasLiveData: boolean;
}

interface FeedResponse {
  feed: FeedItem[];
  stats: FeedStats;
  cached: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function FeedRow({ item, colors: c }: { item: FeedItem; colors: Record<string, string> }) {
  const isSold = item.type === 'sold';
  const priceColor = isSold ? c.green : c.cyan;
  const badge = isSold ? 'SOLD' : 'LISTED';
  const badgeBg = isSold ? `${c.green}18` : `${c.cyan}18`;
  const badgeColor = isSold ? c.green : c.cyan;

  const content = (
    <div
      className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
      style={{
        borderRadius: 12,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${c.border}44`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Thumbnail */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="rounded-lg object-cover shrink-0"
          style={{ width: 44, height: 44 }}
        />
      ) : (
        <div
          className="rounded-lg shrink-0 flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            background: `${c.border}60`,
          }}
        >
          <span className="text-sm opacity-40">🃏</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-body text-[11px] font-medium line-clamp-1" style={{ color: c.text }}>
          {item.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-body text-[10px]" style={{ color: c.muted }}>
            {item.playerName}
          </span>
          {item.condition && (
            <span className="font-body text-[9px]" style={{ color: c.muted }}>
              {item.condition}
            </span>
          )}
        </div>
      </div>

      {/* Price + Badge */}
      <div className="shrink-0 text-right">
        <div className="font-display text-sm leading-none" style={{ color: priceColor }}>
          ${item.price.toFixed(2)}
        </div>
        <div className="flex items-center gap-1.5 mt-1 justify-end">
          <span
            className="font-body text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full"
            style={{ color: badgeColor, background: badgeBg }}
          >
            {badge}
          </span>
          <span className="font-body text-[9px]" style={{ color: c.muted }}>
            {formatDate(item.date)}
          </span>
        </div>
      </div>
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline"
      >
        {content}
      </a>
    );
  }

  return (
    <a
      href={`/players/${item.playerSlug}`}
      className="block no-underline"
    >
      {content}
    </a>
  );
}

export default function RecentSales() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sold' | 'active'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/ebay/live-feed?league=${activeLeague}&limit=40`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data: FeedResponse = await res.json();
        setFeed(data.feed || []);
        setStats(data.stats || null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const filtered = filter === 'all'
    ? feed
    : feed.filter((f) => f.type === filter);

  const statsBadge = stats ? (
    <div className="flex items-center gap-2">
      {stats.hasLiveData && (
        <span
          className="font-body text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ color: c.green, background: `${c.green}18` }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: c.green,
              display: 'inline-block',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          LIVE
        </span>
      )}
      <span className="font-body text-[11px]" style={{ color: c.muted }}>
        {stats.totalSold} sold{stats.totalActive > 0 && ` · ${stats.totalActive} listed`}
        {stats.avgSoldPrice > 0 && ` · Avg $${stats.avgSoldPrice.toFixed(0)}`}
      </span>
    </div>
  ) : null;

  const filterTabs = (
    <div className="flex items-center gap-1 mb-3">
      {(['all', 'sold', 'active'] as const).map((f) => {
        const active = filter === f;
        const label = f === 'all' ? 'ALL' : f === 'sold' ? 'SOLD' : 'ACTIVE';
        return (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="font-body text-[9px] tracking-wider uppercase cursor-pointer"
            style={{
              fontWeight: active ? 600 : 500,
              padding: '3px 10px',
              borderRadius: 6,
              color: active ? c.cyan : c.muted,
              background: active ? `${c.cyan}12` : 'transparent',
              border: 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <WidgetShell
      title="MARKET ACTIVITY"
      icon="📊"
      accentColor={c.green}
      badge={statsBadge}
      minContentHeight={200}
    >
      {loading && <WidgetSkeleton rows={4} />}
      {error && <WidgetError message="Unable to load market activity" />}
      {!loading && !error && feed.length === 0 && (
        <WidgetEmpty message="No recent market activity" />
      )}
      {!loading && !error && feed.length > 0 && (
        <>
          {filterTabs}
          <div
            className="flex flex-col gap-0.5 overflow-y-auto"
            style={{ maxHeight: 420, scrollbarWidth: 'thin' }}
          >
            {filtered.slice(0, 20).map((item, idx) => (
              <FeedRow key={`${item.id}-${idx}`} item={item} colors={c} />
            ))}
            {filtered.length === 0 && (
              <div className="py-6 text-center font-body text-xs" style={{ color: c.muted }}>
                No {filter === 'sold' ? 'sold' : 'active'} listings found
              </div>
            )}
          </div>
        </>
      )}
    </WidgetShell>
  );
}
