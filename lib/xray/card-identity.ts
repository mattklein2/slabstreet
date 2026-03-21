// lib/xray/card-identity.ts

import type { CardIdentity, EbayListingData } from './types';

/**
 * Extract card identity from eBay listing data.
 * Two-pass approach:
 *   1. Structured pass: use Item Specifics (reliable when present)
 *   2. Title fallback: parse title for anything Item Specifics missed
 */
export function parseCardIdentity(listing: EbayListingData): CardIdentity {
  const specs = listing.itemSpecifics;
  const title = listing.title;

  // Pass 1: Item Specifics (structured data)
  const fromSpecs: Partial<CardIdentity> = {
    player: specs['Player/Athlete'] || specs['Player'] || null,
    year: specs['Year'] || specs['Season'] || null,
    brand: specs['Manufacturer'] || specs['Brand'] || null,
    set: specs['Set'] || null,
    parallel: specs['Parallel/Variety'] || specs['Parallel'] || null,
    cardNumber: specs['Card Number'] || null,
    sport: normalizeSport(specs['Sport'] || null),
    isRookie: /rookie/i.test(specs['Features'] || '') || /rookie/i.test(specs['Card Attributes'] || ''),
    isAutographed: /yes/i.test(specs['Autographed'] || '') || /auto/i.test(specs['Features'] || '') || /auto/i.test(specs['Card Attributes'] || ''),
    isGraded: (specs['Professional Grader'] || specs['Graded'] || '') !== '',
    grader: specs['Professional Grader'] || null,
    grade: specs['Grade'] || null,
  };

  // Check Item Specifics for insert name
  const rawSpecsInsert = specs['Insert Set'] || specs['Insert'] || specs['Card Name'] || specs['Subset'] || null;
  // Guard: if the "insert" value is actually the player name, ignore it
  const playerName = (fromSpecs.player || '').toLowerCase();
  const specsInsert = rawSpecsInsert && playerName && rawSpecsInsert.toLowerCase() === playerName
    ? null
    : rawSpecsInsert;

  // Pass 2: Fill gaps from title
  const fromTitle = parseTitleFallback(title);

  // If specs parallel matches the set name, it's likely the set name not a real parallel
  // (e.g. Parallel/Variety: "Prizm" for a Prizm card — eBay sellers do this constantly)
  const specsParallel = fromSpecs.parallel;
  const resolvedSet = fromSpecs.set || fromTitle.set;
  const parallelMatchesSet = specsParallel && resolvedSet &&
    specsParallel.toLowerCase() === resolvedSet.toLowerCase();

  // Cross-check specs parallel against title. Sellers often copy-paste wrong item specifics
  // but get the title right (buyers see the title, so sellers care about it being accurate).
  // If the distinctive words from specs parallel don't appear in the title, prefer title.
  const specsParallelConfirmed = specsParallel && !parallelMatchesSet
    ? parallelConfirmedByTitle(specsParallel, title)
    : false;

  const resolvedParallel = parallelMatchesSet
    ? (fromTitle.parallel || specsParallel || null)  // prefer title parse when specs parallel = set name
    : specsParallelConfirmed
      ? (specsParallel || null)                       // specs parallel confirmed by title
      : (fromTitle.parallel || specsParallel || null); // prefer title when specs not in title

  // If the resolved parallel is actually a known insert name, move it to insert
  // e.g. eBay Parallel/Variety: "Downtown" should be insert, not parallel
  let finalParallel = resolvedParallel;
  let finalInsert = specsInsert || (fromTitle.insert && playerName && fromTitle.insert.toLowerCase() === playerName ? null : fromTitle.insert) || null;
  if (finalParallel && !finalInsert) {
    const parLower = finalParallel.toLowerCase();
    const isInsertName = INSERTS.some(ins => parLower === ins.toLowerCase() || parLower.includes(ins.toLowerCase()));
    if (isInsertName) {
      finalInsert = finalParallel;
      finalParallel = null;
    }
  }

  // Sport override: WNBA cards have Sport="Basketball" on eBay but we track them as WNBA
  let resolvedSport = fromSpecs.sport || fromTitle.sport;
  const league = (specs['League'] || '').toLowerCase();
  const setStr = (resolvedSet || '').toLowerCase();
  if (league.includes('wnba') || setStr.includes('wnba')) {
    resolvedSport = 'WNBA';
  }

  // Extract certification number (PSA/BGS cert for pop report lookup)
  const certNumber = extractCertNumber(specs, title);

  const identity: CardIdentity = {
    player: fromSpecs.player || fromTitle.player,
    year: fromSpecs.year || fromTitle.year,
    brand: fromSpecs.brand || fromTitle.brand,
    set: resolvedSet,
    parallel: finalParallel,
    insert: finalInsert,
    cardNumber: fromSpecs.cardNumber || fromTitle.cardNumber,
    sport: resolvedSport,
    isRookie: fromSpecs.isRookie || fromTitle.isRookie || false,
    isAutographed: fromSpecs.isAutographed || fromTitle.isAutographed || false,
    isGraded: fromSpecs.isGraded || fromTitle.isGraded || false,
    grader: fromSpecs.grader || fromTitle.grader,
    grade: fromSpecs.grade || fromTitle.grade,
    certNumber,
    raw: {
      title,
      itemSpecifics: specs,
    },
  };

  return identity;
}

