'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import { RarityBadge } from '../shared/RarityBadge';
import { Skeleton } from '../shared/Skeleton';
import type { ParallelItem } from '../../../lib/types';

interface ParallelListProps {
  parallels: ParallelItem[];
  loading: boolean;
  onSelect: (parallel: ParallelItem) => void;
}

export function ParallelList({ parallels, loading, onSelect }: ParallelListProps) {
  const { colors } = useTheme();
  const [showHelp, setShowHelp] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} height={52} borderRadius={10} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
      {parallels.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            cursor: 'pointer',
            textAlign: 'left',
            color: colors.text,
            transition: 'border-color 0.15s',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: p.colorHex || colors.muted,
            border: `1px solid ${colors.border}`,
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
            {p.description && (
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.description}
              </div>
            )}
          </div>
          <RarityBadge rarityRank={p.rarityRank} totalParallels={p.totalParallels} isOneOfOne={p.isOneOfOne} />
        </button>
      ))}

      <button
        onClick={() => setShowHelp(!showHelp)}
        style={{
          background: 'none',
          border: 'none',
          color: colors.muted,
          fontSize: 13,
          cursor: 'pointer',
          padding: '12px 0',
          textDecoration: 'underline',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        I don&apos;t see my card
      </button>
      {showHelp && (
        <div style={{
          padding: '12px 16px',
          background: colors.surface,
          borderRadius: 10,
          fontSize: 13,
          color: colors.secondary,
          lineHeight: 1.7,
        }}>
          Flip your card over and look for the set name printed on the back. If you still can&apos;t find a match, this card may be from a product we haven&apos;t added yet.
        </div>
      )}
    </div>
  );
}
