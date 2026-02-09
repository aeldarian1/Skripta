-- Add tags column to topic_drafts and topics tables
ALTER TABLE topic_drafts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE topics ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for better performance on tags queries
CREATE INDEX IF NOT EXISTS idx_topic_drafts_tags ON topic_drafts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_topics_tags ON topics USING GIN(tags);

-- Add comment for documentation
COMMENT ON COLUMN topic_drafts.tags IS 'Array of tag slugs (e.g., [''pitanje'', ''diskusija''])';
COMMENT ON COLUMN topics.tags IS 'Array of tag slugs (e.g., [''pitanje'', ''diskusija''])';
