-- Remove Duplicate Categories Migration
-- This migration removes duplicate categories, keeping only the oldest one for each slug

-- First, disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Delete duplicate categories, keeping only the oldest one for each slug
DELETE FROM categories a
USING categories b
WHERE a.slug = b.slug
  AND a.created_at > b.created_at;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify no duplicates remain (should return 0 rows)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT slug, COUNT(*) as count
    FROM categories
    GROUP BY slug
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Still found % duplicate category slugs', duplicate_count;
  ELSE
    RAISE NOTICE 'Successfully removed all duplicate categories';
  END IF;
END $$;
