INSERT INTO card_sets (product_id, name, type)
SELECT id, 'Base Set', 'base'
FROM products
ON CONFLICT (product_id, name) DO NOTHING;

ALTER TABLE parallels ADD COLUMN IF NOT EXISTS card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE;

UPDATE parallels p
SET card_set_id = cs.id
FROM card_sets cs
WHERE cs.product_id = p.product_id
  AND cs.name = 'Base Set';

CREATE INDEX IF NOT EXISTS idx_parallels_card_set_id ON parallels(card_set_id);

ALTER TABLE parallels ALTER COLUMN card_set_id SET NOT NULL;
