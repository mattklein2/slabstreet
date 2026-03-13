-- Stores scraped product data from Topps.com
-- Source: https://www.topps.com/collections/boxes-packs

CREATE TABLE IF NOT EXISTS topps_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  handle TEXT UNIQUE NOT NULL,                    -- URL slug e.g. "2025-topps-series-1-baseball-hobby-box"
  title TEXT NOT NULL,                            -- Full product title
  shopify_product_id TEXT,                        -- e.g. "gid://shopify/Product/8550745014429"
  sku TEXT,                                       -- e.g. "FGC005952-DB"

  -- Classification
  sport TEXT,                                     -- Baseball, Football, Basketball, Hockey, Soccer, etc.
  category TEXT,                                  -- Hobby, Retail, etc.
  product_type TEXT,                              -- Hobby, Blaster, Mega, Hanger, Fat Pack, Value Box, etc.
  product_year TEXT,                              -- e.g. "2026"
  brand TEXT,                                     -- e.g. "Topps"
  sub_brand TEXT,                                 -- e.g. "Series 1", "Chrome", "Bowman"

  -- Content
  description TEXT,                               -- Full product description text
  overview TEXT,                                  -- Overview section (pack config, guarantees)

  -- Pack configuration (parsed from overview/description)
  packs_per_box INT,
  cards_per_pack INT,
  guaranteed_hits TEXT,                           -- e.g. "1 autograph or relic card per Hobby box"

  -- Pricing & availability
  price_usd NUMERIC,
  available_from DATE,
  in_stock BOOLEAN DEFAULT false,

  -- Media
  image_url TEXT,
  checklist_pdf_url TEXT,
  odds_pdf_url TEXT,

  -- Raw specs (JSONB catch-all for all specs from the product page)
  specs JSONB DEFAULT '{}',

  -- Metadata
  product_url TEXT,                               -- Full URL to product page
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_topps_products_sport ON topps_products(sport);
CREATE INDEX IF NOT EXISTS idx_topps_products_brand ON topps_products(brand);
CREATE INDEX IF NOT EXISTS idx_topps_products_sub_brand ON topps_products(sub_brand);
CREATE INDEX IF NOT EXISTS idx_topps_products_product_year ON topps_products(product_year);
CREATE INDEX IF NOT EXISTS idx_topps_products_category ON topps_products(category);
CREATE INDEX IF NOT EXISTS idx_topps_products_sku ON topps_products(sku);

COMMENT ON TABLE topps_products IS 'Scraped product catalog from Topps.com — boxes, packs, and related products';
COMMENT ON COLUMN topps_products.handle IS 'URL slug from topps.com/products/{handle}';
COMMENT ON COLUMN topps_products.specs IS 'Raw key-value specs from product page (SKU, Category, Sub Type, etc.)';

-- Enable RLS with public read
ALTER TABLE topps_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read topps_products" ON topps_products FOR SELECT USING (true);
