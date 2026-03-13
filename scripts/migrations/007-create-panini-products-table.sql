-- Stores scraped product data from PaniniAmerica.net
-- Source: https://www.paniniamerica.net/cards/trading-cards.html

CREATE TABLE IF NOT EXISTS panini_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  panini_id TEXT UNIQUE,                             -- Panini's internal product ID e.g. "289994"
  sku TEXT UNIQUE,                                   -- e.g. "2-19719-10"
  name TEXT NOT NULL,                                -- Full product title
  url_key TEXT,                                      -- URL slug e.g. "2025-panini-prizm-nfl-trading-card-box-hobby"

  -- Classification
  sport TEXT,                                        -- Football, Basketball, Baseball, Soccer, etc.
  category TEXT,                                     -- Derived from product type / category
  product_type TEXT,                                 -- Hobby, Blaster, Mega, Choice, H2, etc.
  product_year TEXT,                                 -- e.g. "2025" or "2025-26"
  brand TEXT DEFAULT 'Panini',                       -- Always "Panini"
  sub_brand TEXT,                                    -- e.g. "Prizm", "Select", "Donruss", "National Treasures"

  -- Pricing & availability
  price_usd NUMERIC,
  special_price NUMERIC,
  in_stock BOOLEAN DEFAULT false,
  coming_soon BOOLEAN DEFAULT false,
  release_date DATE,
  offer_start_date TIMESTAMPTZ,
  offer_end_date TIMESTAMPTZ,

  -- Media
  image_url TEXT,

  -- Status
  status INT,                                        -- Panini product status code

  -- Category IDs from Panini's taxonomy
  category_ids JSONB DEFAULT '[]',

  -- Raw extras (JSONB catch-all)
  raw JSONB DEFAULT '{}',

  -- Source tracking
  source_category TEXT,                              -- Which category page this was found on
  product_url TEXT,                                  -- Full URL to product page

  -- Metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_panini_products_sport ON panini_products(sport);
CREATE INDEX IF NOT EXISTS idx_panini_products_brand ON panini_products(brand);
CREATE INDEX IF NOT EXISTS idx_panini_products_sub_brand ON panini_products(sub_brand);
CREATE INDEX IF NOT EXISTS idx_panini_products_product_year ON panini_products(product_year);
CREATE INDEX IF NOT EXISTS idx_panini_products_product_type ON panini_products(product_type);
CREATE INDEX IF NOT EXISTS idx_panini_products_sku ON panini_products(sku);
CREATE INDEX IF NOT EXISTS idx_panini_products_panini_id ON panini_products(panini_id);

COMMENT ON TABLE panini_products IS 'Scraped product catalog from PaniniAmerica.net — boxes, packs, and related products';
COMMENT ON COLUMN panini_products.panini_id IS 'Panini internal product ID';
COMMENT ON COLUMN panini_products.url_key IS 'URL slug from paniniamerica.net/{url_key}.html';
COMMENT ON COLUMN panini_products.raw IS 'Extra fields from the GraphQL response (reward_points, type_id, etc.)';

-- Enable RLS with public read
ALTER TABLE panini_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read panini_products" ON panini_products FOR SELECT USING (true);
