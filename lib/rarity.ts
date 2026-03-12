// lib/rarity.ts

export type RarityLevel = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA RARE' | '1/1';

export function getRarityLevel(rarityRank: number, totalParallels: number, isOneOfOne: boolean): RarityLevel {
  if (isOneOfOne) return '1/1';
  const ratio = rarityRank / totalParallels;
  if (ratio < 0.25) return 'COMMON';
  if (ratio < 0.55) return 'UNCOMMON';
  if (ratio < 0.85) return 'RARE';
  return 'ULTRA RARE';
}

// Returns the ThemeProvider color key for each rarity level
export function getRarityColorKey(level: RarityLevel): string {
  switch (level) {
    case 'COMMON': return 'muted';
    case 'UNCOMMON': return 'green';
    case 'RARE': return 'amber';
    case 'ULTRA RARE': return 'red';
    case '1/1': return 'purple';
  }
}
