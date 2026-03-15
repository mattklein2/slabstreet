// lib/xray/types.ts

/** Raw parsed identity from eBay listing data */
export interface CardIdentity {
  player: string | null;
  year: string | null;
  brand: string | null;
  set: string | null;
  parallel: string | null;
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
  name: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  isCurrentCard: boolean;  // true for the matched parallel
  boxExclusivity: string[] | null;
}

/** Price comp data from eBay active listings (sold/completed data requires Finding API — Phase 2) */
export interface PriceComps {
  compListings: CompListing[];
  stats: {
    low: number;
    median: number;
    high: number;
    count: number;
  };
  listingPrice: number;       // current listing price
  vsMedian: number | null;    // percentage above/below median
}

export interface CompListing {
  title: string;
  price: number;
  url: string;
}

/** Full X-Ray API response */
export interface XRayResult {
  status: 'matched' | 'partial' | 'unmatched';
  listing: EbayListingData;
  identity: CardIdentity;
  product: MatchedProduct | null;
  matchedParallel: MatchedParallel | null;
  rainbow: RainbowEntry[];
  priceComps: PriceComps | null;
  education: {
    setDescription: string | null;
    parallelDescription: string | null;
    flagshipContext: string | null;
  };
}

/** Error response */
export interface XRayError {
  error: string;
  code: 'INVALID_URL' | 'UNSUPPORTED_MARKETPLACE' | 'EBAY_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR';
}
