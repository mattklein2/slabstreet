// lib/xray/price-comps.ts

import { searchSoldListings, buildSoldQuery } from './ebay-sold';
import { searchComps } from './ebay-client';
import type { CardIdentity, PriceComps, CompListing, SegmentStats } from './types';

/**
 * Compute stats for a list of comp listings.
 */
function computeStats(listings: CompListing[]): SegmentStats | null {
  if (listings.length === 0) return null;
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  return {
    low: prices[0],
    median: prices[Math.floor(prices.length / 2)],
    high: prices[prices.length - 1],
    count: prices.length,
    listings,
  };
}

/**
 * Build price comps from sold data (primary) or active listings (fallback).
 */
export async function getPriceComps(
  identity: CardIdentity,
  listingPrice: number,
): Promise<PriceComps | null> {
  const query = buildSoldQuery(identity);
  if (!query) return null;

  // Try sold data first
  const soldItems = await searchSoldListings(query);

  if (soldItems.length > 0) {
    // Convert to CompListing format
    const allComps: CompListing[] = soldItems.map(item => ({
      title: item.title,
      price: item.price,
      url: item.url,
      date: item.date,
      condition: item.condition,
      gradeInfo: item.grader ? { grader: item.grader, grade: item.grade! } : null,
    }));

    const rawListings = allComps.filter(c => c.condition === 'raw');
    const gradedListings = allComps.filter(c => c.condition === 'graded');

    const rawStats = computeStats(rawListings);
    const gradedStats = computeStats(gradedListings);

    // Determine primary segment based on the card being X-Ray'd
    const primarySegment: 'raw' | 'graded' = identity.isGraded ? 'graded' : 'raw';
    const primaryStats = primarySegment === 'raw' ? rawStats : gradedStats;

    // vs Median: compare listing price against primary segment
    let vsMedian: number | null = null;
    if (primaryStats && primaryStats.median > 0) {
      vsMedian = Math.round(((listingPrice - primaryStats.median) / primaryStats.median) * 100);
    }

    return {
      source: 'sold',
      raw: rawStats,
      graded: gradedStats,
      primarySegment,
      listingPrice,
      vsMedian,
      totalCount: soldItems.length,
    };
  }

  // Fallback: active listings from Browse API
  try {
    const queryParts: string[] = [];
    if (identity.year) queryParts.push(identity.year);
    if (identity.brand) queryParts.push(identity.brand);
    if (identity.set) queryParts.push(identity.set);
    if (identity.player) queryParts.push(identity.player);
    if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
      queryParts.push(identity.parallel);
    }
    if (queryParts.length < 3) return null;

    const items = await searchComps(queryParts.join(' '), 20);
    if (items.length === 0) return null;

    const allComps: CompListing[] = items
      .map(item => ({
        title: item.title,
        price: parseFloat(item.price.value) || 0,
        url: item.itemWebUrl,
        date: '',
        condition: 'raw' as const,
        gradeInfo: null,
      }))
      .filter(c => c.price > 0);

    if (allComps.length === 0) return null;

    const stats = computeStats(allComps);

    let vsMedian: number | null = null;
    if (stats && stats.median > 0) {
      vsMedian = Math.round(((listingPrice - stats.median) / stats.median) * 100);
    }

    return {
      source: 'active',
      raw: stats,
      graded: null,
      primarySegment: 'raw',
      listingPrice,
      vsMedian,
      totalCount: allComps.length,
    };
  } catch (err) {
    console.error('Price comps fallback error:', err);
    return null;
  }
}
