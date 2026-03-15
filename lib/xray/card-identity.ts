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
    isGraded: (specs['Professional Grader'] || specs['Graded'] || '') !== '',
    grader: specs['Professional Grader'] || null,
    grade: specs['Grade'] || null,
  };

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

  const identity: CardIdentity = {
    player: fromSpecs.player || fromTitle.player,
    year: fromSpecs.year || fromTitle.year,
    brand: fromSpecs.brand || fromTitle.brand,
    set: resolvedSet,
    parallel: resolvedParallel,
    cardNumber: fromSpecs.cardNumber || fromTitle.cardNumber,
    sport: fromSpecs.sport || fromTitle.sport,
    isRookie: fromSpecs.isRookie || fromTitle.isRookie || false,
    isGraded: fromSpecs.isGraded || fromTitle.isGraded || false,
    grader: fromSpecs.grader || fromTitle.grader,
    grade: fromSpecs.grade || fromTitle.grade,
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
  // Check distinctive words (skip generic terms like "Prizm", "Refractor")
  const words = specsParallel.toLowerCase().split(/[\s/&,]+/).filter(w =>
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

// Known parallel keywords
const PARALLELS = [
  'Silver', 'Gold', 'Red', 'Blue', 'Green', 'Black', 'Orange', 'Purple',
  'Pink', 'White', 'Yellow', 'Bronze', 'Platinum', 'Emerald', 'Ruby',
  'Sapphire', 'Diamond', 'Cracked Ice', 'Shimmer', 'Disco', 'Scope',
  'Camo', 'Lazer', 'Laser', 'Neon', 'Snakeskin', 'Peacock', 'Tiger',
  'Nebula', 'Wave', 'Mojo', 'Hyper', 'Fast Break', 'Holo',
  'Refractor', 'Xfractor', 'Prizm', 'Ice', 'Color Blast',
  'No Huddle', 'Choice', 'Fanatics', 'Asia',
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
  cardNumber: string | null;
  sport: string | null;
  isRookie: boolean;
  isGraded: boolean;
  grader: string | null;
  grade: string | null;
}

function parseTitleFallback(title: string): TitleParsed {
  const result: TitleParsed = {
    player: null, year: null, brand: null, set: null, parallel: null,
    cardNumber: null, sport: null, isRookie: false, isGraded: false,
    grader: null, grade: null,
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

  // Parallel — find color/variant keyword and capture compound name (e.g. "Pink Prizm")
  const cleanLower = clean.toLowerCase();
  for (const par of PARALLELS) {
    const idx = cleanLower.indexOf(par.toLowerCase());
    if (idx !== -1) {
      // Try to capture a compound parallel (e.g. "Pink Prizm", "Neon Green Scope")
      // by grabbing the matched word plus surrounding parallel-adjacent words
      const after = clean.substring(idx + par.length).match(/^\s+(Prizm|Refractor|Xfractor|Holo|Scope|Shimmer|Disco|Wave|Ice)\b/i);
      result.parallel = after ? `${par} ${after[1]}` : par;
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
