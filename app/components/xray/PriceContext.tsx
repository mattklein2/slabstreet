// app/components/xray/PriceContext.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import type { PriceComps, SegmentStats, CompListing } from '../../../lib/xray/types';

interface Props {
  priceComps: PriceComps | null;
}

export function PriceContext({ priceComps }: Props) {
  const { colors } = useTheme();
  const [showSecondary, setShowSecondary] = useState(false);

  // ── No data state ──
  if (!priceComps) {
    return (
      <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase' }}>
          Price Context
        </h2>
        <p style={{ marginTop: 12, fontSize: 14, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Not enough data to show price comparisons for this card.
        </p>
      </section>
    );
  }

  const { source, raw, graded, primarySegment, listingPrice, vsMedian, totalCount } = priceComps;
  const primary = primarySegment === 'raw' ? raw : graded;
  const secondary = primarySegment === 'raw' ? graded : raw;
  const primaryLabel = primarySegment === 'raw' ? 'Raw' : 'Graded';
  const secondaryLabel = primarySegment === 'raw' ? 'Graded' : 'Raw';

  const vsColor = vsMedian === null ? colors.muted
    : vsMedian > 15 ? colors.red
    : vsMedian < -15 ? colors.green
    : colors.amber;

  const vsLabel = vsMedian === null ? ''
    : vsMedian > 0 ? `${vsMedian}% above`
    : vsMedian < 0 ? `${Math.abs(vsMedian)}% below`
    : 'at';

  return (
    <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
      {/* Header */}
      <h2 style={{ margin: '0 0 4px', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase' }}>
        Price Context
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {source === 'sold'
          ? `Based on ${totalCount} recent eBay sale${totalCount !== 1 ? 's' : ''}`
          : 'Current asking prices — no recent sales found'}
      </p>

      {/* Active listings warning */}
      {source === 'active' && (
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: `${colors.amber}18`, border: `1px solid ${colors.amber}40`,
          marginBottom: 16, fontSize: 13, color: colors.amber,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          These are asking prices, not actual sales. Prices may not reflect true market value.
        </div>
      )}

      {/* Primary segment */}
      {primary && (
        <StatsBlock
          stats={primary} label={`${primaryLabel} Sales`}
          listingPrice={listingPrice} vsMedian={vsMedian}
          vsColor={vsColor} vsLabel={vsLabel}
          colors={colors} isPrimary
          source={source === 'sold' ? 'sale' : 'listing'}
        />
      )}

      {/* Secondary segment toggle */}
      {secondary && secondary.count > 0 && (
        <>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
              fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}
          >
            {showSecondary ? '▾' : '▸'} {secondaryLabel} Sales ({secondary.count})
          </button>
          {showSecondary && (
            <StatsBlock
              stats={secondary} label={`${secondaryLabel} Sales`}
              listingPrice={listingPrice} vsMedian={null}
              vsColor={colors.muted} vsLabel=""
              colors={colors} isPrimary={false}
              source={source === 'sold' ? 'sale' : 'listing'}
            />
          )}
        </>
      )}
    </section>
  );
}

// ── Stats display block ──

interface StatsBlockProps {
  stats: SegmentStats;
  label: string;
  listingPrice: number;
  vsMedian: number | null;
  vsColor: string;
  vsLabel: string;
  colors: any;
  isPrimary: boolean;
  source: string;
}

function StatsBlock({ stats, label, listingPrice, vsMedian, vsColor, vsLabel, colors, isPrimary, source }: StatsBlockProps) {
  const textScale = isPrimary ? 1 : 0.85;

  // 1 sale: show single sale
  if (stats.count === 1) {
    const sale = stats.listings[0];
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14 * textScale, fontFamily: "'IBM Plex Sans', sans-serif", color: colors.secondary, margin: '0 0 8px' }}>
          Last sold for{' '}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: colors.text }}>
            ${sale.price.toFixed(2)}
          </span>
          {sale.date && ` on ${sale.date}`}
          {sale.gradeInfo && ` (${sale.gradeInfo.grader} ${sale.gradeInfo.grade})`}
        </p>
        {isPrimary && vsMedian !== null && (
          <VsStatement vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} count={1} colors={colors} source={source} />
        )}
      </div>
    );
  }

  // 2-4 sales: show each individually
  if (stats.count <= 4) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {stats.listings.map((sale, i) => (
            <SaleRow key={i} sale={sale} colors={colors} textScale={textScale} />
          ))}
        </div>
        <p style={{ fontSize: 13 * textScale, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif", margin: 0 }}>
          Range: ${stats.low.toFixed(2)} – ${stats.high.toFixed(2)}
        </p>
        {isPrimary && vsMedian !== null && (
          <VsStatement vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} count={stats.count} colors={colors} source={source} />
        )}
      </div>
    );
  }

  // 5+ sales: full stats view
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          { label: 'This Listing', value: `$${listingPrice.toFixed(2)}`, color: colors.text },
          { label: 'Sold Median', value: `$${stats.median.toFixed(2)}`, color: colors.cyan },
          { label: 'Low', value: `$${stats.low.toFixed(2)}`, color: colors.green },
          { label: 'High', value: `$${stats.high.toFixed(2)}`, color: colors.red },
        ].map(stat => (
          <div key={stat.label} style={{ minWidth: 80 }}>
            <div style={{ fontSize: 11 * textScale, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 20 * textScale, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {isPrimary && vsMedian !== null && (
        <VsStatement vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} count={stats.count} colors={colors} source={source} />
      )}

      {/* Recent sales list */}
      <h3 style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '12px 0 8px' }}>
        Recent Sales ({stats.count})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stats.listings.slice(0, 8).map((sale, i) => (
          <SaleRow key={i} sale={sale} colors={colors} textScale={1} />
        ))}
      </div>
    </div>
  );
}

// ── Sale row component ──

function SaleRow({ sale, colors, textScale }: { sale: CompListing; colors: any; textScale: number }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', borderRadius: 8, background: `${colors.border}40`,
        gap: 12,
      }}
    >
      <span style={{
        fontSize: 13 * textScale, fontFamily: "'IBM Plex Sans', sans-serif",
        color: colors.secondary, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', flex: 1,
      }}>
        {sale.title}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {sale.gradeInfo && (
          <span style={{
            fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            color: colors.cyan, border: `1px solid ${colors.cyan}40`,
            background: `${colors.cyan}15`, padding: '1px 5px', borderRadius: 4,
          }}>
            {sale.gradeInfo.grader} {sale.gradeInfo.grade}
          </span>
        )}
        {sale.date && (
          <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted, minWidth: 60 }}>
            {sale.date}
          </span>
        )}
        <span style={{
          fontSize: 14 * textScale, fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600, color: colors.text, minWidth: 70, textAlign: 'right',
        }}>
          ${sale.price.toFixed(2)}
        </span>
      </span>
    </div>
  );
}

// ── vs Market statement ──

function VsStatement({ vsMedian, vsColor, vsLabel, count, colors, source }: {
  vsMedian: number; vsColor: string; vsLabel: string; count: number; colors: any; source: string;
}) {
  return (
    <p style={{ fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", color: colors.secondary, margin: '8px 0 0' }}>
      This listing is{' '}
      <span style={{ color: vsColor, fontWeight: 600 }}>{vsLabel} median</span>
      {' '}based on {count} recent {source}{count !== 1 ? 's' : ''}.
    </p>
  );
}
