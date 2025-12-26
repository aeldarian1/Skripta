-- Add 'report' type to notification_type enum
-- This allows admin users to receive notifications when content is reported

-- Add the new value to the enum type
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'report';
