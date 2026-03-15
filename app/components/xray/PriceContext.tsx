// app/components/xray/PriceContext.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import type { PriceComps } from '../../../lib/xray/types';

interface Props {
  priceComps: PriceComps | null;
}

export function PriceContext({ priceComps }: Props) {
  const { colors } = useTheme();

  if (!priceComps) {
    return (
      <section style={{
        background: colors.surface,
        borderRadius: 14,
        padding: 24,
        marginBottom: 16,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 14,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          letterSpacing: 1,
          color: colors.green,
          textTransform: 'uppercase',
        }}>
          Price Context
        </h2>
        <p style={{
          marginTop: 12,
          fontSize: 14,
          color: colors.muted,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          Not enough data to show price comparisons for this card.
        </p>
      </section>
    );
  }

  const { stats, listingPrice, vsMedian, compListings } = priceComps;

  const vsColor = vsMedian === null
    ? colors.muted
    : vsMedian > 15
      ? colors.red
      : vsMedian < -15
        ? colors.green
        : colors.amber;

  const vsLabel = vsMedian === null
    ? ''
    : vsMedian > 0
      ? `${vsMedian}% above`
      : vsMedian < 0
        ? `${Math.abs(vsMedian)}% below`
        : 'at';

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 16px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        Price Context
      </h2>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}>
        {[
          { label: 'This Listing', value: `$${listingPrice.toFixed(2)}`, color: colors.text },
          { label: 'Median', value: `$${stats.median.toFixed(2)}`, color: colors.cyan },
          { label: 'Low', value: `$${stats.low.toFixed(2)}`, color: colors.green },
          { label: 'High', value: `$${stats.high.toFixed(2)}`, color: colors.red },
        ].map(stat => (
          <div key={stat.label} style={{ minWidth: 80 }}>
            <div style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 20,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              color: stat.color,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* vs Median statement */}
      {vsMedian !== null && (
        <p style={{
          fontSize: 14,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: colors.secondary,
          margin: '0 0 16px',
        }}>
          This listing is{' '}
          <span style={{ color: vsColor, fontWeight: 600 }}>
            {vsLabel} median
          </span>
          {' '}based on {stats.count} similar listing{stats.count !== 1 ? 's' : ''}.
        </p>
      )}

      {/* Recent listings */}
      {compListings.length > 0 && (
        <div>
          <h3 style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            margin: '0 0 8px',
          }}>
            Similar Listings ({compListings.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {compListings.slice(0, 5).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: `${colors.border}40`,
                  textDecoration: 'none',
                  gap: 12,
                }}
              >
                <span style={{
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: colors.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {item.title}
                </span>
                <span style={{
                  fontSize: 14,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  color: colors.text,
                  flexShrink: 0,
                }}>
                  ${item.price.toFixed(2)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
