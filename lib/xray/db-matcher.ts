// lib/xray/db-matcher.ts

import { supabase } from '../supabase';
import type { CardIdentity, MatchedProduct, MatchedParallel, RainbowEntry } from './types';

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
  parallel: MatchedParallel | null;
  rainbow: RainbowEntry[];
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
  const empty: MatchResult = { product: null, parallel: null, rainbow: [] };

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
      if (pNameLower.includes(setLower)) score += 10;
      // Handle "Donruss Optic" → product named "Optic"
      else if (setLower === 'optic' && pNameLower.includes('optic')) score += 10;
      else if (setLower === 'chrome' && pNameLower.includes('chrome')) score += 10;
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

  // Step 2: Fetch all parallels for this product
  const { data: parallels, error: parError } = await supabase
    .from('parallels')
    .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, box_exclusivity')
    .eq('product_id', p.id)
    .order('rarity_rank', { ascending: false });

  if (parError || !parallels) {
    return { product: matchedProduct, parallel: null, rainbow: [] };
  }

  // Step 3: Build rainbow and find matched parallel
  let matchedParallel: MatchedParallel | null = null;

  const rainbow: RainbowEntry[] = parallels.map((par: any) => {
    const isMatch = identity.parallel
      ? par.name.toLowerCase().includes(identity.parallel.toLowerCase()) ||
        identity.parallel.toLowerCase().includes(par.name.toLowerCase())
      : par.name.toLowerCase() === 'base'; // default to Base if no parallel specified

    if (isMatch && !matchedParallel) {
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

    return {
      name: par.name,
      colorHex: par.color_hex,
      printRun: par.print_run,
      serialNumbered: par.serial_numbered,
      rarityRank: par.rarity_rank,
      isOneOfOne: par.is_one_of_one,
      isCurrentCard: isMatch && (matchedParallel?.parallelId === par.id),
      boxExclusivity: par.box_exclusivity,
    };
  });

  // Fix isCurrentCard — only the first match should be true
  if (matchedParallel) {
    rainbow.forEach(r => {
      r.isCurrentCard = r.name === (matchedParallel as MatchedParallel).parallelName &&
                        r.rarityRank === (matchedParallel as MatchedParallel).rarityRank;
    });
  }

  return { product: matchedProduct, parallel: matchedParallel, rainbow };
}