// ── Sport normalization ──────────────────────────────────────
function normalizeSport(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('wnba')) return 'WNBA';
  if (lower.includes('basketball')) return 'NBA';
  if (lower.includes('football') && !lower.includes('soccer')) return 'NFL';
  if (lower.includes('baseball')) return 'MLB';
  if (lower.includes('formula') || lower.includes('f1') || lower.includes('racing')) return 'F1';
  if (lower.includes('wnba')) return 'WNBA';
  if (lower.includes('soccer')) return 'Soccer';
  if (lower.includes('hockey')) return 'NHL';
  return raw;
}

// ── Parallel cross-check ────────────────────────────────────
// Generic terms that don't help distinguish one parallel from another
const GENERIC_PARALLEL_TERMS = new Set([
  'prizm', 'refractor', 'xfractor', 'holo', 'parallel', 'variation',
  'variant', 'die', 'cut', 'die-cut',
]);

/**
 * Check whether the specs parallel is confirmed by the listing title.
 * Extracts distinctive words (colors, variant names) from the specs parallel
 * and checks if at least one appears in the title.
 */
function parallelConfirmedByTitle(specsParallel: string, title: string): boolean {
  const titleLower = title.toLowerCase();
  // Full substring match
  if (titleLower.includes(specsParallel.toLowerCase())) return true;

  // If specs contain a color word, that color MUST appear in the title.
  // This catches sellers who enter "No Huddle Blue" when the card is actually Gold.
  const COLOR_WORDS = new Set([
    'red', 'blue', 'green', 'gold', 'silver', 'black', 'orange', 'purple',
    'pink', 'yellow', 'white', 'teal', 'bronze', 'ruby', 'sapphire',
    'emerald', 'neon', 'camo', 'aqua', 'magenta', 'crimson', 'navy',
  ]);
  const specWords = specsParallel.toLowerCase().split(/[\s/&,]+/);
  const specColors = specWords.filter(w => COLOR_WORDS.has(w));
  if (specColors.length > 0 && !specColors.some(c => titleLower.includes(c))) {
    return false;
  }

  // Check distinctive words (skip generic terms like "Prizm", "Refractor")
  const words = specWords.filter(w =>
    w.length > 2 && !GENERIC_PARALLEL_TERMS.has(w)
  );
  return words.length > 0 && words.some(w => titleLower.includes(w));
}

// ── Title parser ─────────────────────────────────────────────

// Known brand names
const BRANDS = [
  'Panini', 'Topps', 'Upper Deck', 'Bowman', 'Leaf', 'Sage',
  'Futera', 'Donruss', 'Fleer', 'Score',
];

// Known set names (order matters — longer names first to avoid partial matches)
const SETS = [
  'National Treasures', 'Immaculate Collection', 'Flawless',
  'Spectra', 'Crown Royale', 'Court Kings', 'Revolution',
  'Prizm', 'Chrome', 'Select', 'Optic', 'Mosaic', 'Contenders',
  'Donruss', 'Hoops', 'Origins', 'Obsidian', 'Certified',
  'Absolute', 'Playbook', 'Plates & Patches', 'Noir',
  'Heritage', 'Series 1', 'Series 2', 'Update', 'Stadium Club',
  'Bowman Chrome', 'Bowman 1st', 'Topps Chrome', 'Gypsy Queen',
  'Allen & Ginter', 'Archives', 'Gallery', 'Luminance',
  'Clearly Donruss', 'Illusions', 'Phoenix', 'Flux',
];

// Named parallels (multi-word, checked FIRST to avoid partial color matches)
const NAMED_PARALLELS = [
  'No Huddle', 'Choice', 'Fanatics', 'Asia', 'Fast Break', 'Cracked Ice',
];

