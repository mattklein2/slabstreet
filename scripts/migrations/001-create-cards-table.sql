CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_slug TEXT NOT NULL,
  year INT NOT NULL,
  set_name TEXT NOT NULL,
  parallel TEXT NOT NULL DEFAULT 'Base',
  card_number TEXT,
  numbered_to INT,
  league TEXT NOT NULL,
  image_url TEXT,
  cardladder_slug TEXT,
  slug TEXT UNIQUE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cards_player ON cards(player_slug);
CREATE INDEX IF NOT EXISTS idx_cards_league ON cards(league);
CREATE INDEX IF NOT EXISTS idx_cards_search ON cards(player_slug, year, set_name);
CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
