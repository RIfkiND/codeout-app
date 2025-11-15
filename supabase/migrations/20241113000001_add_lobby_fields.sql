-- Add missing fields to lobbies table
ALTER TABLE public.lobbies
ADD COLUMN description TEXT,
ADD COLUMN is_private BOOLEAN DEFAULT FALSE,
ADD COLUMN time_limit_minutes INTEGER DEFAULT 30;

-- Update the updated_at trigger to include the new fields
-- (The trigger already exists, no need to recreate it)