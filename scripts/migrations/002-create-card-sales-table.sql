CREATE TABLE IF NOT EXISTS card_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id),
  price NUMERIC(10,2) NOT NULL,
  grade TEXT,
  grader TEXT,
  grade_number NUMERIC(4,1),
  sold_date TIMESTAMPTZ NOT NULL,
  platform TEXT DEFAULT 'eBay',
  listing_url TEXT UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_sales_card ON card_sales(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sales_date ON card_sales(sold_date);
CREATE INDEX IF NOT EXISTS idx_card_sales_grade ON card_sales(card_id, grade);
