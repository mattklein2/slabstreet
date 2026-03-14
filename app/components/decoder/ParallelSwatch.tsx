'use client';

import { useTheme } from '../ThemeProvider';
import { getParallelPattern } from '../../../lib/parallel-patterns';

interface ParallelSwatchProps {
  name: string;
  colorHex: string | null;
  size: number;
  borderRadius: number;
}

/**
 * Renders a parallel color swatch with CSS pattern overlay.
 * Uses keyword matching on the parallel name to apply visual textures
 * (refractor shimmer, cracked ice, mosaic, etc.) on top of the base color.
 */
export function ParallelSwatch({ name, colorHex, size, borderRadius }: ParallelSwatchProps) {
  const { colors } = useTheme();
  const pattern = getParallelPattern(name, colorHex, colors.muted);

  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: pattern.background,
        backgroundSize: pattern.backgroundSize,
        backgroundBlendMode: pattern.backgroundBlendMode as React.CSSProperties['backgroundBlendMode'],
        boxShadow: pattern.boxShadow,
        border: pattern.border || `1px solid ${colors.border}`,
        flexShrink: 0,
      }}
    />
  );
}
