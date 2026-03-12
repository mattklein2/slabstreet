'use client';

import { useTheme } from '../ThemeProvider';
import { ExpandableSection } from '../shared/ExpandableSection';
import { formatConfigType, formatPrice } from '../../../lib/format';
import type { BoxResult } from '../../../lib/types';

interface BoxCardProps {
  result: BoxResult;
}

export function BoxCard({ result }: BoxCardProps) {
  const { colors } = useTheme();
  const { product, boxConfig, retailer } = result;

  const allPros = [...(product.prosCons?.pros || []), ...(boxConfig.prosCons?.pros || [])];
  const allCons = [...(product.prosCons?.cons || []), ...(boxConfig.prosCons?.cons || [])];

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${product.isFlagship ? colors.green + '60' : colors.border}`,
      borderRadius: 14, padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
            {product.isFlagship && <span style={{ color: colors.amber, marginRight: 4 }}>★</span>}
            {product.name}
          </div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {product.year} · {formatConfigType(boxConfig.configType)}
          </div>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: colors.green }}>
          {formatPrice(boxConfig.retailPriceUsd)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Packs', value: boxConfig.packsPerBox },
          { label: 'Cards/Pack', value: boxConfig.cardsPerPack },
          { label: 'Hits', value: boxConfig.guaranteedHits || 'None guaranteed' },
        ].map((item) => (
          <div key={item.label} style={{ padding: '8px', background: colors.bg, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginTop: 2 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {(allPros.length > 0 || allCons.length > 0) && (
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          {allPros.map((pro, i) => (<div key={`pro-${i}`} style={{ color: colors.green }}>+ {pro}</div>))}
          {allCons.map((con, i) => (<div key={`con-${i}`} style={{ color: colors.red }}>- {con}</div>))}
        </div>
      )}

      {retailer && (
        <div style={{ fontSize: 12, color: colors.muted }}>
          Available at {retailer.name}{retailer.notes ? ` · ${retailer.notes}` : ''}
        </div>
      )}

      <ExpandableSection title="What does this mean?">
        <p>
          {boxConfig.configType === 'blaster'
            ? "A blaster box is the most common box type at big retailers like Walmart and Target. Usually $25-30, they contain several packs and are a great entry point for new collectors."
            : boxConfig.configType === 'hobby_box'
              ? "A hobby box is the premium option — sold at card shops and online retailers. More expensive, but you're guaranteed hits (autographs, relics, or numbered cards)."
              : boxConfig.configType === 'mega_box'
                ? "A mega box is a step up from a blaster — more packs and sometimes exclusive parallels. Usually found at big retail stores."
                : `This is a ${formatConfigType(boxConfig.configType).toLowerCase()}.`
          }
        </p>
      </ExpandableSection>

      {(boxConfig.oddsAuto || boxConfig.oddsRelic || boxConfig.oddsNumbered) && (
        <ExpandableSection title="Odds & details">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {boxConfig.oddsAuto && <div>Auto: {boxConfig.oddsAuto}</div>}
            {boxConfig.oddsRelic && <div>Relic: {boxConfig.oddsRelic}</div>}
            {boxConfig.oddsNumbered && <div>Numbered: {boxConfig.oddsNumbered}</div>}
          </div>
        </ExpandableSection>
      )}
    </div>
  );
}
