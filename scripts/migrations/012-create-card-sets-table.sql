-- Create the card_sets table between products and parallels.
-- Each product has one or more card sets: "Base Set" plus inserts like Downtown, Kaboom!, etc.

CREATE TABLE IF NOT EXISTS card_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'base' CHECK (type IN ('base', 'insert', 'subset')),
  description TEXT,
  card_count INT,
  is_autographed BOOLEAN NOT NULL DEFAULT false,
  is_memorabilia BOOLEAN NOT NULL DEFAULT false,
  box_exclusivity TEXT[],
  odds TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, name)
);

CREATE INDEX idx_card_sets_product_id ON card_sets(product_id);

ALTER TABLE card_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON card_sets FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON card_sets FOR ALL USING (auth.role() = 'service_role');
