-- Delete old global categories (they have no faculty_id)
DELETE FROM categories WHERE faculty_id IS NULL;

-- Create categories for each faculty
-- This will create 6 categories (Opće, Pitanja, Studij, Karijera, Tehnologija, Off-topic) for each of the 12 faculties

-- Function to insert categories for a faculty
DO $$
DECLARE
  faculty_record RECORD;
BEGIN
  FOR faculty_record IN
    SELECT id, slug FROM faculties ORDER BY order_index
  LOOP
    -- Insert 6 categories for this faculty
    INSERT INTO categories (name, slug, description, icon, color, order_index, faculty_id) VALUES
      ('Opće', faculty_record.slug || '-opce', 'Opće rasprave i teme za sve studente', '💬', '#3B82F6', 1, faculty_record.id),
      ('Pitanja i Odgovori', faculty_record.slug || '-pitanja', 'Postavi pitanje ili pomogni drugima', '❓', '#10B981', 2, faculty_record.id),
      ('Studij', faculty_record.slug || '-studij', 'Diskusije o studiju, ispitima i kolegijima', '📚', '#8B5CF6', 3, faculty_record.id),
      ('Karijera', faculty_record.slug || '-karijera', 'Savjeti o karijeri, praksama i poslovima', '💼', '#F59E0B', 4, faculty_record.id),
      ('Tehnologija', faculty_record.slug || '-tehnologija', 'Tech razgovori i najnovije vijesti', '💻', '#EF4444', 5, faculty_record.id),
      ('Off-topic', faculty_record.slug || '-off-topic', 'Casual razgovori i zabava', '🎮', '#6B7280', 6, faculty_record.id);
  END LOOP;
END $$;
