'use client';

import { useState, useEffect, use } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

type CardDetail = {
  id: string;
  player_slug: string;
  year: number;
  set_name: string;
  parallel: string;
  card_number: string;
  numbered_to: number | null;
  league: string;
  image_url: string | null;
  cardladder_slug: string | null;
  slug: string;
};

type Sale = {
  price: number;
  date: string;
  platform: string;
  imageUrl: string | null;
  listingUrl: string | null;
};

type GradeStats = {
  grade: string;
  avg: number;
  count: number;
  latest: number;
};

type CardData = {
  card: CardDetail;
  sales: Record<string, Sale[]>;
  stats: {
    totalSales: number;
    avgPrice: number;
    lastSale: { price: number; date: string; grade: string } | null;
    priceByGrade: GradeStats[];
  };
};

const GRADE_COLORS: Record<string, string> = {
  'PSA 10': '#00ff87',
  'PSA 9': '#38bdf8',
  'BGS 9.5': '#a78bfa',
  'BGS 10': '#f59e0b',
  'SGC 10': '#fb923c',
  'Raw': '#8899aa',
};

function getGradeColor(grade: string): string {
  return GRADE_COLORS[grade] || `hsl(${Math.abs(hashCode(grade)) % 360}, 70%, 60%)`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

function formatCardTitle(card: CardDetail): string {
  const parts = [String(card.year), card.set_name];
  if (card.parallel && card.parallel !== 'Base') parts.push(card.parallel);
  if (card.card_number) parts.push(`#${card.card_number}`);
  return parts.join(' ');
}

function formatPlayerName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { colors: c } = useTheme();
  const [data, setData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/cards/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: c.muted }}>
        <div className="font-body text-sm">Loading card details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: c.muted }}>
        <div className="text-center">
          <div className="font-display text-4xl mb-2" style={{ opacity: 0.2 }}>🃏</div>
          <div className="font-body text-sm">Card not found</div>
          <a href="/" className="font-body text-xs mt-2 inline-block" style={{ color: c.green }}>Back to home</a>
        </div>
      </div>
    );
  }

  const { card, sales, stats } = data;
  const grades = Object.keys(sales);

  // Build chart data: merge all grades into timeline
  const chartData = buildChartData(sales);

  return (
    <div className="min-h-screen" style={{ color: c.text }}>
      <main className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-16 py-8">
        {/* Breadcrumb */}
        <div className="font-body text-xs mb-6" style={{ color: c.muted }}>
          <a href="/" style={{ color: c.muted, textDecoration: 'none' }}>Home</a>
          {' / '}
          <a href={`/search?q=${encodeURIComponent(formatPlayerName(card.player_slug))}`} style={{ color: c.muted, textDecoration: 'none' }}>
            {formatPlayerName(card.player_slug)}
          </a>
          {' / '}
          <span style={{ color: c.text }}>{formatCardTitle(card)}</span>
        </div>

        {/* Hero: Image + Card Info */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {/* Card image */}
          <div className="lg:w-[350px] shrink-0">
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                aspectRatio: '2.5/3.5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={formatCardTitle(card)}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 80, opacity: 0.1 }}>🃏</span>
              )}
            </div>
          </div>

          {/* Card info */}
          <div className="flex-1 min-w-0">
            <div className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: c.green }}>
              {card.league}
            </div>
            <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-2" style={{ color: c.text }}>
              {formatCardTitle(card)}
            </h1>
            <a
              href={`/players/${card.player_slug}`}
              className="font-body text-lg no-underline hover:underline"
              style={{ color: c.muted }}
            >
              {formatPlayerName(card.player_slug)}
            </a>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <StatBox label="Total Sales" value={String(stats.totalSales)} color={c} />
              <StatBox label="Avg Price" value={stats.avgPrice > 0 ? `$${stats.avgPrice.toFixed(0)}` : 'N/A'} color={c} />
              <StatBox
                label="Last Sale"
                value={stats.lastSale ? `$${stats.lastSale.price.toFixed(0)}` : 'N/A'}
                sub={stats.lastSale ? `${stats.lastSale.grade} · ${formatDate(stats.lastSale.date)}` : ''}
                color={c}
              />
              <StatBox label="Print Run" value={card.numbered_to ? `/${card.numbered_to}` : 'Unlimited'} color={c} />
            </div>

            {/* Price by grade */}
            {stats.priceByGrade.length > 0 && (
              <div className="mt-6">
                <div className="font-body text-xs uppercase tracking-widest mb-3" style={{ color: c.muted }}>
                  Price by Grade
                </div>
                <div className="flex flex-wrap gap-3">
                  {stats.priceByGrade.map(g => (
                    <div
                      key={g.grade}
                      className="rounded px-4 py-3"
                      style={{
                        background: c.surface,
                        border: `1px solid ${c.border}`,
                        borderLeft: `3px solid ${getGradeColor(g.grade)}`,
                      }}
                    >
                      <div className="font-mono text-[10px] mb-1" style={{ color: getGradeColor(g.grade) }}>
                        {g.grade}
                      </div>
                      <div className="font-display text-xl" style={{ color: c.text }}>
                        ${g.latest.toFixed(0)}
                      </div>
                      <div className="font-body text-[10px]" style={{ color: c.muted }}>
                        avg ${g.avg.toFixed(0)} · {g.count} sales
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price chart */}
        {chartData.length > 0 && (
          <div
            className="rounded-lg p-6 mb-8"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
          >
            <div className="font-body text-xs uppercase tracking-widest mb-4" style={{ color: c.muted }}>
              Price History
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: c.muted }}
                  tickLine={false}
                  axisLine={{ stroke: c.border }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: c.muted }}
                  tickLine={false}
                  axisLine={{ stroke: c.border }}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  labelStyle={{ color: c.muted }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
                />
                {grades.map(grade => (
                  <Line
                    key={grade}
                    type="monotone"
                    dataKey={grade}
                    stroke={getGradeColor(grade)}
                    strokeWidth={2}
                    dot={{ r: 3, fill: getGradeColor(grade) }}
                    connectNulls
                    name={grade}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent sales table */}
        {stats.totalSales > 0 && (
          <div
            className="rounded-lg overflow-hidden mb-8"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
          >
            <div className="px-6 py-4">
              <div className="font-body text-xs uppercase tracking-widest" style={{ color: c.muted }}>
                Recent Sales
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
                    <th className="font-body text-[10px] uppercase tracking-wider text-left px-6 py-3" style={{ color: c.muted }}>Date</th>
                    <th className="font-body text-[10px] uppercase tracking-wider text-left px-6 py-3" style={{ color: c.muted }}>Grade</th>
                    <th className="font-body text-[10px] uppercase tracking-wider text-right px-6 py-3" style={{ color: c.muted }}>Price</th>
                    <th className="font-body text-[10px] uppercase tracking-wider text-left px-6 py-3" style={{ color: c.muted }}>Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sales).flatMap(([grade, salesArr]) =>
                    salesArr.map((sale, i) => ({ ...sale, grade, key: `${grade}-${i}` }))
                  )
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 30)
                    .map(sale => (
                      <tr key={sale.key} style={{ borderBottom: `1px solid ${c.border}` }}>
                        <td className="font-mono text-xs px-6 py-3" style={{ color: c.text }}>
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className="font-mono text-[10px] px-2 py-0.5 rounded"
                            style={{
                              color: getGradeColor(sale.grade),
                              background: `${getGradeColor(sale.grade)}15`,
                              border: `1px solid ${getGradeColor(sale.grade)}33`,
                            }}
                          >
                            {sale.grade}
                          </span>
                        </td>
                        <td className="font-mono text-sm text-right px-6 py-3" style={{ color: c.green }}>
                          ${sale.price.toFixed(2)}
                        </td>
                        <td className="font-body text-xs px-6 py-3" style={{ color: c.muted }}>
                          {sale.listingUrl ? (
                            <a href={sale.listingUrl} target="_blank" rel="noopener noreferrer" style={{ color: c.cyan, textDecoration: 'none' }}>
                              {sale.platform}
                            </a>
                          ) : sale.platform}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, sub, color: c }: { label: string; value: string; sub?: string; color: Record<string, string> }) {
  return (
    <div
      className="rounded-md p-4"
      style={{ background: c.surface, border: `1px solid ${c.border}` }}
    >
      <div className="font-body text-[10px] uppercase tracking-wider mb-1" style={{ color: c.muted }}>
        {label}
      </div>
      <div className="font-display text-xl" style={{ color: c.text }}>
        {value}
      </div>
      {sub && (
        <div className="font-body text-[10px] mt-0.5" style={{ color: c.muted }}>{sub}</div>
      )}
    </div>
  );
}

function buildChartData(sales: Record<string, Sale[]>): Record<string, unknown>[] {
  // Collect all dates with their grade prices
  const dateMap = new Map<string, Record<string, number>>();

  for (const [grade, salesArr] of Object.entries(sales)) {
    for (const sale of salesArr) {
      const dateKey = sale.date.slice(0, 10); // YYYY-MM-DD
      if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
      const entry = dateMap.get(dateKey)!;
      // If multiple sales on same day for same grade, average them
      if (entry[grade]) {
        entry[grade] = (entry[grade] + sale.price) / 2;
      } else {
        entry[grade] = sale.price;
      }
    }
  }

  // Sort by date and format
  return [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, grades]) => ({
      date: formatShortDate(date),
      ...grades,
    }));
}
