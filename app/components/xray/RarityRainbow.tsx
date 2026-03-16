// app/components/xray/RarityRainbow.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import { getRarityLevel, getRarityColorKey } from '../../../lib/rarity';
import { formatPrintRun } from '../../../lib/format';
import { getParallelPattern } from '../../../lib/parallel-patterns';
import type { RainbowEntry, MatchedProduct } from '../../../lib/xray/types';

interface Props {
  rainbow: RainbowEntry[];
  product: MatchedProduct | null;
  cardSetName?: string;
  cardSetType?: string;
  cardSetOdds?: string | null;
  cardSetDescription?: string | null;
  isInsertFallback?: boolean;
  onParallelSelect?: (parallelId: string) => void;
}

function RainbowRow({ entry, totalParallels, isClickable, onSelect, colors }: {
  entry: RainbowEntry;
  totalParallels: number;
  isClickable: boolean;
  onSelect?: (parallelId: string) => void;
  colors: any;
}) {
  const [hovered, setHovered] = useState(false);
  const level = getRarityLevel(entry.rarityRank, totalParallels, entry.isOneOfOne);
  const colorKey = getRarityColorKey(level) as keyof typeof colors;
  const rarityColor = colors[colorKey];
  const pattern = getParallelPattern(entry.name, entry.colorHex, colors.muted);

  return (
    <div
      onClick={isClickable && !entry.isCurrentCard ? () => onSelect?.(entry.parallelId) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 8,
        background: entry.isCurrentCard
          ? `${colors.green}12`
          : hovered && isClickable ? `${colors.green}08` : 'transparent',
        border: entry.isCurrentCard ? `1px solid ${colors.green}40` : '1px solid transparent',
        cursor: isClickable && !entry.isCurrentCard ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      {/* Mini card swatch: border color + interior pattern */}
      <div style={{
        width: 32,
        height: 22,
        borderRadius: 3,
        overflow: 'hidden',
        flexShrink: 0,
        border: pattern.hasDistinctBorder
          ? `2.5px solid ${pattern.borderColor}`
          : `1px solid ${colors.border}`,
        boxShadow: pattern.boxShadow || 'none',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: pattern.background,
          backgroundSize: pattern.backgroundSize,
          backgroundBlendMode: pattern.backgroundBlendMode as React.CSSProperties['backgroundBlendMode'],
        }} />
      </div>

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
}

export function RarityRainbow({ rainbow, product, cardSetName, cardSetType, cardSetOdds, cardSetDescription, isInsertFallback, onParallelSelect }: Props) {
  const { colors } = useTheme();

  const isInsert = cardSetType === 'insert' || cardSetType === 'subset';

  // Insert with no parallels at all (not even a fallback rainbow)
  if (rainbow.length === 0 && isInsert) {
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
          Insert Rarity
        </h2>
        <p style={{
          margin: '8px 0 0',
          fontSize: 14,
          color: colors.text,
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.6,
        }}>
          {cardSetName} is a single-version insert — no parallel variants exist.{' '}
          {cardSetDescription && <span style={{ color: colors.secondary }}>{cardSetDescription}</span>}
        </p>
        {cardSetOdds && (
          <p style={{
            margin: '8px 0 0',
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.amber,
          }}>
            Pull odds: {cardSetOdds}
          </p>
        )}
      </section>
    );
  }

  if (rainbow.length === 0) return null;

  // Show rarest at top (rank 1 = rarest)
  const sorted = [...rainbow].sort((a, b) => a.rarityRank - b.rarityRank);
  const totalParallels = sorted.length;
  const currentIdx = sorted.findIndex(r => r.isCurrentCard);

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      {/* Insert rarity context — shown above rainbow when it's an insert with fallback base parallels */}
      {isInsertFallback && isInsert && (
        <>
          <h2 style={{
            margin: '0 0 4px',
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: 1,
            color: colors.green,
            textTransform: 'uppercase',
          }}>
            Insert Rarity
          </h2>
          <p style={{
            margin: '8px 0 0',
            fontSize: 14,
            color: colors.text,
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.6,
          }}>
            {cardSetName} has no parallel variants of its own — this is the only version.{' '}
            {cardSetDescription && <span style={{ color: colors.secondary }}>{cardSetDescription}</span>}
          </p>
          {cardSetOdds && (
            <p style={{
              margin: '8px 0 0',
              fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
              color: colors.amber,
            }}>
              Pull odds: {cardSetOdds}
            </p>
          )}
          <hr style={{
            border: 'none',
            borderTop: `1px solid ${colors.border}`,
            margin: '16px 0',
          }} />
          <p style={{
            margin: '0 0 4px',
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: 1,
            color: colors.muted,
            textTransform: 'uppercase',
          }}>
            Base Set Parallels
          </p>
          <p style={{
            margin: '0 0 16px',
            fontSize: 13,
            color: colors.secondary,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            For reference — here are the {totalParallels} parallels in the {product?.productName} base set.
          </p>
        </>
      )}

      {!isInsertFallback && (
        <>
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
              margin: '0 0 4px',
              fontSize: 14,
              color: colors.secondary,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              {product.productName} {product.year} — {cardSetName && cardSetType !== 'base' ? `${cardSetName} Insert — ` : ''}{totalParallels} parallels
              {currentIdx >= 0 && (
                <span style={{
                  display: 'inline-block',
                  marginLeft: 8,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 700,
                  color: colors.green,
                  background: `${colors.green}18`,
                  border: `1px solid ${colors.green}40`,
                }}>
                  #{sorted[currentIdx].rarityRank} of {totalParallels} in rarity
                </span>
              )}
            </p>
          )}

          {onParallelSelect && (
            <p style={{
              margin: '0 0 16px',
              fontSize: 12,
              color: colors.muted,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              Tap any parallel if ours isn&apos;t right
            </p>
          )}

          {!onParallelSelect && <div style={{ marginBottom: 16 }} />}
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sorted.map((entry, i) => (
          <RainbowRow
            key={`${entry.parallelId}-${i}`}
            entry={entry}
            totalParallels={totalParallels}
            isClickable={!!onParallelSelect && !isInsertFallback}
            onSelect={onParallelSelect}
            colors={colors}
          />
        ))}
      </div>

      {/* Box exclusivity note */}
      {sorted.some(r => r.isCurrentCard && r.boxExclusivity?.length) && (
        <p style={{
          marginTop: 12,
          fontSize: 13,
          color: colors.secondary,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontStyle: 'italic',
        }}>
          This parallel is exclusive to: {
            sorted.find(r => r.isCurrentCard)?.boxExclusivity?.join(', ')
          }
        </p>
      )}
    </section>
  );
}
