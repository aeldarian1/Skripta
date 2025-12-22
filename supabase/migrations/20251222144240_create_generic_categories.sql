-- Create Generic Categories (Non-University Specific)
-- These are the main forum categories shown on the homepage

-- Insert generic categories (with duplicate protection)
INSERT INTO categories (name, slug, description, icon, color, order_index)
VALUES
  ('Opće', 'opce', 'Opće rasprave i teme za sve studente', '💬', '#3B82F6', 1),
  ('Pitanja i Odgovori', 'pitanja', 'Postavi pitanje ili pomogni drugima', '❓', '#10B981', 2),
  ('Studij', 'studij', 'Diskusije o studiju, ispitima i kolegijima', '📚', '#8B5CF6', 3),
  ('Karijera', 'karijera', 'Savjeti o karijeri, praksama i poslovima', '💼', '#F59E0B', 4),
  ('Tehnologija', 'tehnologija', 'Tech razgovori i najnovije vijesti', '💻', '#EF4444', 5),
  ('Off-topic', 'off-topic', 'Casual razgovori i zabava', '🎮', '#6B7280', 6)
ON CONFLICT (slug) DO NOTHING;

-- Verify generic categories were created
DO $$
DECLARE
  generic_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO generic_count
  FROM categories
  WHERE slug IN ('opce', 'pitanja', 'studij', 'karijera', 'tehnologija', 'off-topic');

  RAISE NOTICE 'Generic categories count: %', generic_count;
END $$;
