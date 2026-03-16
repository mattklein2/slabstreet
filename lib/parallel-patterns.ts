/**
 * CSS-based visual patterns for parallel card swatches.
 *
 * Renders each parallel as a mini card with TWO layers:
 *   - Border color (the card's frame: black, gold, red, blue, etc.)
 *   - Interior pattern (the card's surface: refractor, shimmer, ice, etc.)
 *
 * Compound names like "Black Refractor" → black border + rainbow refractor fill
 * Simple names like "Silver" → silver prizm pattern with matching border
 */

export interface SwatchStyle {
  /** CSS background for the inner pattern area */
  background: string;
  backgroundSize?: string;
  backgroundBlendMode?: string;
  boxShadow?: string;
  /** Border color for the card frame (extracted from name) */
  borderColor: string;
  /** Whether this has a distinct border vs interior (compound name) */
  hasDistinctBorder: boolean;
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

// ── Color name → hex mapping ─────────────────────────────────

const BORDER_COLORS: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f0f0f0',
  gold: '#FFD700',
  silver: '#C0C0C0',
  red: '#CC0000',
  blue: '#0055A4',
  green: '#228B22',
  purple: '#6A0DAD',
  orange: '#FF6600',
  pink: '#FF69B4',
  yellow: '#FFD700',
  teal: '#008080',
  bronze: '#CD7F32',
  copper: '#B87333',
  crimson: '#DC143C',
  navy: '#000080',
  royal: '#4169E1',
  sky: '#87CEEB',
  midnight: '#191970',
  neon: '#39FF14',
  jade: '#00A86B',
  plum: '#DDA0DD',
  ruby: '#E0115F',
  emerald: '#50C878',
  sapphire: '#0F52BA',
  aqua: '#00CED1',
  magenta: '#FF00FF',
  cherry: '#FFB7C5',
  lucky: '#CC0000',
  dragon: '#CC0000',
  multi: '#FF00FF',
};

/**
 * Extract border color from ANYWHERE in a parallel name.
 * Handles: "Black Refractor", "Press Proof Gold Die-Cut", "Red Ice", etc.
 * Returns the color hex and the remaining text (for pattern matching).
 */
function extractBorderColor(name: string): { borderHex: string | null; colorWord: string | null } {
  const lower = name.toLowerCase().trim();
  const words = lower.split(/\s+/);

  // Check each word (and two-word combos) against color map
  // Prefer longer matches and later positions (color is usually after prefix like "Press Proof")
  let bestMatch: { hex: string; word: string; idx: number } | null = null;

  for (let i = 0; i < words.length; i++) {
    // Two-word combo: "neon green", "sky blue"
    if (i < words.length - 1) {
      const twoWord = words[i] + ' ' + words[i + 1];
      if (BORDER_COLORS[twoWord]) {
        bestMatch = { hex: BORDER_COLORS[twoWord], word: twoWord, idx: i };
      }
    }
    // Single word
    if (BORDER_COLORS[words[i]]) {
      // Don't override a two-word match at same position
      if (!bestMatch || bestMatch.idx !== i) {
        bestMatch = { hex: BORDER_COLORS[words[i]], word: words[i], idx: i };
      }
    }
  }

  if (!bestMatch) return { borderHex: null, colorWord: null };

  // Only treat as a distinct border if there's also a pattern keyword in the name
  if (hasPatternKeyword(lower)) {
    return { borderHex: bestMatch.hex, colorWord: bestMatch.word };
  }

  return { borderHex: null, colorWord: null };
}

/** Check if text contains a finish/pattern keyword */
function hasPatternKeyword(text: string): boolean {
  return /refractor|xfractor|prizm|prism|shimmer|ice|wave|pulsar|disco|scope|holo|mojo|sparkle|lazer|laser|seismic|power|tiger|snakeskin|nebula|lava|marble|camo|peacock|mosaic|fractal|cracked|superfractor|stardust|vapor|die.?cut|logofractor|patch|sapphire|checker|fluorescent|neon|stained|tie.?dye|cherry|lotus|flower|speckle|zebra|leopard|chrome|sandglitter|diamante|rainbow\s*foil|canvas|foil|spring\s*training|training/i.test(text);
}

