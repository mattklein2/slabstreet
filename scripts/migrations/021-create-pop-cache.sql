-- 021: Create pop_cache table for PSA population report data
-- Caches PSA pop data by card identity, 7-day TTL
-- SpecIDs discovered via cert lookups are stored so future raw card lookups can reuse them

CREATE TABLE IF NOT EXISTS pop_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spec_id integer NOT NULL,
  cache_key text NOT NULL UNIQUE,
  spec_desc text,
  grade_data jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pop_cache_key ON pop_cache (cache_key);
CREATE INDEX idx_pop_cache_fetched ON pop_cache (fetched_at);

ALTER TABLE pop_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON pop_cache
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous inserts" ON pop_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" ON pop_cache
  FOR UPDATE USING (true);
