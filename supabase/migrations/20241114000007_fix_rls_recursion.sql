-- Fix RLS infinite recursion on lobby_users table
-- Drop and recreate policies to avoid recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view lobbies they're in" ON public.lobby_users;
DROP POLICY IF EXISTS "Users can join public lobbies" ON public.lobby_users;
DROP POLICY IF EXISTS "Users can leave lobbies" ON public.lobby_users;
DROP POLICY IF EXISTS "Lobby creators can manage participants" ON public.lobby_users;

-- Create simple, non-recursive policies
CREATE POLICY "lobby_users_select" ON public.lobby_users
    FOR SELECT USING (true); -- Allow everyone to read (for public lobby lists)

CREATE POLICY "lobby_users_insert" ON public.lobby_users
    FOR INSERT WITH CHECK (auth.uid() = user_id); -- Users can only insert themselves

CREATE POLICY "lobby_users_delete" ON public.lobby_users
    FOR DELETE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT created_by FROM public.lobbies WHERE id = lobby_id
        )
    ); -- Users can delete themselves or lobby creator can remove them

-- Update lobby policies to avoid recursion
DROP POLICY IF EXISTS "Users can view lobbies they're in or public lobbies" ON public.lobbies;
CREATE POLICY "lobbies_select" ON public.lobbies
    FOR SELECT USING (true); -- Allow everyone to read lobbies

-- Fix lobby creation policy
DROP POLICY IF EXISTS "Authenticated users can create lobbies" ON public.lobbies;
CREATE POLICY "lobbies_insert" ON public.lobbies
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow lobby creators to update their lobbies
DROP POLICY IF EXISTS "Lobby creators can update their lobbies" ON public.lobbies;
CREATE POLICY "lobbies_update" ON public.lobbies
    FOR UPDATE USING (auth.uid() = created_by);

-- Create function to add lobby creator (bypasses RLS)
CREATE OR REPLACE FUNCTION public.add_lobby_creator(
    p_lobby_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.lobby_users (lobby_id, user_id, joined_at, is_creator)
    VALUES (p_lobby_id, p_user_id, NOW(), true)
    ON CONFLICT (lobby_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;