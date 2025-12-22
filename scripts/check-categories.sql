-- Check for duplicate categories
SELECT slug, COUNT(*) as count, STRING_AGG(id::text, ', ') as ids
FROM categories
GROUP BY slug
HAVING COUNT(*) > 1;

-- List all categories with details
SELECT id, name, slug, order_index, created_at
FROM categories
ORDER BY order_index, created_at;
