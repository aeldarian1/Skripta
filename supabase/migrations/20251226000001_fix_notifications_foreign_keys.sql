-- Add missing foreign key constraint for notifications.actor_id
-- This enables proper joins when fetching notifications with actor data

-- First, check if the constraint already exists and drop it if needed
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;

-- Add the foreign key constraint
ALTER TABLE notifications
ADD CONSTRAINT notifications_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
