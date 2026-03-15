// lib/xray/price-comps.ts

import { searchComps } from './ebay-client';
import type { CardIdentity, PriceComps, CompListing } from './types';

/**
 * Build price comps for a card by searching eBay for similar active listings.
 *
 * Constructs a targeted search query from the card identity,
 * then computes price statistics from matching listings.
 */
export async function getPriceComps(
  identity: CardIdentity,
  listingPrice: number,
): Promise<PriceComps | null> {
  // Build a focused search query
  const queryParts: string[] = [];

  if (identity.year) queryParts.push(identity.year);
  if (identity.brand) queryParts.push(identity.brand);
  if (identity.set) queryParts.push(identity.set);
  if (identity.player) queryParts.push(identity.player);
  if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
    queryParts.push(identity.parallel);
  }
  if (identity.cardNumber) queryParts.push(`#${identity.cardNumber}`);

  // Need enough info to build a meaningful query
  if (queryParts.length < 3) return null;

  const query = queryParts.join(' ');

  try {
    const items = await searchComps(query, 20);
    if (items.length === 0) return null;

    // Convert to CompListing format and extract prices
    const compListings: CompListing[] = items.map(item => ({
      title: item.title,
      price: parseFloat(item.price.value) || 0,
      url: item.itemWebUrl,
    }));

    // Filter out $0 and outliers (>10x median)
    const prices = compListings
      .map(l => l.price)
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) return null;

    const median = prices[Math.floor(prices.length / 2)];
    const filtered = prices.filter(p => p < median * 10); // remove extreme outliers

    const stats = {
      low: filtered[0],
      median: filtered[Math.floor(filtered.length / 2)],
      high: filtered[filtered.length - 1],
      count: filtered.length,
    };

    const vsMedian = stats.median > 0
      ? Math.round(((listingPrice - stats.median) / stats.median) * 100)
      : null;

    return {
      compListings: compListings.slice(0, 10), // return top 10
      stats,
      listingPrice,
      vsMedian,
    };
  } catch (err) {
    console.error('Price comps error:', err);
    return null;
  }
}
