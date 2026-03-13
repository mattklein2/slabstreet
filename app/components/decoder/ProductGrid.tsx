'use client';

import { useTheme } from '../ThemeProvider';
import { Skeleton } from '../shared/Skeleton';
import type { ProductItem } from '../../../lib/types';

interface ProductGridProps {
  products: ProductItem[];
  loading: boolean;
  onSelect: (product: ProductItem) => void;
}

export function ProductGrid({ products, loading, onSelect }: ProductGridProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '12px 0' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={72} borderRadius={12} />
        ))}
      </div>
    );
  }

  // Group by year
  const byYear: Record<string, ProductItem[]> = {};
  for (const p of products) {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  }
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ padding: '12px 0' }}>
      {years.map((year, yi) => (
        <div key={year}>
          <h3 style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: colors.muted,
            margin: yi === 0 ? '0 0 8px' : '20px 0 8px',
            letterSpacing: 1,
          }}>
            {year}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {byYear[year].map((product) => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: '14px 12px',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: colors.text,
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {product.isFlagship && <span style={{ color: colors.amber, marginRight: 4 }}>★</span>}
                  {product.name}
                </span>
                {product.brandName && (
                  <span style={{ fontSize: 11, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {product.brandName}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
