// app/components/xray/RarityRainbow.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { getRarityLevel, getRarityColorKey } from '../../../lib/rarity';
import { formatPrintRun } from '../../../lib/format';
import type { RainbowEntry, MatchedProduct } from '../../../lib/xray/types';

interface Props {
  rainbow: RainbowEntry[];
  product: MatchedProduct | null;
}

export function RarityRainbow({ rainbow, product }: Props) {
  const { colors } = useTheme();

  if (rainbow.length === 0) return null;

  const totalParallels = rainbow.length;
  const currentIdx = rainbow.findIndex(r => r.isCurrentCard);

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 4px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        Rarity Rainbow
      </h2>

      {product && (
        <p style={{
          margin: '0 0 16px',
          fontSize: 13,
          color: colors.muted,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {product.productName} {product.year} — {totalParallels} parallels
          {currentIdx >= 0 && ` — this card is #${currentIdx + 1} of ${totalParallels}`}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rainbow.map((entry, i) => {
          const level = getRarityLevel(entry.rarityRank, totalParallels, entry.isOneOfOne);
          const colorKey = getRarityColorKey(level) as keyof typeof colors;
          const rarityColor = colors[colorKey];

          return (
            <div
              key={`${entry.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                background: entry.isCurrentCard ? `${colors.green}12` : 'transparent',
                border: entry.isCurrentCard ? `1px solid ${colors.green}40` : '1px solid transparent',
              }}
            >
              {/* Color swatch */}
              <div style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: entry.colorHex || colors.muted,
                border: `1px solid ${colors.border}`,
                flexShrink: 0,
              }} />

              {/* Name */}
              <span style={{
                flex: 1,
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: entry.isCurrentCard ? colors.green : colors.text,
                fontWeight: entry.isCurrentCard ? 600 : 400,
              }}>
                {entry.name}
                {entry.isCurrentCard && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 11,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: colors.green,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}>
                    YOU ARE HERE
                  </span>
                )}
              </span>

              {/* Print run */}
              <span style={{
                fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                color: colors.muted,
                minWidth: 60,
                textAlign: 'right',
              }}>
                {formatPrintRun(entry.printRun)}
              </span>

              {/* Rarity badge */}
              <span style={{
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: rarityColor,
                border: `1px solid ${rarityColor}`,
                background: `${rarityColor}15`,
                padding: '2px 6px',
                borderRadius: 999,
                minWidth: 60,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {level}
              </span>
            </div>
          );
        })}
      </div>

      {/* Box exclusivity note */}
      {rainbow.some(r => r.isCurrentCard && r.boxExclusivity?.length) && (
        <p style={{
          marginTop: 12,
          fontSize: 13,
          color: colors.secondary,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontStyle: 'italic',
        }}>
          This parallel is exclusive to: {
            rainbow.find(r => r.isCurrentCard)?.boxExclusivity?.join(', ')
          }
        </p>
      )}
    </section>
  );
}
