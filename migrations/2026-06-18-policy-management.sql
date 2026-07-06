CREATE TABLE IF NOT EXISTS policy_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_translations (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES policy_categories(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'ar')),
  title TEXT NOT NULL,
  short_description TEXT,
  content_html TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (category_id, language)
);

ALTER TABLE policy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read policy_categories" ON policy_categories;
DROP POLICY IF EXISTS "Public read policy_translations" ON policy_translations;
DROP POLICY IF EXISTS "Allow all policy_categories" ON policy_categories;
DROP POLICY IF EXISTS "Allow all policy_translations" ON policy_translations;

CREATE POLICY "Public read policy_categories" ON policy_categories FOR SELECT USING (true);
CREATE POLICY "Public read policy_translations" ON policy_translations FOR SELECT USING (true);
CREATE POLICY "Allow all policy_categories" ON policy_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all policy_translations" ON policy_translations FOR ALL USING (true) WITH CHECK (true);
