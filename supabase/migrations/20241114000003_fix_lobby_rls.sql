-- Fix infinite recursion in lobby_users RLS policies
-- Migration: 20241114000003_fix_lobby_rls.sql

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view participants of lobbies they're in" ON public.lobby_users;
DROP POLICY IF EXISTS "Lobby users can view lobby memberships" ON public.lobby_users;

-- Create simpler, non-recursive policies
CREATE POLICY "Anyone can view lobby participants" ON public.lobby_users
    FOR SELECT USING (true);

CREATE POLICY "Users can join lobbies" ON public.lobby_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.lobby_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies" ON public.lobby_users
    FOR DELETE USING (auth.uid() = user_id);

-- Also fix lobby policies to be simpler
DROP POLICY IF EXISTS "Lobby creators and participants can update basic info" ON public.lobbies;
CREATE POLICY "Anyone can view lobbies" ON public.lobbies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create lobbies" ON public.lobbies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Lobby creators can update their lobbies" ON public.lobbies
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Lobby creators can delete their lobbies" ON public.lobbies
    FOR DELETE USING (auth.uid() = created_by);