// Color and pattern parallel keywords (checked after named parallels)
const COLOR_PARALLELS = [
  'Silver', 'Gold', 'Red', 'Blue', 'Green', 'Black', 'Orange', 'Purple',
  'Pink', 'White', 'Yellow', 'Bronze', 'Platinum', 'Emerald', 'Ruby',
  'Sapphire', 'Diamond', 'Shimmer', 'Disco', 'Scope',
  'Camo', 'Lazer', 'Laser', 'Neon', 'Snakeskin', 'Peacock', 'Tiger',
  'Nebula', 'Wave', 'Mojo', 'Hyper', 'Holo',
  'Refractor', 'Xfractor', 'Prizm', 'Ice',
];

// Combined: named first, then colors
const PARALLELS = [...NAMED_PARALLELS, ...COLOR_PARALLELS];

// Colors that can modify a named parallel (e.g. "No Huddle Gold", "Choice Blue")
const COLOR_MODIFIERS = new Set([
  'gold', 'silver', 'red', 'blue', 'green', 'black', 'orange', 'purple',
  'pink', 'white', 'yellow', 'bronze', 'neon', 'teal', 'platinum',
]);

// Known insert set names (not parallels — separate card subsets within a product)
const INSERTS = [
  'Downtown', 'Kaboom', 'Color Blast', 'Fireworks', 'Instant Impact',
  'Stained Glass', 'Swagger', 'Behind the Glass', 'Case Hit',
  'My City', 'Exhibition', 'Star Gazing', 'Blank Slate',
  'Sensational', 'Phenomenon', 'Hobby Horse', 'Crusade',
  'Astro', 'Laser Show', 'Hype', 'Unleashed', 'Vortex',
  'Rookie Ticket', 'Contenders Rookie Ticket',
  'Hall of Fame', 'Legendary', 'Franchise', 'Iconic',
  'Rookie Patch Autograph', 'RPA', 'Logoman',
  'National Pride', 'Emergent', 'My House',
  'Net Marvels', 'Fearless', 'Far Out', 'Shock Wave',
  'Rookie Revolution', 'All Day', 'Number Ones',
];

// Grading companies & grade patterns
const GRADERS = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG', 'HGA', 'KSA', 'AGS'];
const GRADE_PATTERN = new RegExp(
  `(${GRADERS.join('|')})\\s*(\\d+\\.?\\d*)`,
  'i',
);

// Year patterns: "2023-24" or "2023" or "'23"
const YEAR_PATTERN = /\b(20\d{2}(?:-\d{2})?)\b|'(\d{2})\b/;

