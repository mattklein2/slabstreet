'use client';

import { useTheme } from '../ThemeProvider';
import { ExpandableSection } from '../shared/ExpandableSection';
import { RarityBadge } from '../shared/RarityBadge';
import { ParallelSwatch } from '../decoder/ParallelSwatch';
import { formatConfigType, formatPrice, formatPrintRun, BOX_TYPE_DESCRIPTIONS } from '../../../lib/format';
import type { ScoutBoxDetail, ScoutProduct } from '../../../lib/types';

interface BoxDetailProps {
  detail: ScoutBoxDetail;
  product: ScoutProduct;
}

export function BoxDetail({ detail, product }: BoxDetailProps) {
  const { colors } = useTheme();
  const { boxConfig, parallels, bigGameHunting, inserts, totalParallels } = detail;
  const typeInfo = BOX_TYPE_DESCRIPTIONS[boxConfig.configType];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '12px 0' }}>

      {/* Box Header */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'center',
        padding: 16, background: colors.surface, borderRadius: 14,
        border: `1px solid ${colors.border}`,
      }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 8, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>📦</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>{product.name}</div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {product.year} · {product.brandName} · {formatConfigType(boxConfig.configType)}
          </div>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: colors.green, flexShrink: 0 }}>
          {formatPrice(boxConfig.retailPriceUsd)}
        </div>
      </div>

      {/* What's Inside — stats grid */}
      <div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          What&apos;s Inside
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Packs', value: boxConfig.packsPerBox },
            { label: 'Cards/Pack', value: boxConfig.cardsPerPack },
            { label: 'Total Cards', value: boxConfig.packsPerBox * boxConfig.cardsPerPack },
          ].map(item => (
            <div key={item.label} style={{ padding: 10, background: colors.surface, borderRadius: 10, textAlign: 'center', border: `1px solid ${colors.border}` }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Guaranteed Hits */}
      <div style={{
        padding: '12px 16px',
        background: colors.surface,
        borderRadius: 10,
        borderLeft: `3px solid ${boxConfig.guaranteedHits ? colors.green : colors.muted}`,
      }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
          Guaranteed Hits
        </div>
        {boxConfig.guaranteedHits ? (
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.green }}>{boxConfig.guaranteedHits}</div>
        ) : (
          <div style={{ fontSize: 13, color: colors.secondary }}>
            No guaranteed hits — retail boxes rely on luck. The chase is the inserts and numbered parallels.
          </div>
        )}
        {(boxConfig.oddsAuto || boxConfig.oddsRelic || boxConfig.oddsNumbered) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            {boxConfig.oddsAuto && (
              <div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted }}>AUTO </span>
                <span style={{ fontSize: 12, color: colors.text }}>{boxConfig.oddsAuto}</span>
              </div>
            )}
            {boxConfig.oddsRelic && (
              <div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted }}>RELIC </span>
                <span style={{ fontSize: 12, color: colors.text }}>{boxConfig.oddsRelic}</span>
              </div>
            )}
            {boxConfig.oddsNumbered && (
              <div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted }}>NUMBERED </span>
                <span style={{ fontSize: 12, color: colors.text }}>{boxConfig.oddsNumbered}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Box Type Explainer */}
      {typeInfo && (
        <div style={{ padding: '12px 16px', background: colors.surface, borderRadius: 10, border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
            What is a {typeInfo.name}?
          </div>
          <div style={{ fontSize: 13, color: colors.secondary, lineHeight: 1.6 }}>
            {typeInfo.description}
          </div>
        </div>
      )}

      {/* Big Game Hunting */}
      {bigGameHunting.length > 0 && (
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            Big Game Hunting
          </div>
          <div style={{ fontSize: 12, color: colors.secondary, marginBottom: 10 }}>
            The rarest cards you could pull from this box
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bigGameHunting.map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: colors.surface,
                border: `1px solid ${p.isOneOfOne ? colors.green + '60' : colors.border}`,
                borderRadius: 10,
              }}>
                <ParallelSwatch name={p.name} colorHex={p.colorHex} size={32} borderRadius={6} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: p.isOneOfOne ? colors.green : colors.muted }}>
                      {formatPrintRun(p.printRun)}
                    </span>
                    {p.isExclusive && (
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: (colors.amber || '#F59E0B') + '20', color: colors.amber || '#F59E0B' }}>
                        EXCLUSIVE
                      </span>
                    )}
                  </div>
                </div>
                <RarityBadge rarityRank={p.rarityRank} totalParallels={totalParallels} isOneOfOne={p.isOneOfOne} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Parallels */}
      {parallels.length > 0 && (
        <ExpandableSection title={`All Parallels (${parallels.length} of ${totalParallels})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {parallels.sort((a, b) => b.rarityRank - a.rarityRank).map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <ParallelSwatch name={p.name} colorHex={p.colorHex} size={24} borderRadius={4} />
                <div style={{ flex: 1, fontSize: 13, color: colors.text }}>{p.name}</div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted }}>
                  {formatPrintRun(p.printRun)}
                </span>
                {p.isExclusive && (
                  <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: (colors.amber || '#F59E0B') + '20', color: colors.amber || '#F59E0B' }}>
                    EXCL
                  </span>
                )}
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Insert Sets */}
      {inserts.length > 0 && (
        <ExpandableSection title={`Insert Sets (${inserts.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inserts.map((ins) => (
              <div key={ins.name} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>{ins.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    {ins.isAutographed && <span style={{ fontSize: 10, color: colors.green }}>AUTO</span>}
                    {ins.isMemorabilia && <span style={{ fontSize: 10, color: colors.cyan || '#67e8f9' }}>RELIC</span>}
                  </div>
                </div>
                {ins.odds && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted }}>
                    {ins.odds}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}
    </div>
  );
}
