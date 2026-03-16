// lib/xray/price-cache.ts

import { supabase } from '../supabase';
import type { PriceComps, CacheInfo } from './types';

const CACHE_TTL_HOURS = 24;

/**
 * Normalize a player name for use in cache keys.
 */
function normalizePlayer(player: string): string {
  return player.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Build a cache key. Uses parallelId + player for matched cards (so different
 * players sharing the same parallel get separate cache entries).
 * Falls back to ebay:{itemId} for unmatched cards.
 */
export function buildCacheKey(
  parallelId: string | null,
  player: string | null,
  ebayItemId: string,
): string {
  if (parallelId && player) {
    return `${parallelId}:${normalizePlayer(player)}`;
  }
  return `ebay:${ebayItemId}`;
}

/**
 * Look up cached price comps. Returns null on cache miss.
 */
export async function getCachedComps(cacheKey: string): Promise<PriceComps | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('price_comps_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .gt('fetched_at', cutoff)
    .limit(1)
    .single();

  if (error || !data) return null;

  const cacheInfo: CacheInfo = {
    cached: true,
    fetchedAt: data.fetched_at,
  };

  // Rebuild SegmentStats with listings from the flat listings array
  const allListings = (data.listings || []) as any[];
  const rawListings = allListings.filter((l: any) => l.condition === 'raw');
  const gradedListings = allListings.filter((l: any) => l.condition === 'graded');

  const rawStats = data.raw_stats
    ? { ...data.raw_stats, listings: rawListings }
    : null;
  const gradedStats = data.graded_stats
    ? { ...data.graded_stats, listings: gradedListings }
    : null;

  return {
    source: data.source as 'sold' | 'active',
    raw: rawStats,
    graded: gradedStats,
    primarySegment: rawStats ? 'raw' : 'graded',
    listingPrice: 0,   // recomputed by caller with current listing price
    vsMedian: null,     // recomputed by caller
    totalCount: data.total_count,
    cacheInfo,
  };
}

/**
 * Store price comps in the cache. Fire-and-forget (don't await in hot path).
 */
export async function setCachedComps(
  cacheKey: string,
  comps: PriceComps,
  player: string | null,
  parallelName: string | null,
): Promise<void> {
  // Store stats without nested listings (listings go in their own column)
  const stripListings = (stats: any) =>
    stats ? { low: stats.low, median: stats.median, high: stats.high, count: stats.count } : null;

  const row = {
    cache_key: cacheKey,
    player: player || null,
    parallel_name: parallelName || null,
    source: comps.source,
    raw_stats: stripListings(comps.raw),
    graded_stats: stripListings(comps.graded),
    listings: [
      ...(comps.raw?.listings || []),
      ...(comps.graded?.listings || []),
    ],
    listing_price: comps.listingPrice,
    total_count: comps.totalCount,
    fetched_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('price_comps_cache')
    .upsert(row, { onConflict: 'cache_key' });

  if (error) {
    console.error('[price-cache] upsert error:', error.message);
  }
}
