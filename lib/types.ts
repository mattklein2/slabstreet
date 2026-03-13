// lib/types.ts

// Database row types (snake_case, matching Supabase)
export interface DbProduct {
  id: string;
  brand_id: string;
  name: string;
  sport: string;
  year: string;
  description: string;
  release_date: string | null;
  is_flagship: boolean;
  pros_cons: { pros: string[]; cons: string[] } | null;
}

export interface DbParallel {
  id: string;
  product_id: string;
  name: string;
  color_hex: string;
  print_run: number | null;
  serial_numbered: boolean;
  rarity_rank: number;
  is_one_of_one: boolean;
  description: string;
  special_attributes: string[] | null;
  box_exclusivity: string[] | null;
}

export interface DbBoxConfig {
  id: string;
  product_id: string;
  config_type: string;
  retail_price_usd: number | null;
  packs_per_box: number;
  cards_per_pack: number;
  guaranteed_hits: string | null;
  odds_auto: string | null;
  odds_relic: string | null;
  odds_numbered: string | null;
  description: string;
  pros_cons: { pros: string[]; cons: string[] } | null;
}

export interface DbRetailer {
  id: string;
  name: string;
}

export interface DbProductRetailer {
  id: string;
  product_id: string;
  retailer_id: string;
  config_types: string[];
  notes: string | null;
}

export interface DbTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  related_product_ids: string[] | null;
  related_topic_slugs: string[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// API response types (camelCase)
export interface ProductItem {
  id: string;
  name: string;
  year: string;
  isFlagship: boolean;
  description: string;
}

export interface ParallelItem {
  id: string;
  name: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  description: string;
  specialAttributes: string[] | null;
  boxExclusivity: string[] | null;
  totalParallels: number;
}

export interface BoxResult {
  product: {
    id: string;
    name: string;
    year: string;
    isFlagship: boolean;
    prosCons: { pros: string[]; cons: string[] } | null;
  };
  boxConfig: {
    id: string;
    configType: string;
    retailPriceUsd: number | null;
    packsPerBox: number;
    cardsPerPack: number;
    guaranteedHits: string | null;
    oddsAuto: string | null;
    oddsRelic: string | null;
    oddsNumbered: string | null;
    description: string;
    prosCons: { pros: string[]; cons: string[] } | null;
  };
  retailer: {
    name: string;
    notes: string | null;
  } | null;
}

export interface TopicItem {
  slug: string;
  title: string;
  category: string;
  summary: string;
  sortOrder: number;
}

export interface TopicDetail extends TopicItem {
  body: string;
  relatedProductNames: string[];
  relatedTopicSlugs: string[];
}

// Sport config
export const SPORTS = [
  { label: 'Basketball', value: 'NBA', icon: '🏀' },
  { label: 'Football', value: 'NFL', icon: '🏈' },
  { label: 'Baseball', value: 'MLB', icon: '⚾' },
  { label: 'Hockey', value: 'NHL', icon: '🏒' },
] as const;

export type SportValue = typeof SPORTS[number]['value'];
