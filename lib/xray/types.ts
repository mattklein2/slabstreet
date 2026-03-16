// lib/xray/types.ts

/** Raw parsed identity from eBay listing data */
export interface CardIdentity {
  player: string | null;
  year: string | null;
  brand: string | null;
  set: string | null;
  parallel: string | null;
  insert?: string | null;      // "Downtown", "Kaboom!", etc. — null/undefined for base cards
  cardNumber: string | null;
  sport: string | null;
  isRookie: boolean;
  isGraded: boolean;
  grader: string | null;    // PSA, BGS, SGC, CGC
  grade: string | null;     // "10", "9.5", etc.
  raw: {                    // original source data for debugging
    title: string;
    itemSpecifics: Record<string, string>;
  };
}

/** eBay listing data from getItem API */
export interface EbayListingData {
  itemId: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  imageUrl: string;
  itemUrl: string;
  seller: string;
  itemSpecifics: Record<string, string>;
  listingType: string;  // 'FIXED_PRICE' | 'AUCTION'
}

/** Matched product from our database */
export interface MatchedProduct {
  productId: string;
  productName: string;
  brandName: string;
  year: string;
  sport: string;
  isFlagship: boolean;
  description: string;
}

/** Matched card set from our database */
export interface MatchedCardSet {
  cardSetId: string;
  cardSetName: string;
  type: 'base' | 'insert' | 'subset';
  description: string | null;
  cardCount: number | null;
  odds: string | null;
  boxExclusivity: string[] | null;
}

/** Matched parallel with its rainbow context */
export interface MatchedParallel {
  parallelId: string;
  parallelName: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  description: string;
  boxExclusivity: string[] | null;
}

/** Full parallel rainbow for the product */
export interface RainbowEntry {
  parallelId: string;
  name: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  isCurrentCard: boolean;  // true for the matched parallel
  description: string | null;
  boxExclusivity: string[] | null;
}

/** Grading info for a sold listing */
export interface GradeInfo {
  grader: string;  // PSA, BGS, SGC, etc.
  grade: string;   // "10", "9.5", etc.
}

/** Cache metadata for price comps */
export interface CacheInfo {
  cached: boolean;
  fetchedAt: string;  // ISO timestamp of when data was scraped
}

/** A single sold or active comp listing */
export interface CompListing {
  title: string;
  price: number;
  url: string;
  date: string;              // "Mar 14, 2026" or "" for active listings
  condition: 'raw' | 'graded';
  gradeInfo: GradeInfo | null;
}

/** Stats for a price segment (raw or graded) */
export interface SegmentStats {
  low: number;
  median: number;
  high: number;
  count: number;
  listings: CompListing[];   // all listings in this segment, most recent first
}

/** Computed price context from eBay sold + active data */
export interface PriceComps {
  source: 'sold' | 'active';      // which data source was used
  raw: SegmentStats | null;        // raw card sales
  graded: SegmentStats | null;     // graded card sales
  primarySegment: 'raw' | 'graded'; // which segment to highlight
  listingPrice: number;             // current listing price
  vsMedian: number | null;          // % above/below primary segment median
  totalCount: number;               // total sales across both segments
  cacheInfo?: CacheInfo;  // present when served from cache
}

/** Full X-Ray API response */
export interface XRayResult {
  status: 'matched' | 'partial' | 'unmatched';
  listing: EbayListingData;
  identity: CardIdentity;
  product: MatchedProduct | null;
  matchedParallel: MatchedParallel | null;
  matchedCardSet: MatchedCardSet | null;
  rainbow: RainbowEntry[];
  priceComps: PriceComps | null;
  education: {
    setDescription: string | null;
    parallelDescription: string | null;
    flagshipContext: string | null;
    insertDescription: string | null;
  };
  resultId?: string;  // present after save, used for shareable URL
}

/** Error response */
export interface XRayError {
  error: string;
  code: 'INVALID_URL' | 'UNSUPPORTED_MARKETPLACE' | 'EBAY_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR';
}