// Card number: #235, No. 235, Card #235
const CARD_NUM_PATTERN = /(?:#|No\.?\s*|Card\s*#?)(\d{1,4})\b/i;

// Junk words to ignore
const JUNK = /\b(INVEST|GOAT|HOT|FIRE|PSA\s*READY|BGS\s*READY|GEM\s*MINT|LOOK|WOW|RARE|SP|SSP)\b/gi;

interface TitleParsed {
  player: string | null;
  year: string | null;
  brand: string | null;
  set: string | null;
  parallel: string | null;
  insert: string | null;
  cardNumber: string | null;
  sport: string | null;
  isRookie: boolean;
  isAutographed: boolean;
  isGraded: boolean;
  grader: string | null;
  grade: string | null;
}

function parseTitleFallback(title: string): TitleParsed {
  const result: TitleParsed = {
    player: null, year: null, brand: null, set: null, parallel: null,
    insert: null, cardNumber: null, sport: null, isRookie: false,
    isAutographed: false, isGraded: false, grader: null, grade: null,
  };

  // Clean junk words
  let clean = title.replace(JUNK, ' ').replace(/\s+/g, ' ').trim();

  // Year
  const yearMatch = clean.match(YEAR_PATTERN);
  if (yearMatch) {
    result.year = yearMatch[1] || `20${yearMatch[2]}`;
  }

  // Grade (before removing grader names)
  const gradeMatch = clean.match(GRADE_PATTERN);
  if (gradeMatch) {
    result.isGraded = true;
    result.grader = gradeMatch[1].toUpperCase();
    result.grade = gradeMatch[2];
  }

  // Brand
  for (const brand of BRANDS) {
    if (clean.toLowerCase().includes(brand.toLowerCase())) {
      result.brand = brand;
      break;
    }
  }

  // Set (check longer names first)
  for (const set of SETS) {
    if (clean.toLowerCase().includes(set.toLowerCase())) {
      result.set = set;
      break;
    }
  }

  // Parallel — find color/variant keyword and capture compound name
  const cleanLower = clean.toLowerCase();
  for (const par of PARALLELS) {
    const idx = cleanLower.indexOf(par.toLowerCase());
    if (idx !== -1) {
      const remainder = clean.substring(idx + par.length);
      const isNamed = NAMED_PARALLELS.some(np => np.toLowerCase() === par.toLowerCase());

      if (isNamed) {
        // Named parallel: capture following color + optional tech suffix
        // e.g. "No Huddle Gold", "Choice Blue Shimmer", "Fast Break Neon Green"
        const colorAfter = remainder.match(/^\s+(\w+)/i);
        if (colorAfter && COLOR_MODIFIERS.has(colorAfter[1].toLowerCase())) {
          const techAfter = remainder.substring(colorAfter[0].length)
            .match(/^\s+(Prizm|Refractor|Xfractor|Holo|Scope|Shimmer|Disco|Wave|Ice)\b/i);
          result.parallel = techAfter
            ? `${par} ${colorAfter[1]} ${techAfter[1]}`
            : `${par} ${colorAfter[1]}`;
        } else {
          // No color after — check for tech suffix only
          const techAfter = remainder.match(/^\s+(Prizm|Refractor|Xfractor|Holo|Scope|Shimmer|Disco|Wave|Ice)\b/i);
          result.parallel = techAfter ? `${par} ${techAfter[1]}` : par;
        }
      } else {
        // Color/pattern parallel: capture tech suffix (e.g. "Pink Prizm", "Neon Green Scope")
        const after = remainder.match(/^\s+(Prizm|Refractor|Xfractor|Holo|Scope|Shimmer|Disco|Wave|Ice)\b/i);
        result.parallel = after ? `${par} ${after[1]}` : par;
      }
      break;
    }
  }

  // Insert set detection — checked AFTER parallels so both can coexist
  // (e.g., "Downtown Gold /10" = insert: Downtown, parallel: Gold)
  for (const ins of INSERTS) {
    if (cleanLower.includes(ins.toLowerCase())) {
      result.insert = ins;
      break;
    }
  }

  // Card number
  const numMatch = clean.match(CARD_NUM_PATTERN);
  if (numMatch) {
    result.cardNumber = numMatch[1];
  }

  // Rookie
  result.isRookie = /\b(RC|Rookie)\b/i.test(clean);

  // Autograph
  result.isAutographed = /\b(auto|autograph|autographed|signed|on[- ]?card\s*auto|RPA)\b/i.test(clean);

  // Sport (from title — less reliable)
  if (/\b(basketball|NBA)\b/i.test(clean)) result.sport = 'NBA';
  else if (/\b(football|NFL)\b/i.test(clean)) result.sport = 'NFL';
  else if (/\b(baseball|MLB)\b/i.test(clean)) result.sport = 'MLB';
  else if (/\b(F1|Formula|racing)\b/i.test(clean)) result.sport = 'F1';

  // Player: whatever's left after removing known tokens is likely the player name
  // This is a rough heuristic — Item Specifics is much more reliable
  // We don't attempt player extraction from title in Phase 1; it's too error-prone

  return result;
}

// ── Cert number extraction ──────────────────────────────────
// PSA cert numbers are typically 8-10 digits, sometimes prefixed with #
const CERT_PATTERN = /\b(?:cert(?:ification)?\.?\s*(?:#|number|num|no\.?)?\s*)?(\d{7,10})\b/i;

function extractCertNumber(specs: Record<string, string>, title: string): string | null {
  // Item Specifics is the most reliable source
  const specCert = specs['Certification Number'] || specs['Cert Number'] || specs['PSA Certification Number'] || null;
  if (specCert) {
    const cleaned = specCert.replace(/\D/g, '');
    if (cleaned.length >= 7 && cleaned.length <= 10) return cleaned;
  }

  // Fallback: title parsing (less reliable, only for graded cards)
  // Only try if the title mentions a grading company
  const hasGrader = GRADERS.some(g => title.toUpperCase().includes(g));
  if (!hasGrader) return null;

  const match = title.match(CERT_PATTERN);
  if (match) {
    const num = match[1];
    // Avoid false positives: cert numbers are 7-10 digits, card numbers are typically 1-4 digits
    // Also avoid matching years (4 digits)
    if (num.length >= 7 && num.length <= 10) return num;
  }

  return null;
}
