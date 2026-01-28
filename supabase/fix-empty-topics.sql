-- Add check constraints to prevent empty topics
ALTER TABLE topics 
ADD CONSTRAINT topics_title_not_empty 
CHECK (length(trim(title)) > 0);

ALTER TABLE topics 
ADD CONSTRAINT topics_title_min_length 
CHECK (length(trim(title)) >= 3);

ALTER TABLE topics 
ADD CONSTRAINT topics_content_not_empty 
CHECK (length(trim(content)) > 0);

ALTER TABLE topics 
ADD CONSTRAINT topics_content_min_length 
CHECK (length(trim(content)) >= 10);

-- Delete any existing problematic topics
DELETE FROM topics 
WHERE length(trim(title)) < 3 
   OR length(trim(content)) < 10
   OR title IS NULL 
   OR content IS NULL;
