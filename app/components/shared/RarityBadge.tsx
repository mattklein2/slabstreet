'use client';

import { useTheme } from '../ThemeProvider';
import { getRarityLevel, getRarityColorKey, type RarityLevel } from '../../../lib/rarity';

interface RarityBadgeProps {
  rarityRank: number;
  totalParallels: number;
  isOneOfOne: boolean;
}

export function RarityBadge({ rarityRank, totalParallels, isOneOfOne }: RarityBadgeProps) {
  const { colors } = useTheme();
  const level = getRarityLevel(rarityRank, totalParallels, isOneOfOne);
  const colorKey = getRarityColorKey(level) as keyof typeof colors;
  const color = colors[colorKey];

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 10,
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 600,
      letterSpacing: 0.5,
      color: color,
      border: `1px solid ${color}`,
      background: `${color}15`,
      whiteSpace: 'nowrap',
    }}>
      {level}
    </span>
  );
}
