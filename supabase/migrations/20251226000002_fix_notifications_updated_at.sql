-- Fix the updated_at trigger issue on notifications table
-- The trigger is referencing a column that doesn't exist

-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- Drop the updated_at column if it exists (we don't need it for notifications)
ALTER TABLE notifications DROP COLUMN IF EXISTS updated_at;
