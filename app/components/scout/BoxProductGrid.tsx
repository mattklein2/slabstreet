'use client';

import { useTheme } from '../ThemeProvider';
import { Skeleton } from '../shared/Skeleton';
import { formatConfigType } from '../../../lib/format';
import type { ScoutProduct } from '../../../lib/types';

interface BoxProductGridProps {
  products: ScoutProduct[];
  loading: boolean;
  onSelect: (product: ScoutProduct) => void;
}

export function BoxProductGrid({ products, loading, onSelect }: BoxProductGridProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '12px 0' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={200} borderRadius={14} />
        ))}
      </div>
    );
  }

  // Group by year
  const grouped = new Map<string, ScoutProduct[]>();
  for (const p of products) {
    const list = grouped.get(p.year) || [];
    list.push(p);
    grouped.set(p.year, list);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '12px 0' }}>
      {[...grouped.entries()].map(([year, items]) => (
        <div key={year}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: colors.muted,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 8,
          }}>
            {year}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {items.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  background: colors.surface,
                  border: `1px solid ${p.isFlagship ? colors.green + '40' : colors.border}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: colors.text,
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = p.isFlagship ? colors.green + '40' : colors.border)}
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 8 }}
                  />
                ) : (
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    background: colors.bg,
                    border: `1px dashed ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                  }}>
                    📦
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {p.isFlagship && <span style={{ color: colors.amber || '#F59E0B' }}>★ </span>}
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{p.brandName}</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                  {p.configTypes.map(ct => (
                    <span key={ct} style={{
                      fontSize: 9,
                      fontFamily: "'IBM Plex Mono', monospace",
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: colors.bg,
                      color: colors.muted,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {formatConfigType(ct).replace(' Box', '').replace(' Pack', '')}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
