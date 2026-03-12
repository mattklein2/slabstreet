'use client';

import { useTheme } from '../ThemeProvider';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8 }: SkeletonProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, ${colors.surface} 25%, ${colors.border} 50%, ${colors.surface} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={80} borderRadius={16} />
      ))}
    </div>
  );
}
