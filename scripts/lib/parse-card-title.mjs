/**
 * Parses eBay sports card listing titles into structured data.
 *
 * Example:
 *   parseCardTitle("2023 PRIZM MONOPOLY VICTOR WEMBANYAMA #81 ROOKIE RC PSA 10")
 *   → { year: "2023", set: "Prizm Monopoly", cardNumber: "81", grade: "PSA 10",
 *       grader: "PSA", gradeNum: 10, parallel: "Base", isRookie: true }
 */

// ── Known sets (order matters — longer/more specific first) ──
const KNOWN_SETS = [
  // Panini basketball/football
  'National Treasures', 'Prizm Monopoly', 'Prizm Draft Picks', 'Prizm',
  'Select Concourse', 'Select Premier', 'Select', 'Mosaic', 'Optic Rated Rookie',
  'Optic', 'Donruss Rated Rookie', 'Donruss Elite', 'Donruss', 'Hoops',
  'Court Kings', 'Revolution', 'Spectra', 'Immaculate', 'Obsidian', 'Origins',
  'Contenders Optic', 'Contenders', 'Noir', 'Crown Royale', 'Absolute',
  'Certified', 'Chronicles', 'Illusions', 'Marquee', 'Recon', 'Playbook',
  'Impeccable', 'One and One', 'Eminence', 'Flawless',
  // Topps baseball/general
  'Topps Chrome Sapphire', 'Topps Chrome', 'Topps Now', 'Topps Heritage',
  'Topps Stadium Club', 'Topps Finest', 'Topps Inception', 'Topps Fire',
  'Topps Update', 'Topps Series 1', 'Topps Series 2', 'Topps Allen & Ginter',
  'Topps Gypsy Queen', 'Topps Tier One', 'Topps Triple Threads',
  'Topps Museum Collection', 'Topps Gold Label', 'Topps',
  // Bowman
  'Bowman Chrome', 'Bowman 1st', 'Bowman Draft', 'Bowman Platinum', 'Bowman',
  // Upper Deck hockey
  'Upper Deck Young Guns', 'Upper Deck Series 1', 'Upper Deck Series 2',
  'Upper Deck', 'SP Authentic', 'SPx', 'O-Pee-Chee', 'OPC',
  // Other
  'Panini Prizm', 'Panini', 'Fleer', 'Score', 'Leaf', 'Sage', 'Press Pass',
  'Wild Card', 'Skybox', 'Stadium Club',
];

// ── Known parallels ──
const KNOWN_PARALLELS = [
  // Prizm parallels
  'Silver Prizm', 'Gold Prizm', 'Green Prizm', 'Blue Prizm', 'Red Prizm',
  'Orange Prizm', 'Pink Prizm', 'Purple Prizm', 'Black Prizm', 'White Prizm',
  'Cracked Ice', 'Mojo', 'Camo', 'Tie-Dye', 'Shimmer', 'Hyper',
  'Red White Blue', 'Red White & Blue', 'Neon Green', 'Choice',
  // Refractors
  'Gold Refractor', 'Blue Refractor', 'Green Refractor', 'Orange Refractor',
  'Red Refractor', 'Purple Refractor', 'Black Refractor', 'Superfractor',
  'Xfractor', 'Refractor',
  // Numbered
  'Gold /10', 'Black /1', 'Platinum /1',
  // Color parallels (generic)
  'Silver', 'Gold', 'Green', 'Blue', 'Red', 'Orange', 'Pink', 'Purple',
  'Black', 'White', 'Yellow', 'Teal', 'Bronze', 'Platinum',
  // Special
  'Holo', 'Holographic', 'Rainbow', 'Speckle', 'Scope', 'Wave',
  'Ice', 'Laser', 'Disco', 'Snakeskin', 'Nebula', 'Tiger Stripe',
  'Fast Break', 'Retail', 'Mega Box', 'Blaster',
];

// ── Graders ──
const GRADER_REGEX = /\b(PSA|BGS|SGC|CGC|HGA|KSA|ISA|GMA|AGS|CSG)\s*(\d+\.?\d*)/i;
const GRADER_REGEX_ALT = /\b(GEM\s*(?:MT|MINT))\s*(\d+)/i;

// ── Parse function ──
export function parseCardTitle(title) {
  if (!title) return null;
  const upper = title.toUpperCase();

  // Year
  const yearMatch = title.match(/\b((?:19|20)\d{2})(?:-(\d{2,4}))?\b/);
  const year = yearMatch ? yearMatch[0] : '';

  // Grade
  let grader = '', gradeNum = 0, grade = '';
  const gradeMatch = title.match(GRADER_REGEX);
  if (gradeMatch) {
    grader = gradeMatch[1].toUpperCase();
    gradeNum = parseFloat(gradeMatch[2]);
    grade = `${grader} ${gradeMatch[2]}`;
  } else {
    const altMatch = title.match(GRADER_REGEX_ALT);
    if (altMatch) {
      grader = 'PSA';
      gradeNum = parseFloat(altMatch[2]);
      grade = `PSA ${altMatch[2]}`;
    }
  }

  // Card number
  const numMatch = title.match(/#\s*(\w+\d+|\d+)/);
  const cardNumber = numMatch ? numMatch[1] : '';

  // Set (match longest first)
  let set = '';
  for (const s of KNOWN_SETS) {
    if (upper.includes(s.toUpperCase())) {
      set = s;
      break;
    }
  }

  // Parallel (match longest first)
  let parallel = 'Base';
  for (const p of KNOWN_PARALLELS) {
    if (upper.includes(p.toUpperCase())) {
      parallel = p;
      break;
    }
  }

  // Rookie
  const isRookie = /\b(RC|ROOKIE|RATED ROOKIE|1ST|FIRST)\b/i.test(upper);

  // Auto
  const isAuto = /\b(AUTO|AUTOGRAPH|SIGNED|ON.?CARD)\b/i.test(upper);

  // Numbered (/25, /99, etc.)
  const numberedMatch = title.match(/\/\s*(\d+)/);
  const numbered = numberedMatch ? parseInt(numberedMatch[1]) : null;

  return {
    year,
    set,
    cardNumber,
    grade,
    grader,
    gradeNum,
    parallel,
    isRookie,
    isAuto,
    numbered,
  };
}

/**
 * Build a compact card description from parsed data.
 * e.g. "2023 Prizm Monopoly #81"
 */
export function buildCardName(parsed, rawTitle) {
  if (!parsed) return rawTitle ? rawTitle.substring(0, 50) : 'Unknown Card';
  const parts = [];
  if (parsed.year) parts.push(parsed.year);
  if (parsed.set) parts.push(parsed.set);
  if (parsed.parallel && parsed.parallel !== 'Base') parts.push(parsed.parallel);
  if (parsed.cardNumber) parts.push(`#${parsed.cardNumber}`);
  const name = parts.join(' ');
  if (!name || name === parsed.year) {
    // Fallback: use first ~50 chars of raw title minus player name and grade
    if (rawTitle) {
      let clean = rawTitle.replace(/\b(PSA|BGS|SGC|CGC)\s*\d+\.?\d*/gi, '').trim();
      return clean.substring(0, 50).trim() || 'Card';
    }
    return 'Card';
  }
  return name;
}

/**
 * Generate a unique key for grouping sales of the same card.
 */
export function cardGroupKey(parsed) {
  if (!parsed) return 'unknown';
  return [
    parsed.year,
    parsed.set,
    parsed.parallel,
    parsed.cardNumber,
    parsed.grade,
  ].filter(Boolean).join('|').toLowerCase();
}
