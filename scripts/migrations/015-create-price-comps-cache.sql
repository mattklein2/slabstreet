-- 015-create-price-comps-cache.sql
-- Cache for eBay sold listing price comps (24h TTL)

CREATE TABLE IF NOT EXISTS price_comps_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text NOT NULL UNIQUE,
  player text,
  parallel_name text,
  source text NOT NULL DEFAULT 'sold',
  raw_stats jsonb,
  graded_stats jsonb,
  listings jsonb NOT NULL DEFAULT '[]'::jsonb,
  listing_price numeric,
  total_count integer NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for cache lookups
CREATE INDEX idx_price_comps_cache_key ON price_comps_cache (cache_key);

-- Index for TTL cleanup queries
CREATE INDEX idx_price_comps_cache_fetched ON price_comps_cache (fetched_at);

-- RLS: allow reads from anon key, writes from service role only
ALTER TABLE price_comps_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON price_comps_cache
  FOR SELECT USING (true);

CREATE POLICY "Allow service write" ON price_comps_cache
  FOR ALL USING (auth.role() = 'service_role');
