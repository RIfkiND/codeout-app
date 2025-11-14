-- Simple RLS fix to completely avoid recursion
-- This migration completely removes problematic policies and creates simple ones

-- First, disable RLS temporarily to clean up
ALTER TABLE public.lobby_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
BEGIN
    -- Drop lobby_users policies
    DROP POLICY IF EXISTS "Users can view lobbies they're in" ON public.lobby_users;
    DROP POLICY IF EXISTS "Users can join public lobbies" ON public.lobby_users;
    DROP POLICY IF EXISTS "Users can leave lobbies" ON public.lobby_users;
    DROP POLICY IF EXISTS "Lobby creators can manage participants" ON public.lobby_users;
    DROP POLICY IF EXISTS "lobby_users_select" ON public.lobby_users;
    DROP POLICY IF EXISTS "lobby_users_insert" ON public.lobby_users;
    DROP POLICY IF EXISTS "lobby_users_delete" ON public.lobby_users;
    
    -- Drop lobbies policies
    DROP POLICY IF EXISTS "Users can view lobbies they're in or public lobbies" ON public.lobbies;
    DROP POLICY IF EXISTS "Authenticated users can create lobbies" ON public.lobbies;
    DROP POLICY IF EXISTS "Lobby creators can update their lobbies" ON public.lobbies;
    DROP POLICY IF EXISTS "lobbies_select" ON public.lobbies;
    DROP POLICY IF EXISTS "lobbies_insert" ON public.lobbies;
    DROP POLICY IF EXISTS "lobbies_update" ON public.lobbies;
EXCEPTION
    WHEN undefined_object THEN
        -- Policy doesn't exist, continue
        NULL;
END $$;

-- Re-enable RLS
ALTER TABLE public.lobby_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for lobbies
CREATE POLICY "lobbies_public_read" ON public.lobbies
    FOR SELECT USING (true); -- Everyone can read lobbies

CREATE POLICY "lobbies_auth_create" ON public.lobbies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "lobbies_creator_update" ON public.lobbies
    FOR UPDATE USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "lobbies_creator_delete" ON public.lobbies
    FOR DELETE USING (auth.uid() = created_by);

-- Create simple, non-recursive policies for lobby_users
CREATE POLICY "lobby_users_public_read" ON public.lobby_users
    FOR SELECT USING (true); -- Everyone can read lobby participants

CREATE POLICY "lobby_users_self_insert" ON public.lobby_users
    FOR INSERT WITH CHECK (auth.uid() = user_id); -- Users can only add themselves

CREATE POLICY "lobby_users_self_delete" ON public.lobby_users
    FOR DELETE USING (auth.uid() = user_id); -- Users can only remove themselves

-- Update the lobby creator function to be more robust
CREATE OR REPLACE FUNCTION public.add_lobby_creator(
    p_lobby_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Insert without any RLS checks using SECURITY DEFINER
    INSERT INTO public.lobby_users (lobby_id, user_id, joined_at, is_creator)
    VALUES (p_lobby_id, p_user_id, NOW(), true)
    ON CONFLICT (lobby_id, user_id) DO NOTHING;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the entire lobby creation
        RAISE WARNING 'Failed to add lobby creator: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_lobby_creator TO authenticated;