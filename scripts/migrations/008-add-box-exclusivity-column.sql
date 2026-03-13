-- Add box_exclusivity column to parallels table
ALTER TABLE parallels ADD COLUMN IF NOT EXISTS box_exclusivity TEXT[];
COMMENT ON COLUMN parallels.box_exclusivity IS 'Which box types this parallel can be found in (e.g. Hobby, Retail Blaster, Choice, FOTL)';
