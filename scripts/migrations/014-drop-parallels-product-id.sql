-- Drop product_id from parallels now that all code uses card_set_id.
-- Wrapped in transaction for safety.
BEGIN;

-- Verify all parallels have card_set_id before dropping product_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM parallels WHERE card_set_id IS NULL) THEN
    RAISE EXCEPTION 'Found parallels with NULL card_set_id — aborting';
  END IF;
END $$;

ALTER TABLE parallels DROP COLUMN IF EXISTS product_id;

COMMIT;
