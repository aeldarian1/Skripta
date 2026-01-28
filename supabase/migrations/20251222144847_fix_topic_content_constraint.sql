-- Fix Topic Content Constraint
-- The previous constraint required 10+ characters, which is too strict
-- This updates it to only require non-empty content (at least 1 character)

-- Drop the old overly-strict constraint
ALTER TABLE topics
DROP CONSTRAINT IF EXISTS topics_content_min_length;

-- Add a more reasonable constraint (just require non-empty)
ALTER TABLE topics
ADD CONSTRAINT topics_content_min_length
CHECK (length(trim(content)) >= 1);

-- Also ensure the title constraint is reasonable
ALTER TABLE topics
DROP CONSTRAINT IF EXISTS topics_title_min_length;

ALTER TABLE topics
ADD CONSTRAINT topics_title_min_length
CHECK (length(trim(title)) >= 1);

-- Keep the "not empty" constraints as they are
-- (These just check content IS NOT NULL and has something)
