-- Creates topics table for Product Explainer / Learn the Hobby

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  related_product_ids UUID[],
  related_topic_slugs TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE topics IS 'Educational topic pages for Learn the Hobby tool';
COMMENT ON COLUMN topics.category IS 'product or concept';
COMMENT ON COLUMN topics.body IS 'Markdown content rendered on topic page';
