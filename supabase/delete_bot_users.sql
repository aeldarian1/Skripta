-- Delete all bot users and their associated content
-- Run this in Supabase SQL Editor to clean up test bot users
-- This will cascade delete all topics, replies, votes created by bot users

-- Delete from profiles (will cascade delete topics, replies, votes)
DELETE FROM profiles
WHERE email LIKE 'bot%@example.com';

-- Delete from auth.users as well
DELETE FROM auth.users
WHERE email LIKE 'bot%@example.com';
