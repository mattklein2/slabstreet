// lib/xray/db-matcher.ts

import { supabase } from '../supabase';
import type { CardIdentity, MatchedProduct, MatchedParallel, MatchedCardSet, RainbowEntry } from './types';

// Brand name → brand_id mapping
const BRAND_IDS: Record<string, string> = {
  panini:      'b0000000-0000-0000-0000-000000000001',
  topps:       'b0000000-0000-0000-0000-000000000002',
  'upper deck': 'b0000000-0000-0000-0000-000000000003',
  bowman:      'b0000000-0000-0000-0000-000000000004',
  // Donruss, Hoops, etc. are Panini sub-brands
  donruss:     'b0000000-0000-0000-0000-000000000001',
  hoops:       'b0000000-0000-0000-0000-000000000001',
  score:       'b0000000-0000-0000-0000-000000000001',
};

export interface MatchResult {
  product: MatchedProduct | null;
  cardSet: MatchedCardSet | null;
  parallel: MatchedParallel | null;
  rainbow: RainbowEntry[];
}

function scoreNameMatch(dbName: string, identityName: string): number {
  const dbLower = dbName.toLowerCase().replace(/[!?.']/g, '').trim();
  const idLower = identityName.toLowerCase().replace(/[!?.']/g, '').trim();

  // Exact match
  if (dbLower === idLower) return 10;

  // Normalized exact: strip common suffixes (Prizm, Refractor, Holo, etc.)
  const suffixes = /\s*(prizm|refractor|xfractor|holo|scope|shimmer|disco|wave|ice)\s*$/i;
  const dbNorm = dbLower.replace(suffixes, '').trim();
  const idNorm = idLower.replace(suffixes, '').trim();
  if (dbNorm && idNorm && dbNorm === idNorm) return 8;

  // Bidirectional word match: all words in identity appear in DB name AND vice versa
  const dbWords = dbLower.split(/\s+/);
  const idWords = idLower.split(/\s+/);
  const idInDb = idWords.every(w => dbWords.some(dw => dw.includes(w)));
  const dbInId = dbWords.every(w => idWords.some(iw => iw.includes(w)));
  if (idInDb && dbInId) return 5;

  // Partial: at least half of identity words appear in DB name
  const matchCount = idWords.filter(w => dbWords.some(dw => dw.includes(w))).length;
  if (matchCount >= Math.ceil(idWords.length / 2)) return 2;

  return 0;
}

/**
 * Match a parsed card identity against our product/parallel database.
 *
 * Strategy:
 * 1. Search products by year + sport + name (fuzzy on set name)
 * 2. If product found, fetch all parallels for that product
 * 3. Match the specific parallel by name
 */
export async function matchCard(identity: CardIdentity): Promise<MatchResult> {
  const empty: MatchResult = { product: null, cardSet: null, parallel: null, rainbow: [] };

  // Need at least year and set to match
  if (!identity.year && !identity.set) return empty;

  // Step 1: Find matching product
  let query = supabase
    .from('products')
    .select('id, name, year, sport, is_flagship, description, brand_id, brands(name)')
    .order('is_flagship', { ascending: false });

  if (identity.year) {
    query = query.eq('year', identity.year);
  }
  if (identity.sport) {
    query = query.eq('sport', identity.sport);
  }

  const { data: products, error } = await query;
  if (error || !products || products.length === 0) return empty;

  // Score each product for best match
  const scored = products.map((p: any) => {
    let score = 0;
    const pNameLower = p.name.toLowerCase();

    // Set name match (most important)
    if (identity.set) {
      const setLower = identity.set.toLowerCase();
      // Clean the eBay set name: strip brand/year prefixes
      // e.g. "Panini 2024 Panini Select" → "select", "Topps 2024 Chrome" → "chrome"
      // Note: "Donruss", "Bowman" etc. are both brands AND product names, so we do a
      // two-pass approach: fully cleaned and partially cleaned (keep product-brand names)
      const cleanedSet = setLower
        .replace(/\b(panini|topps|upper\s*deck|leaf|fleer|score)\b/gi, '')
        .replace(/\b20\d{2}(?:-\d{2})?\b/g, '')
        .trim()
        .replace(/\s+/g, ' ');

      if (pNameLower === cleanedSet) score += 12;           // exact match after cleaning
      else if (pNameLower.includes(setLower)) score += 10;  // product contains full eBay set
      else if (setLower.includes(pNameLower)) score += 8;   // eBay set contains product name
      else if (cleanedSet.includes(pNameLower)) score += 8; // cleaned set contains product name
      else if (pNameLower.includes(cleanedSet)) score += 8; // product contains cleaned set
      else {
        // Word-based: all DB product name words appear in the cleaned set
        // e.g. DB "Prizm WNBA" → words ["prizm", "wnba"] all in "prizm monopoly wnba"
        const pWords = pNameLower.split(/\s+/).filter((w: string) => w.length > 1);
        const setWords = cleanedSet.split(/\s+/).filter((w: string) => w.length > 1);
        const allPWordsInSet = pWords.length > 0 && pWords.every((pw: string) => setWords.some((sw: string) => sw.includes(pw)));
        if (allPWordsInSet) score += 6;
      }
    }

    // Brand match
    if (identity.brand) {
      const brandId = BRAND_IDS[identity.brand.toLowerCase()];
      if (brandId && p.brand_id === brandId) score += 3;
    }

    // Year exact match
    if (identity.year && p.year === identity.year) score += 5;

    return { product: p, score };
  });

  // Sort by score descending, take best match
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (best.score < 5) return empty; // no meaningful match

  const p = best.product;
  const matchedProduct: MatchedProduct = {
    productId: p.id,
    productName: p.name,
    brandName: p.brands?.name || '',
    year: p.year,
    sport: p.sport,
    isFlagship: p.is_flagship,
    description: p.description || '',
  };

  // Step 2: Find matching card_set
  const { data: cardSets } = await supabase
    .from('card_sets')
    .select('*')
    .eq('product_id', p.id);

  if (!cardSets || cardSets.length === 0) {
    return { product: matchedProduct, cardSet: null, parallel: null, rainbow: [] };
  }

  let matchedCardSetRow = null;
  if (identity.insert) {
    const scored = cardSets
      .filter((cs: any) => cs.type !== 'base')
      .map((cs: any) => ({ cs, score: scoreNameMatch(cs.name, identity.insert!) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
    matchedCardSetRow = scored.length > 0 ? scored[0].cs : null;
  }
  if (!matchedCardSetRow) {
    matchedCardSetRow = cardSets.find((cs: any) => cs.name === 'Base Set') || cardSets[0];
  }

  const matchedCardSet: MatchedCardSet = {
    cardSetId: matchedCardSetRow.id,
    cardSetName: matchedCardSetRow.name,
    type: matchedCardSetRow.type,
    description: matchedCardSetRow.description,
    cardCount: matchedCardSetRow.card_count,
    odds: matchedCardSetRow.odds,
    boxExclusivity: matchedCardSetRow.box_exclusivity,
  };

  // Step 3: Fetch parallels for this card_set
  let { data: parallels, error: parError } = await supabase
    .from('parallels')
    .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, box_exclusivity')
    .eq('card_set_id', matchedCardSetRow.id)
    .order('rarity_rank', { ascending: false });

  // Fallback: if insert/subset has no parallels, use base set's parallels for rainbow context
  if ((!parallels || parallels.length === 0) && matchedCardSetRow.type !== 'base') {
    const baseSet = cardSets.find((cs: any) => cs.name === 'Base Set') || cardSets.find((cs: any) => cs.type === 'base');
    if (baseSet) {
      const { data: basePars } = await supabase
        .from('parallels')
        .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, box_exclusivity')
        .eq('card_set_id', baseSet.id)
        .order('rarity_rank', { ascending: false });
      if (basePars && basePars.length > 0) {
        parallels = basePars;
      }
    }
  }

  if (parError || !parallels) {
    return { product: matchedProduct, cardSet: matchedCardSet, parallel: null, rainbow: [] };
  }

  // Step 4: Score each parallel
  let matchedParallel: MatchedParallel | null = null;
  if (identity.parallel) {
    const scored = parallels.map((par: any) => ({
      par,
      score: scoreNameMatch(par.name, identity.parallel!),
    }));
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.par.rarity_rank - a.par.rarity_rank;
    });
    if (scored[0]?.score > 0) {
      const par = scored[0].par;
      matchedParallel = {
        parallelId: par.id,
        parallelName: par.name,
        colorHex: par.color_hex,
        printRun: par.print_run,
        serialNumbered: par.serial_numbered,
        rarityRank: par.rarity_rank,
        isOneOfOne: par.is_one_of_one,
        description: par.description || '',
        boxExclusivity: par.box_exclusivity,
      };
    }
  } else {
    const basePar = parallels.find((pp: any) => pp.name.toLowerCase() === 'base');
    if (basePar) {
      matchedParallel = {
        parallelId: basePar.id,
        parallelName: basePar.name,
        colorHex: basePar.color_hex,
        printRun: basePar.print_run,
        serialNumbered: basePar.serial_numbered,
        rarityRank: basePar.rarity_rank,
        isOneOfOne: basePar.is_one_of_one,
        description: basePar.description || '',
        boxExclusivity: basePar.box_exclusivity,
      };
    }
  }

  const rainbow: RainbowEntry[] = parallels.map((par: any) => ({
    parallelId: par.id,
    name: par.name,
    colorHex: par.color_hex,
    printRun: par.print_run,
    serialNumbered: par.serial_numbered,
    rarityRank: par.rarity_rank,
    isOneOfOne: par.is_one_of_one,
    isCurrentCard: matchedParallel ? par.id === matchedParallel.parallelId : false,
    description: par.description || null,
    boxExclusivity: par.box_exclusivity,
  }));

  return { product: matchedProduct, cardSet: matchedCardSet, parallel: matchedParallel, rainbow };
}
