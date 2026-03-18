-- Add image_url to products for Shelf Scout tool
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
