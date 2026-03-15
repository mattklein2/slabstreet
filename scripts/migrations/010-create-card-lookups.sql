-- Card X-Ray lookup analytics table
-- Logs every X-Ray request for gap identification and usage analytics

CREATE TABLE IF NOT EXISTS card_lookups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  ebay_item_id TEXT,
  match_status TEXT NOT NULL CHECK (match_status IN ('matched', 'partial', 'unmatched')),
  product_id UUID REFERENCES products(id),
  parallel_id UUID REFERENCES parallels(id),
  parsed_identity JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX idx_card_lookups_status ON card_lookups(match_status);
CREATE INDEX idx_card_lookups_created ON card_lookups(created_at DESC);

-- RLS: allow inserts from anon (API route uses anon key), restrict reads to authenticated/admin
ALTER TABLE card_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON card_lookups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON card_lookups
  FOR SELECT USING (auth.role() = 'authenticated');