// ── Interior pattern generators ──────────────────────────────

function refractorPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(60deg,
        transparent 0px, transparent 3px,
        rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 4px),
      repeating-linear-gradient(120deg,
        transparent 0px, transparent 3px,
        rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 4px),
      linear-gradient(135deg,
        #ff4040 0%, #ffcc00 14%, #44dd66 28%,
        #2288ff 42%, #aa44ee 56%, #ff4040 70%,
        #ffcc00 84%, #44dd66 100%)
    `.trim(),
    boxShadow: 'inset 0 0 3px rgba(255,255,255,0.2)',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function chromePattern(hex: string): SwatchStyle {
  const light = adjustBrightness(hex, 1.6);
  const dark = adjustBrightness(hex, 0.7);
  return {
    background: `
      linear-gradient(160deg,
        ${dark} 0%, ${hex} 15%, ${light} 35%,
        #f8f8f8 45%, ${light} 55%, ${hex} 75%, ${dark} 100%)
    `.trim(),
    boxShadow: 'inset 0 0 3px rgba(255,255,255,0.2)',
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: '#C0C0C0',
    hasDistinctBorder: false,
  };
}

function superFractorPattern(_hex: string): SwatchStyle {
  return {
    background: `
      conic-gradient(from 0deg at 50% 50%,
        rgba(255,215,0,0.3) 0deg, transparent 30deg,
        rgba(255,215,0,0.25) 60deg, transparent 90deg,
        rgba(255,215,0,0.3) 120deg, transparent 150deg,
        rgba(255,215,0,0.25) 180deg, transparent 210deg,
        rgba(255,215,0,0.3) 240deg, transparent 270deg,
        rgba(255,215,0,0.25) 300deg, transparent 330deg,
        rgba(255,215,0,0.3) 360deg),
      repeating-radial-gradient(circle at 50% 50%,
        transparent 0px, transparent 3px,
        rgba(255,248,220,0.15) 3.5px, transparent 4px),
      linear-gradient(135deg,
        #B8860B 0%, #FFD700 20%, #FFF8DC 40%,
        #FFD700 55%, #DAA520 70%, #FFF8DC 85%, #FFD700 100%)
    `.trim(),
    boxShadow: 'inset 0 0 8px rgba(255,215,0,0.6)',
    borderColor: '#FFD700',
    hasDistinctBorder: false,
  };
}

function crackedIcePattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(55deg, transparent 42%, rgba(255,255,255,0.45) 42.5%, transparent 43%),
      linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.4) 35.5%, transparent 36%),
      linear-gradient(20deg, transparent 55%, rgba(255,255,255,0.35) 55.5%, transparent 56%),
      linear-gradient(160deg, transparent 25%, rgba(255,255,255,0.35) 25.5%, transparent 26%),
      linear-gradient(85deg, transparent 62%, rgba(255,255,255,0.3) 62.5%, transparent 63%),
      linear-gradient(105deg, transparent 48%, rgba(255,255,255,0.3) 48.5%, transparent 49%),
      linear-gradient(40deg, transparent 70%, rgba(255,255,255,0.25) 70.5%, transparent 71%),
      linear-gradient(135deg,
        #ff6b6b 0%, #ffd93d 14%, #6bcb77 28%,
        #4d96ff 42%, #9b59b6 56%, #ff6b6b 70%,
        #ffd93d 84%, #6bcb77 100%)
    `.trim(),
    boxShadow: 'inset 0 0 4px rgba(255,255,255,0.3)',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function mosaicPattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.15) 42%, transparent 44%),
      linear-gradient(150deg, transparent 40%, rgba(255,255,255,0.12) 42%, transparent 44%),
      linear-gradient(90deg, transparent 45%, rgba(255,255,255,0.1) 47%, transparent 49%),
      linear-gradient(60deg, ${withAlpha(hex, 0.7)} 25%, transparent 25%),
      linear-gradient(-60deg, ${withAlpha(hex, 0.7)} 25%, transparent 25%),
      linear-gradient(60deg, transparent 75%, ${withAlpha(hex, 0.5)} 75%),
      linear-gradient(-60deg, transparent 75%, ${withAlpha(hex, 0.5)} 75%),
      linear-gradient(135deg,
        #ff6b6b 0%, #ffd93d 25%, #6bcb77 50%, #4d96ff 75%, #9b59b6 100%)
    `.trim(),
    backgroundSize: '6px 10px, 6px 10px, 6px 10px, 6px 10px, 6px 10px, 6px 10px, 6px 10px, 100% 100%',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function shimmerPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 15% 20%, rgba(255,255,255,0.6) 0%, transparent 3%),
      radial-gradient(circle at 55% 45%, rgba(255,255,255,0.5) 0%, transparent 2.5%),
      radial-gradient(circle at 85% 25%, rgba(255,255,255,0.55) 0%, transparent 2%),
      radial-gradient(circle at 35% 70%, rgba(255,255,255,0.45) 0%, transparent 3%),
      radial-gradient(circle at 70% 80%, rgba(255,255,255,0.5) 0%, transparent 2%),
      radial-gradient(circle at 25% 90%, rgba(255,255,255,0.4) 0%, transparent 2.5%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.9)}, ${hex}, ${adjustBrightness(hex, 1.2)})
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function tigerPattern(hex: string): SwatchStyle {
  const stripe = adjustBrightness(hex, 0.4);
  return {
    background: `
      repeating-linear-gradient(-45deg,
        ${hex}, ${hex} 3px, ${stripe} 3px, ${stripe} 6px)
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function zebraPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(-45deg,
        ${hex}, ${hex} 3px, #1a1a1a 3px, #1a1a1a 6px)
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function wavePattern(hex: string): SwatchStyle {
  const light = adjustBrightness(hex, 1.5);
  return {
    background: `
      repeating-linear-gradient(0deg,
        ${hex} 0px, ${light} 3px, ${hex} 6px,
        ${adjustBrightness(hex, 0.7)} 9px, ${hex} 12px)
    `.trim(),
    backgroundSize: '100% 12px',
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: '#0F52BA',
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function pulsarPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 50% 50%,
        rgba(255,255,255,0.6) 0%, ${adjustBrightness(hex, 1.4)} 15%,
        ${hex} 40%, ${adjustBrightness(hex, 0.7)} 70%, ${hex} 100%)
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function laserPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(90deg,
        transparent 0px, transparent 2px,
        rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px),
      linear-gradient(180deg,
        ${adjustBrightness(hex, 1.4)} 0%, ${hex} 30%,
        ${adjustBrightness(hex, 0.6)} 60%, ${hex} 100%)
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function icePattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(135deg,
        rgba(220,240,255,0.9) 0%, ${withAlpha(hex, 0.4)} 25%,
        rgba(255,255,255,0.7) 45%, ${withAlpha(hex, 0.5)} 65%,
        rgba(200,230,255,0.8) 85%, rgba(255,255,255,0.6) 100%)
    `.trim(),
    boxShadow: 'inset 0 0 6px rgba(255,255,255,0.5)',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function discoPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 30%, transparent 35%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.85)}, ${hex}, ${adjustBrightness(hex, 1.2)})
    `.trim(),
    backgroundSize: '5px 5px, 100% 100%',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function snakeskinPattern(hex: string): SwatchStyle {
  const dark = adjustBrightness(hex, 0.5);
  return {
    background: `
      linear-gradient(0deg, ${withAlpha(dark, 0.4)} 1px, transparent 1px),
      linear-gradient(60deg, ${withAlpha(dark, 0.4)} 1px, transparent 1px),
      linear-gradient(120deg, ${withAlpha(dark, 0.4)} 1px, transparent 1px),
      ${hex}
    `.trim(),
    backgroundSize: '6px 10px',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function nebulaPattern(_hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(ellipse at 25% 40%, rgba(147,51,234,0.7) 0%, transparent 50%),
      radial-gradient(ellipse at 75% 60%, rgba(59,130,246,0.6) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, rgba(236,72,153,0.5) 0%, transparent 40%),
      radial-gradient(circle at 15% 80%, rgba(255,255,255,0.3) 0%, transparent 8%),
      radial-gradient(circle at 85% 20%, rgba(255,255,255,0.25) 0%, transparent 6%),
      linear-gradient(135deg, #0a0020, #1a0040, #0a0030)
    `.trim(),
    borderColor: '#4B0082',
    hasDistinctBorder: false,
  };
}

function mojoPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-radial-gradient(circle at 50% 50%,
        transparent 0px, transparent 2px,
        rgba(255,255,255,0.12) 2.5px, transparent 3px),
      repeating-radial-gradient(circle at 50% 50%,
        transparent 0px, transparent 4px,
        rgba(255,255,255,0.08) 4.5px, transparent 5px),
      linear-gradient(135deg,
        #ff6b6b 0%, #ffd93d 14%, #6bcb77 28%,
        #4d96ff 42%, #9b59b6 56%, #ff6b6b 70%,
        #ffd93d 84%, #6bcb77 100%)
    `.trim(),
    boxShadow: `inset 0 0 6px ${withAlpha(hex, 0.4)}`,
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function fluorescentPattern(hex: string): SwatchStyle {
  const bright = adjustBrightness(hex, 1.8);
  return {
    background: `
      linear-gradient(135deg,
        ${bright} 0%, ${hex} 40%, ${bright} 60%, ${hex} 100%)
    `.trim(),
    boxShadow: `inset 0 0 8px ${withAlpha(hex, 0.6)}, 0 0 4px ${withAlpha(hex, 0.3)}`,
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function marblePattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(25deg, transparent 30%, rgba(255,255,255,0.15) 32%, transparent 34%),
      linear-gradient(155deg, transparent 45%, rgba(255,255,255,0.12) 47%, transparent 49%),
      linear-gradient(70deg, transparent 55%, rgba(255,255,255,0.1) 57%, transparent 59%),
      linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.08) 22%, transparent 24%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.85)}, ${hex}, ${adjustBrightness(hex, 1.1)})
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function camoPattern(hex: string): SwatchStyle {
  const dark = adjustBrightness(hex, 0.4);
  const mid = adjustBrightness(hex, 0.7);
  const light = adjustBrightness(hex, 1.2);
  return {
    background: `
      radial-gradient(ellipse at 20% 30%, ${dark} 0%, transparent 40%),
      radial-gradient(ellipse at 70% 70%, ${light} 0%, transparent 35%),
      radial-gradient(ellipse at 50% 10%, ${mid} 0%, transparent 45%),
      radial-gradient(ellipse at 80% 30%, ${dark} 0%, transparent 30%),
      radial-gradient(ellipse at 30% 80%, ${mid} 0%, transparent 40%),
      ${hex}
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function peacockPattern(_hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(ellipse at 25% 30%, #004d40 0%, rgba(0,137,123,0.6) 20%, transparent 35%),
      radial-gradient(ellipse at 75% 70%, #004d40 0%, rgba(0,137,123,0.6) 20%, transparent 35%),
      radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.3) 0%, transparent 15%),
      radial-gradient(ellipse at 25% 30%, rgba(38,198,218,0.5) 10%, transparent 25%),
      radial-gradient(ellipse at 75% 70%, rgba(38,198,218,0.5) 10%, transparent 25%),
      linear-gradient(135deg,
        #002620 0%, #004d40 20%, #00897b 40%,
        #26c6da 55%, #00897b 70%, #004d40 85%, #002620 100%)
    `.trim(),
    boxShadow: 'inset 0 0 5px rgba(38,198,218,0.4)',
    borderColor: '#00897b',
    hasDistinctBorder: false,
  };
}

function stainedGlassPattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(0deg, rgba(0,0,0,0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px),
      linear-gradient(45deg,
        ${hex} 0%, ${adjustBrightness(hex, 1.4)} 25%,
        #4d96ff 50%, ${adjustBrightness(hex, 0.8)} 75%, ${hex} 100%)
    `.trim(),
    backgroundSize: '8px 8px, 8px 8px, 100% 100%',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function scopePattern(hex: string): SwatchStyle {
  return {
    background: `
      linear-gradient(0deg, transparent 48%, rgba(255,255,255,0.2) 49%, rgba(255,255,255,0.2) 51%, transparent 52%),
      linear-gradient(90deg, transparent 48%, rgba(255,255,255,0.2) 49%, rgba(255,255,255,0.2) 51%, transparent 52%),
      radial-gradient(circle at 50% 50%,
        transparent 15%, rgba(255,255,255,0.15) 16%, transparent 18%),
      radial-gradient(circle at 50% 50%,
        transparent 30%, rgba(255,255,255,0.12) 31%, transparent 33%),
      radial-gradient(circle at 50% 50%,
        transparent 44%, rgba(255,255,255,0.1) 45%, transparent 47%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.8)}, ${hex}, ${adjustBrightness(hex, 1.3)})
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function holoPattern(_hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(ellipse at 40% 40%,
        rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 25%, transparent 50%),
      linear-gradient(135deg,
        #ff6b6b 0%, #ffd93d 12%, #6bcb77 24%,
        #4d96ff 36%, #9b59b6 48%, #ff6b6b 60%,
        #ffd93d 72%, #6bcb77 84%, #4d96ff 100%)
    `.trim(),
    boxShadow: 'inset 0 0 6px rgba(255,255,255,0.4)',
    borderColor: '#C0C0C0',
    hasDistinctBorder: false,
  };
}

function dieCutPattern(hex: string): SwatchStyle {
  const base = refractorPattern(hex);
  return { ...base, borderColor: hex, hasDistinctBorder: false };
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
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function sandglitterPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 50% 50%, rgba(255,240,200,0.3) 20%, transparent 25%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.9)}, ${hex}, ${adjustBrightness(hex, 1.08)})
    `.trim(),
    backgroundSize: '3px 3px, 100% 100%',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function diamantePattern(hex: string): SwatchStyle {
  const facet = 'rgba(255,255,255,0.18)';
  return {
    background: `
      linear-gradient(45deg, ${facet} 25%, transparent 25%, transparent 75%, ${facet} 75%),
      linear-gradient(-45deg, ${facet} 25%, transparent 25%, transparent 75%, ${facet} 75%),
      linear-gradient(135deg,
        ${adjustBrightness(hex, 0.7)} 0%, ${adjustBrightness(hex, 1.4)} 25%,
        ${hex} 50%, ${adjustBrightness(hex, 1.5)} 75%, ${adjustBrightness(hex, 0.8)} 100%)
    `.trim(),
    backgroundSize: '5px 5px, 5px 5px, 100% 100%',
    boxShadow: 'inset 0 0 4px rgba(255,255,255,0.3)',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function rainbowFoilPattern(_hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(135deg,
        transparent 0px, transparent 2px,
        rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px),
      linear-gradient(135deg,
        #ff6b6b 0%, #ffa94d 14%, #ffd93d 28%,
        #6bcb77 42%, #4d96ff 56%, #9b59b6 70%,
        #ff6b6b 84%, #ffa94d 100%)
    `.trim(),
    boxShadow: 'inset 0 0 4px rgba(255,255,255,0.25)',
    borderColor: '#C0C0C0',
    hasDistinctBorder: false,
  };
}

function canvasPattern(hex: string): SwatchStyle {
  const thread = withAlpha('#ffffff', 0.1);
  return {
    background: `
      repeating-linear-gradient(0deg, ${thread} 0px, ${thread} 1px, transparent 1px, transparent 2px),
      repeating-linear-gradient(90deg, ${thread} 0px, ${thread} 1px, transparent 1px, transparent 2px),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.9)}, ${hex}, ${adjustBrightness(hex, 1.05)})
    `.trim(),
    backgroundSize: '2px 2px, 2px 2px, 100% 100%',
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function springTrainingPattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(ellipse at 30% 70%, rgba(34,139,34,0.35) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 30%, rgba(60,179,60,0.3) 0%, transparent 45%),
      linear-gradient(135deg,
        ${adjustBrightness(hex, 0.85)} 0%, ${hex} 30%,
        rgba(34,139,34,0.2) 50%, ${hex} 70%,
        ${adjustBrightness(hex, 1.1)} 100%)
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function foilPattern(hex: string): SwatchStyle {
  const light = adjustBrightness(hex, 1.6);
  const dark = adjustBrightness(hex, 0.7);
  return {
    background: `
      repeating-linear-gradient(60deg,
        transparent 0px, transparent 3px,
        rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 4px),
      linear-gradient(160deg,
        ${dark} 0%, ${hex} 20%, ${light} 40%,
        ${hex} 50%, ${dark} 65%, ${light} 80%, ${hex} 100%)
    `.trim(),
    boxShadow: 'inset 0 0 4px rgba(255,255,255,0.2)',
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
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
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function seismicPattern(hex: string): SwatchStyle {
  return {
    background: `
      repeating-linear-gradient(135deg,
        transparent 0px, transparent 4px,
        rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 5px),
      repeating-linear-gradient(45deg,
        transparent 0px, transparent 6px,
        rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 7px),
      linear-gradient(135deg,
        ${adjustBrightness(hex, 0.7)} 0%, ${hex} 30%,
        ${adjustBrightness(hex, 1.3)} 50%, ${hex} 70%,
        ${adjustBrightness(hex, 0.8)} 100%)
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

function sparklePattern(hex: string): SwatchStyle {
  return {
    background: `
      radial-gradient(circle at 20% 25%, rgba(255,255,255,0.7) 0%, transparent 2%),
      radial-gradient(circle at 60% 15%, rgba(255,255,255,0.6) 0%, transparent 1.5%),
      radial-gradient(circle at 80% 45%, rgba(255,255,255,0.65) 0%, transparent 2%),
      radial-gradient(circle at 40% 70%, rgba(255,255,255,0.55) 0%, transparent 1.5%),
      radial-gradient(circle at 15% 80%, rgba(255,255,255,0.6) 0%, transparent 2%),
      radial-gradient(circle at 75% 85%, rgba(255,255,255,0.5) 0%, transparent 1.5%),
      radial-gradient(circle at 50% 45%, rgba(255,255,255,0.45) 0%, transparent 2%),
      radial-gradient(circle at 90% 70%, rgba(255,255,255,0.55) 0%, transparent 1.5%),
      linear-gradient(135deg, ${adjustBrightness(hex, 0.85)}, ${hex}, ${adjustBrightness(hex, 1.15)})
    `.trim(),
    borderColor: hex,
    hasDistinctBorder: false,
  };
}

// ── Main matcher ────────────────────────────────────────────

/** Interior pattern rules — matches against the remainder after border color is extracted */
const INTERIOR_RULES: Array<{ test: (name: string) => boolean; fn: (hex: string) => SwatchStyle }> = [
  // Very specific compound patterns first
  { test: n => /superfractor/i.test(n), fn: superFractorPattern },
  { test: n => /cracked\s*ice/i.test(n), fn: crackedIcePattern },
  { test: n => /rainbow\s*foil/i.test(n), fn: rainbowFoilPattern },
  { test: n => /stained\s*glass/i.test(n), fn: stainedGlassPattern },
  { test: n => /spring\s*training/i.test(n), fn: springTrainingPattern },
  { test: n => /die[\s-]*cut/i.test(n), fn: dieCutPattern },
  { test: n => /tie[\s-]*dye/i.test(n), fn: tiePattern },
  { test: n => /logofractor/i.test(n), fn: logofractorPattern },
  { test: n => /stardust/i.test(n), fn: stardustPattern },
  { test: n => /pulsar/i.test(n), fn: pulsarPattern },
  { test: n => /seismic/i.test(n), fn: seismicPattern },
  { test: n => /sparkle/i.test(n), fn: sparklePattern },
  { test: n => /ray\s*wave/i.test(n), fn: wavePattern },
  { test: n => /checker|checkerboard/i.test(n), fn: checkerPattern },
  { test: n => /cracked|speckle/i.test(n), fn: specklePattern },
  { test: n => /lotus|cherry\s*blossom|flower/i.test(n), fn: flowerPattern },
  { test: n => /nebula/i.test(n), fn: nebulaPattern },
  { test: n => /peacock/i.test(n), fn: peacockPattern },
  { test: n => /fluorescent/i.test(n), fn: fluorescentPattern },
  { test: n => /sandglitter/i.test(n), fn: sandglitterPattern },
  { test: n => /diamante/i.test(n), fn: diamantePattern },
  { test: n => /canvas/i.test(n), fn: canvasPattern },
  { test: n => /marble/i.test(n), fn: marblePattern },
  { test: n => /camo|camouflage/i.test(n), fn: camoPattern },

  // Pattern families
  { test: n => /snakeskin/i.test(n), fn: snakeskinPattern },
  { test: n => /mosaic/i.test(n), fn: mosaicPattern },
  { test: n => /tiger|leopard/i.test(n), fn: tigerPattern },
  { test: n => /zebra/i.test(n), fn: zebraPattern },
  { test: n => /lava/i.test(n), fn: lavaPattern },
  { test: n => /la[sz]er/i.test(n), fn: laserPattern },
  { test: n => /disco/i.test(n), fn: discoPattern },
  { test: n => /shimmer/i.test(n), fn: shimmerPattern },
  { test: n => /vapor/i.test(n), fn: vaporPattern },
  { test: n => /\bice\b/i.test(n), fn: icePattern },
  { test: n => /wave/i.test(n), fn: wavePattern },
  { test: n => /\bscope\b/i.test(n), fn: scopePattern },
  { test: n => /\bholo\b/i.test(n), fn: holoPattern },
  { test: n => /\bmojo\b/i.test(n), fn: mojoPattern },
  { test: n => /patch\s*auto|patch/i.test(n), fn: patchPattern },
  { test: n => /sapphire|padparadscha/i.test(n), fn: sapphirePattern },

  // Broad refractor/prizm/foil patterns
  { test: n => /prizm|prism/i.test(n), fn: prizmPattern },
  { test: n => /refractor|xfractor/i.test(n), fn: refractorPattern },
  { test: n => /\bchrome\b/i.test(n), fn: chromePattern },
  { test: n => /\bfoil\b/i.test(n), fn: foilPattern },

  // Metallic
  { test: n => /\bgold\b|rose\s*gold/i.test(n), fn: metallicPattern },
  { test: n => /\bbronze\b|\bcopper\b|\bplatinum\b/i.test(n), fn: metallicPattern },
  { test: n => /\bsilver\b/i.test(n), fn: prizmPattern },
];

/**
 * Get CSS styles for a parallel swatch based on its name and base color.
 *
 * Handles compound names like "Black Refractor" or "Press Proof Gold Die-Cut" by:
 *   1. Matching the interior pattern from the FULL name (finds "Refractor", "Die-Cut", etc.)
 *   2. Extracting border color from ANY word in the name ("Black", "Gold", etc.)
 *   3. If both exist → distinct border + patterned interior (like a real card)
 */
export function getParallelPattern(name: string, colorHex: string | null, fallback: string): SwatchStyle {
  const hex = colorHex || fallback;

  // Step 1: Match interior pattern against full name
  let pattern: SwatchStyle | null = null;
  for (const rule of INTERIOR_RULES) {
    if (rule.test(name)) {
      pattern = rule.fn(hex);
      break;
    }
  }

  // Step 2: Extract border color from name
  const { borderHex } = extractBorderColor(name);

  if (pattern && borderHex) {
    // Compound: e.g. "Press Proof Black Die-Cut" → black border + die-cut interior
    return { ...pattern, borderColor: borderHex, hasDistinctBorder: true };
  }

  if (pattern) {
    // Pattern only, no distinct border color: e.g. "Silver Prizm", "Refractor"
    return pattern;
  }

  // Color-only names with glow effect
  if (/^neon\b/i.test(name)) {
    return fluorescentPattern(hex);
  }

  // Default: if name contains a known color word, give it a metallic sheen
  // (extractBorderColor requires pattern keywords — do a simple color scan here)
  const lower = name.toLowerCase();
  const words = lower.split(/\s+/);
  for (const w of words) {
    if (BORDER_COLORS[w]) {
      return metallicPattern(BORDER_COLORS[w]);
    }
  }

  return { background: hex, borderColor: hex, hasDistinctBorder: false };
}
