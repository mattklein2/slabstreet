/**
 * CSS-based visual patterns for parallel card swatches.
 * Maps parallel name keywords to background CSS properties
 * that simulate the real-world look of each parallel type.
 */

export interface SwatchStyle {
  background: string;
  backgroundSize?: string;
  backgroundBlendMode?: string;
  boxShadow?: string;
  border?: string;
}

/** Adjust a hex color's brightness. factor > 1 = lighter, < 1 = darker */
function adjustBrightness(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = Math.min(255, Math.round(parseInt(h.slice(0, 2), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(h.slice(2, 4), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(h.slice(4, 6), 16) * factor));
  return `rgb(${r},${g},${b})`;
}

/** Add transparency to a hex color */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Pattern generators ──────────────────────────────────────

function refractorPattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(135deg,
        ${hex} 0%,
        ${adjustBrightness(hex, 1.6)} 20%,
        rgba(255,255,255,0.7) 35%,
        ${adjustBrightness(hex, 1.3)} 50%,
        ${hex} 65%,
        ${adjustBrightness(hex, 1.5)} 80%,
        rgba(255,255,255,0.5) 100%)
    `.trim(),
  };
}

function prizmPattern(_hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(135deg,
        #ff6b6b 0%, #ffd93d 15%, #6bcb77 30%,
        #4d96ff 45%, #9b59b6 60%, #ff6b6b 75%,
        #ffd93d 90%, #6bcb77 100%)
    `.trim(),
  };
}

function superFractorPattern(_hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(135deg,
        #FFD700 0%, #FFF8DC 15%, #DAA520 30%,
        #FFFFFF 45%, #FFD700 55%, #FFF8DC 70%,
        #DAA520 85%, #FFD700 100%)
    `.trim(),
    boxShadow: 'inset 0 0 8px rgba(255,215,0,0.5)',
  };
}

function crackedIcePattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.3) 45%, transparent 50%),
      linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.25) 45%, transparent 50%),
      linear-gradient(30deg, transparent 55%, rgba(255,255,255,0.2) 60%, transparent 65%),
      linear-gradient(150deg, transparent 30%, rgba(255,255,255,0.2) 35%, transparent 40%),
      linear-gradient(80deg, transparent 60%, rgba(255,255,255,0.15) 65%, transparent 70%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.8)}, ${hex}, ${adjustBrightness(hex, 1.3)})
    `.trim(),
  };
}

function mosaicPattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(45deg, ${withAlpha(hex, 0.8)} 25%, transparent 25%),
      linear-gradient(-45deg, ${withAlpha(hex, 0.8)} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${withAlpha(hex, 0.6)} 75%),
      linear-gradient(-45deg, transparent 75%, ${withAlpha(hex, 0.6)} 75%),
      ${hex}
    `.trim(),
    backgroundSize: '8px 8px',
  };
}

function shimmerPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 3%),
      radial-gradient(circle at 70% 60%, rgba(255,255,255,0.4) 0%, transparent 2.5%),
      radial-gradient(circle at 40% 80%, rgba(255,255,255,0.45) 0%, transparent 2%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35) 0%, transparent 3%),
      radial-gradient(circle at 55% 45%, rgba(255,255,255,0.3) 0%, transparent 2%),
      radial-gradient(circle at 15% 70%, rgba(255,255,255,0.4) 0%, transparent 2.5%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.9)}, ${hex}, ${adjustBrightness(hex, 1.2)})
    `.trim(),
  };
}

function lavaPattern(hex: string): SwatchStyle {
  const dark = adjustBrightness(hex, 0.6);
  const light = adjustBrightness(hex, 1.4);
  return {
    background: `
      radial-gradient(ellipse at 30% 80%, ${light} 0%, transparent 50%),
      radial-gradient(ellipse at 70% 20%, ${light} 0%, transparent 45%),
      radial-gradient(ellipse at 50% 50%, ${hex} 0%, transparent 60%),
      linear-gradient(180deg, ${dark}, ${hex}, ${dark})
    `.trim(),
  };
}

function tigerPattern(hex: string): SwatchStyle {
  const stripe = adjustBrightness(hex, 0.4);
  return {
    background: `
      repeating-linear-gradient(
        -45deg,
        ${hex},
        ${hex} 4px,
        ${stripe} 4px,
        ${stripe} 7px
      )
    `.trim(),
  };
}

function zebraPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(
        -45deg,
        ${hex},
        ${hex} 3px,
        #1a1a1a 3px,
        #1a1a1a 6px
      )
    `.trim(),
  };
}

function checkerPattern(hex: string): SwatchStyle {
  const alt = adjustBrightness(hex, 0.6);
  return {
    background: `
      linear-gradient(45deg, ${alt} 25%, transparent 25%),
      linear-gradient(-45deg, ${alt} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${alt} 75%),
      linear-gradient(-45deg, transparent 75%, ${alt} 75%),
      ${hex}
    `.trim(),
    backgroundSize: '6px 6px',
    backgroundBlendMode: 'normal',
  };
}

function wavePattern(hex: string): SwatchStyle {
  const light = adjustBrightness(hex, 1.5);
  return {
    background: `
      repeating-linear-gradient(
        0deg,
        ${hex} 0px,
        ${light} 3px,
        ${hex} 6px,
        ${adjustBrightness(hex, 0.7)} 9px,
        ${hex} 12px
      )
    `.trim(),
    backgroundSize: '100% 12px',
  };
}

function vaporPattern(hex: string): SwatchStyle {
  const dark = adjustBrightness(hex, 0.5);
  return {
    background: `
      radial-gradient(ellipse at 20% 50%, ${hex} 0%, transparent 70%),
      radial-gradient(ellipse at 80% 50%, ${adjustBrightness(hex, 1.3)} 0%, transparent 70%),
      linear-gradient(135deg, ${dark}, #1a1a1a)
    `.trim(),
  };
}

function sapphirePattern(_hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(135deg,
        #0a1628 0%, #1a3a6c 20%, #4da6ff 40%,
        #b3d9ff 50%, #4da6ff 60%, #1a3a6c 80%, #0a1628 100%)
    `.trim(),
    boxShadow: 'inset 0 0 6px rgba(77,166,255,0.4)',
  };
}

function metallicPattern(hex: string): SwatchStyle {
  const light = adjustBrightness(hex, 1.5);
  const dark = adjustBrightness(hex, 0.7);
  return {
    background: `
      linear-gradient(160deg,
        ${dark} 0%, ${hex} 25%, ${light} 45%,
        ${hex} 55%, ${dark} 75%, ${hex} 100%)
    `.trim(),
  };
}

function logofractorPattern(hex: string): SwatchStyle {
  const alt = withAlpha(hex, 0.3);
  return {
    background: `
      repeating-linear-gradient(0deg, ${alt} 0px, ${alt} 1px, transparent 1px, transparent 4px),
      repeating-linear-gradient(90deg, ${alt} 0px, ${alt} 1px, transparent 1px, transparent 4px),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.8)}, ${hex}, ${adjustBrightness(hex, 1.3)})
    `.trim(),
  };
}

function patchPattern(hex: string): SwatchStyle {
  const thread = withAlpha('#ffffff', 0.15);
  return {
    background: `
      repeating-linear-gradient(0deg, ${thread} 0px, ${thread} 1px, transparent 1px, transparent 3px),
      repeating-linear-gradient(90deg, ${thread} 0px, ${thread} 1px, transparent 1px, transparent 3px),
      ${hex}
    `.trim(),
  };
}

function pulsarPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 50% 50%,
        rgba(255,255,255,0.6) 0%,
        ${adjustBrightness(hex, 1.4)} 15%,
        ${hex} 40%,
        ${adjustBrightness(hex, 0.7)} 70%,
        ${hex} 100%)
    `.trim(),
  };
}

function stardustPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 15% 25%, #fff 0%, transparent 1.5%),
      radial-gradient(circle at 45% 15%, #fff 0%, transparent 1%),
      radial-gradient(circle at 75% 35%, #fff 0%, transparent 1.5%),
      radial-gradient(circle at 25% 65%, #fff 0%, transparent 1%),
      radial-gradient(circle at 60% 75%, #fff 0%, transparent 1.5%),
      radial-gradient(circle at 85% 60%, #fff 0%, transparent 1%),
      radial-gradient(circle at 35% 85%, #fff 0%, transparent 1.5%),
      radial-gradient(circle at 90% 85%, #fff 0%, transparent 1%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.85)}, ${hex}, ${adjustBrightness(hex, 1.1)})
    `.trim(),
  };
}

function laserPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        transparent 2px,
        rgba(255,255,255,0.15) 2px,
        rgba(255,255,255,0.15) 3px
      ),
      linear-gradient(180deg,
        ${adjustBrightness(hex, 1.4)} 0%,
        ${hex} 30%,
        ${adjustBrightness(hex, 0.6)} 60%,
        ${hex} 100%)
    `.trim(),
  };
}

function dieCutPattern(hex: string): SwatchStyle {
  return {
    ...refractorPattern(hex),
    border: '2px dashed rgba(255,255,255,0.4)',
  };
}

function flowerPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 30%),
      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 25%),
      radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 25%),
      radial-gradient(circle at 75% 25%, rgba(255,255,255,0.15) 0%, transparent 20%),
      radial-gradient(circle at 25% 75%, rgba(255,255,255,0.15) 0%, transparent 20%),
      ${hex}
    `.trim(),
  };
}

function specklePattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 10% 20%, ${adjustBrightness(hex, 1.8)} 0%, transparent 4%),
      radial-gradient(circle at 30% 70%, ${adjustBrightness(hex, 1.6)} 0%, transparent 3%),
      radial-gradient(circle at 50% 40%, ${adjustBrightness(hex, 1.7)} 0%, transparent 3.5%),
      radial-gradient(circle at 70% 10%, ${adjustBrightness(hex, 1.5)} 0%, transparent 4%),
      radial-gradient(circle at 90% 60%, ${adjustBrightness(hex, 1.8)} 0%, transparent 3%),
      radial-gradient(circle at 60% 85%, ${adjustBrightness(hex, 1.6)} 0%, transparent 3.5%),
      radial-gradient(circle at 80% 90%, ${adjustBrightness(hex, 1.7)} 0%, transparent 3%),
      ${hex}
    `.trim(),
  };
}

function tiePattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 30% 30%, ${adjustBrightness(hex, 1.5)} 0%, transparent 25%),
      radial-gradient(circle at 70% 70%, ${adjustBrightness(hex, 1.4)} 0%, transparent 30%),
      radial-gradient(circle at 60% 20%, ${adjustBrightness(hex, 0.6)} 0%, transparent 20%),
      radial-gradient(circle at 20% 80%, ${adjustBrightness(hex, 0.5)} 0%, transparent 25%),
      linear-gradient(135deg, ${hex}, ${adjustBrightness(hex, 1.2)}, ${adjustBrightness(hex, 0.7)}, ${hex})
    `.trim(),
  };
}

// ── Main matcher ────────────────────────────────────────────

/** Match rules — first match wins, so order matters (specific → general) */
const PATTERN_RULES: Array<{ test: (name: string) => boolean; fn: (hex: string) => SwatchStyle }> = [
  // Very specific names first
  { test: n => /superfractor/i.test(n), fn: superFractorPattern },
  { test: n => /cracked\s*ice/i.test(n), fn: crackedIcePattern },
  { test: n => /die[\s-]*cut/i.test(n), fn: dieCutPattern },
  { test: n => /tie[\s-]*dye/i.test(n), fn: tiePattern },
  { test: n => /logofractor/i.test(n), fn: logofractorPattern },
  { test: n => /stardust/i.test(n), fn: stardustPattern },
  { test: n => /pulsar/i.test(n), fn: pulsarPattern },
  { test: n => /ray\s*wave/i.test(n), fn: wavePattern },
  { test: n => /checker|checkerboard/i.test(n), fn: checkerPattern },
  { test: n => /cracked|speckle/i.test(n), fn: specklePattern },
  { test: n => /lotus|cherry\s*blossom|flower/i.test(n), fn: flowerPattern },

  // Pattern families
  { test: n => /mosaic/i.test(n), fn: mosaicPattern },
  { test: n => /tiger/i.test(n), fn: tigerPattern },
  { test: n => /zebra/i.test(n), fn: zebraPattern },
  { test: n => /lava/i.test(n), fn: lavaPattern },
  { test: n => /laser/i.test(n), fn: laserPattern },
  { test: n => /shimmer/i.test(n), fn: shimmerPattern },
  { test: n => /vapor/i.test(n), fn: vaporPattern },
  { test: n => /wave/i.test(n), fn: wavePattern },
  { test: n => /patch\s*auto|patch/i.test(n), fn: patchPattern },
  { test: n => /sapphire|padparadscha/i.test(n), fn: sapphirePattern },

  // Refractor variants (after specific ones)
  { test: n => /prizm|prism|silver\b/i.test(n), fn: prizmPattern },
  { test: n => /refractor|chrome/i.test(n), fn: refractorPattern },

  // Metallic colors
  { test: n => /\bgold\b|rose\s*gold/i.test(n), fn: metallicPattern },
  { test: n => /\bbronze\b/i.test(n), fn: metallicPattern },
];

/**
 * Get CSS styles for a parallel swatch based on its name and base color.
 * Returns pattern styles if a keyword matches, otherwise falls back to flat color.
 */
export function getParallelPattern(name: string, colorHex: string | null, fallback: string): SwatchStyle {
  const hex = colorHex || fallback;

  for (const rule of PATTERN_RULES) {
    if (rule.test(name)) {
      return rule.fn(hex);
    }
  }

  // Default: flat color (same as current behavior)
  return { background: hex };
}
