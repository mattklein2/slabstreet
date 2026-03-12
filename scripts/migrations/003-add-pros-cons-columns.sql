-- Adds pros/cons JSONB columns for opinionated guidance in Box Guide

ALTER TABLE products ADD COLUMN IF NOT EXISTS pros_cons JSONB;
ALTER TABLE box_configurations ADD COLUMN IF NOT EXISTS pros_cons JSONB;

COMMENT ON COLUMN products.pros_cons IS 'Product-level pros/cons for Box Guide, e.g. {"pros": ["Best resale value"], "cons": ["Expensive"]}';
COMMENT ON COLUMN box_configurations.pros_cons IS 'Box-config-level pros/cons for Box Guide, e.g. {"pros": ["Guaranteed auto"], "cons": ["Low retail odds"]}';
