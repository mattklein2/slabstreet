'use client';

import { useTheme } from '../ThemeProvider';
import { RarityBadge } from '../shared/RarityBadge';
import { ExpandableSection } from '../shared/ExpandableSection';
import { formatPrintRun } from '../../../lib/format';
import { getRarityLevel } from '../../../lib/rarity';
import type { ParallelItem } from '../../../lib/types';

interface DecoderResultProps {
  parallel: ParallelItem;
  allParallels: ParallelItem[];
  productName: string;
  productYear: string;
}

export function DecoderResult({ parallel, allParallels, productName, productYear }: DecoderResultProps) {
  const { colors } = useTheme();
  const level = getRarityLevel(parallel.rarityRank, parallel.totalParallels, parallel.isOneOfOne);

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: parallel.colorHex || colors.muted,
          border: `1px solid ${colors.border}`, flexShrink: 0,
        }} />
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: colors.text }}>{parallel.name}</h2>
          <p style={{ fontSize: 13, color: colors.muted, margin: '2px 0 0' }}>{productName} {productYear}</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <RarityBadge rarityRank={parallel.rarityRank} totalParallels={parallel.totalParallels} isOneOfOne={parallel.isOneOfOne} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Print Run', value: formatPrintRun(parallel.printRun) },
          { label: 'Rarity', value: `${parallel.rarityRank} of ${parallel.totalParallels}` },
          { label: 'Serial Numbered', value: parallel.serialNumbered ? 'Yes' : 'No' },
          { label: 'Type', value: level },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '10px 12px', background: colors.surface,
            borderRadius: 10, border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Rarity bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 6 }}>RARITY POSITION</div>
        <div style={{ height: 8, background: colors.surface, borderRadius: 4, border: `1px solid ${colors.border}`, position: 'relative', overflow: 'visible' }}>
          <div style={{
            position: 'absolute',
            left: `${(parallel.rarityRank / parallel.totalParallels) * 100}%`,
            top: -2, width: 12, height: 12, borderRadius: '50%',
            background: colors.green, transform: 'translateX(-50%)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.muted, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span>Common</span><span>1/1</span>
        </div>
      </div>

      <ExpandableSection title="What does this mean?">
        <p>
          {parallel.isOneOfOne
            ? `This is a 1-of-1 card — only one exists in the entire world. It's the rarest type of card you can pull.`
            : parallel.printRun
              ? `Only ${parallel.printRun} of these cards were printed. ${parallel.serialNumbered ? 'Each one is stamped with a unique number.' : ''} Out of ${parallel.totalParallels} different parallel versions of this card, yours is #${parallel.rarityRank} in rarity.`
              : `This parallel has an unlimited print run — there's no set number that were made. It ranks ${parallel.rarityRank} out of ${parallel.totalParallels} parallels in terms of rarity for this product.`
          }
        </p>
        {parallel.description && <p style={{ marginTop: 8 }}>{parallel.description}</p>}
      </ExpandableSection>

      <ExpandableSection title="Full rarity hierarchy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {allParallels.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6,
              background: p.id === parallel.id ? `${colors.green}15` : 'transparent',
              border: p.id === parallel.id ? `1px solid ${colors.green}40` : '1px solid transparent',
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: p.colorHex || colors.muted, flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1, color: p.id === parallel.id ? colors.green : colors.text }}>{p.name}</span>
              <span style={{ fontSize: 11, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{formatPrintRun(p.printRun)}</span>
              {p.id === parallel.id && <span style={{ fontSize: 10, color: colors.green, fontWeight: 600 }}>YOU</span>}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}
