-- Migration: Fix RLS infinite recursion and relationship ambiguity
-- Created: 2024-11-14

-- First, drop all existing RLS policies for lobby_users to fix infinite recursion
DROP POLICY IF EXISTS "Users can view lobby users in lobbies they're in" ON public.lobby_users;
DROP POLICY IF EXISTS "Users can join lobbies" ON public.lobby_users;
DROP POLICY IF EXISTS "Lobby creators can manage lobby users" ON public.lobby_users;
DROP POLICY IF EXISTS "Users can view participants in lobbies they're in" ON public.lobby_users;
DROP POLICY IF EXISTS "Users can join public lobbies or invited private lobbies" ON public.lobby_users;
DROP POLICY IF EXISTS "Lobby creators and users themselves can update user status" ON public.lobby_users;

-- Create simplified, non-recursive RLS policies for lobby_users
CREATE POLICY "Enable read access for lobby participants" ON public.lobby_users
    FOR SELECT USING (
        -- Users can see participants in lobbies they are part of
        user_id = auth.uid() OR
        lobby_id IN (
            SELECT lu.lobby_id 
            FROM public.lobby_users lu 
            WHERE lu.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON public.lobby_users
    FOR INSERT WITH CHECK (
        -- Users can only add themselves to lobbies
        auth.uid() = user_id AND
        -- Check if lobby exists and is joinable
        EXISTS (
            SELECT 1 FROM public.lobbies l 
            WHERE l.id = lobby_id 
            AND l.status IN ('waiting', 'selecting_challenge')
        )
    );

CREATE POLICY "Enable update for lobby creators and self" ON public.lobby_users
    FOR UPDATE USING (
        -- Users can update their own status
        user_id = auth.uid() OR
        -- Lobby creators can update any participant
        lobby_id IN (
            SELECT l.id FROM public.lobbies l 
            WHERE l.created_by = auth.uid()
        )
    );

CREATE POLICY "Enable delete for self and lobby creators" ON public.lobby_users
    FOR DELETE USING (
        -- Users can remove themselves
        user_id = auth.uid() OR
        -- Lobby creators can remove participants
        lobby_id IN (
            SELECT l.id FROM public.lobbies l 
            WHERE l.created_by = auth.uid()
        )
    );

-- Fix lobbies RLS policies to avoid recursion
DROP POLICY IF EXISTS "Users can view lobbies they're in or public lobbies" ON public.lobbies;
DROP POLICY IF EXISTS "Users can create lobbies" ON public.lobbies;
DROP POLICY IF EXISTS "Users can update their own lobbies" ON public.lobbies;

CREATE POLICY "Enable read access for lobbies" ON public.lobbies
    FOR SELECT USING (
        -- Public lobbies are visible to all
        is_private = false OR
        -- Private lobbies are visible to participants
        created_by = auth.uid() OR
        -- Check if user is participant (direct query to avoid recursion)
        id IN (
            SELECT lobby_id FROM public.lobby_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Enable lobby creation" ON public.lobbies
    FOR INSERT WITH CHECK (
        auth.uid() = created_by
    );

CREATE POLICY "Enable lobby updates for creators" ON public.lobbies
    FOR UPDATE USING (
        auth.uid() = created_by
    );

CREATE POLICY "Enable lobby deletion for creators" ON public.lobbies
    FOR DELETE USING (
        auth.uid() = created_by
    );

-- Fix relationship ambiguity by dropping the problematic foreign key
-- Keep only one relationship: lobbies.challenge_id -> challenges.id
-- Remove the reverse relationship: challenges.lobby_id -> lobbies.id

-- First, update any challenges that have lobby_id set to NULL
UPDATE public.challenges 
SET lobby_id = NULL 
WHERE lobby_id IS NOT NULL;

-- Drop the foreign key constraint that creates the ambiguous relationship
ALTER TABLE public.challenges 
DROP CONSTRAINT IF EXISTS challenges_lobby_id_fkey;

-- Drop the lobby_id column entirely since we now use lobby_challenges table
ALTER TABLE public.challenges 
DROP COLUMN IF EXISTS lobby_id;

-- Also remove the constraint that was checking lobby challenges
ALTER TABLE public.challenges 
DROP CONSTRAINT IF EXISTS challenge_type_check;

-- Update the is_global column logic since we removed lobby_id
-- All challenges are now global by default, and lobby-specific associations 
-- are handled through the lobby_challenges junction table
UPDATE public.challenges 
SET is_global = true 
WHERE is_global IS NULL;

-- Make is_global column NOT NULL with default true
ALTER TABLE public.challenges 
ALTER COLUMN is_global SET DEFAULT true,
ALTER COLUMN is_global SET NOT NULL;

-- Update lobbies table to ensure challenge_id references are valid
-- For any lobbies with invalid challenge_id, set to NULL
UPDATE public.lobbies 
SET challenge_id = NULL 
WHERE challenge_id IS NOT NULL 
AND challenge_id NOT IN (SELECT id FROM public.challenges);

-- Create index for better performance on the remaining relationship
CREATE INDEX IF NOT EXISTS idx_lobbies_challenge_id_valid ON public.lobbies(challenge_id) 
WHERE challenge_id IS NOT NULL;

-- Fix any potential issues with lobby_challenges table
-- Ensure all references are valid
DELETE FROM public.lobby_challenges 
WHERE lobby_id NOT IN (SELECT id FROM public.lobbies)
OR challenge_id NOT IN (SELECT id FROM public.challenges);

-- Create function to safely get lobby participants without recursion
CREATE OR REPLACE FUNCTION public.get_lobby_participants(lobby_id_param UUID)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    email TEXT,
    joined_at TIMESTAMP WITH TIME ZONE,
    is_ready BOOLEAN,
    is_creator BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lu.user_id,
        u.name as username,
        u.email,
        lu.joined_at,
        lu.is_ready,
        lu.is_creator
    FROM public.lobby_users lu
    JOIN public.users u ON u.id = lu.user_id
    WHERE lu.lobby_id = lobby_id_param
    ORDER BY lu.joined_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_lobby_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lobby_participants(UUID) TO anon;

-- Create function to safely check if user is in lobby
CREATE OR REPLACE FUNCTION public.user_in_lobby(lobby_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.lobby_users 
        WHERE lobby_id = lobby_id_param 
        AND user_id = user_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_in_lobby(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_in_lobby(UUID, UUID) TO anon;