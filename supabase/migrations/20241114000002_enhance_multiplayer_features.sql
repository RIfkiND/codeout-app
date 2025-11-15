-- Migration: Enhance existing lobby system for multiplayer features
-- Created: 2024-11-14

-- Add multiplayer-specific fields to existing lobbies table
ALTER TABLE public.lobbies
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS countdown_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Update lobby status enum to include new multiplayer states
ALTER TYPE lobby_status ADD VALUE IF NOT EXISTS 'selecting_challenge';
ALTER TYPE lobby_status ADD VALUE IF NOT EXISTS 'countdown';

-- Create lobby_messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.lobby_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'announcement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add participant status and readiness to existing lobby_users table
ALTER TABLE public.lobby_users
ADD COLUMN IF NOT EXISTS is_ready BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_rank INTEGER,
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'finished'));

-- Add multiplayer-specific fields to existing submissions table for lobby scoring
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS rank INTEGER,
ADD COLUMN IF NOT EXISTS completion_time_ms INTEGER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lobby_messages_lobby_id ON public.lobby_messages(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_messages_created_at ON public.lobby_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_lobbies_challenge_id ON public.lobbies(challenge_id);
CREATE INDEX IF NOT EXISTS idx_lobby_users_is_ready ON public.lobby_users(is_ready);
CREATE INDEX IF NOT EXISTS idx_submissions_rank ON public.submissions(rank);

-- Enable RLS for new table
ALTER TABLE public.lobby_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lobby_messages
CREATE POLICY "Users can view messages in lobbies they're in" ON public.lobby_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_messages.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in lobbies they're in" ON public.lobby_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_messages.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

-- Update existing RLS policies to be more restrictive for lobby management

-- Drop existing lobby policies and create more specific ones
DROP POLICY IF EXISTS "Lobby creators can update lobbies" ON public.lobbies;
CREATE POLICY "Lobby creators and participants can update basic info" ON public.lobbies
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobbies.id 
            AND lu.user_id = auth.uid()
            AND lu.is_creator = true
        )
    );

-- Allow lobby creators to delete lobbies
CREATE POLICY "Lobby creators can delete lobbies" ON public.lobbies
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobbies.id 
            AND lu.user_id = auth.uid()
            AND lu.is_creator = true
        )
    );

-- Update lobby_users policies for better multiplayer support
DROP POLICY IF EXISTS "Lobby users can view lobby memberships" ON public.lobby_users;
CREATE POLICY "Users can view participants of lobbies they're in" ON public.lobby_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_users.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own participant status" ON public.lobby_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies" ON public.lobby_users
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically set creator status
CREATE OR REPLACE FUNCTION public.set_lobby_creator()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the first user joining (creator), mark them as creator
    IF NOT EXISTS (
        SELECT 1 FROM public.lobby_users 
        WHERE lobby_id = NEW.lobby_id
    ) THEN
        NEW.is_creator = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set lobby creator
DROP TRIGGER IF EXISTS set_lobby_creator_trigger ON public.lobby_users;
CREATE TRIGGER set_lobby_creator_trigger
    BEFORE INSERT ON public.lobby_users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_lobby_creator();

-- Create function to update lobby status based on participant readiness
CREATE OR REPLACE FUNCTION public.check_lobby_ready_status()
RETURNS TRIGGER AS $$
DECLARE
    total_participants INTEGER;
    ready_participants INTEGER;
    lobby_status_val lobby_status;
BEGIN
    -- Get current lobby status
    SELECT status INTO lobby_status_val
    FROM public.lobbies 
    WHERE id = COALESCE(NEW.lobby_id, OLD.lobby_id);
    
    -- Only check readiness for lobbies in waiting status
    IF lobby_status_val = 'waiting' THEN
        -- Count total and ready participants
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE is_ready = TRUE)
        INTO total_participants, ready_participants
        FROM public.lobby_users 
        WHERE lobby_id = COALESCE(NEW.lobby_id, OLD.lobby_id);
        
        -- If all participants are ready and we have at least 2 people, start challenge selection
        IF total_participants >= 2 AND ready_participants = total_participants THEN
            UPDATE public.lobbies 
            SET status = 'selecting_challenge'
            WHERE id = COALESCE(NEW.lobby_id, OLD.lobby_id);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to check readiness status
DROP TRIGGER IF EXISTS check_ready_on_update ON public.lobby_users;
CREATE TRIGGER check_ready_on_update
    AFTER UPDATE OF is_ready ON public.lobby_users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_lobby_ready_status();

DROP TRIGGER IF EXISTS check_ready_on_insert ON public.lobby_users;
CREATE TRIGGER check_ready_on_insert
    AFTER INSERT ON public.lobby_users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_lobby_ready_status();

-- Add some sample multiplayer lobbies for testing
INSERT INTO public.lobbies (id, name, description, created_by, max_participants, time_limit_minutes, status)
SELECT 
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'Algorithm Speed Battle',
    'Fast-paced coding competition focusing on algorithms',
    u.id,
    6,
    30,
    'waiting'
FROM public.users u 
WHERE u.role = 'admin' 
AND NOT EXISTS (SELECT 1 FROM public.lobbies WHERE id = '123e4567-e89b-12d3-a456-426614174000'::uuid)
LIMIT 1;

INSERT INTO public.lobbies (id, name, description, created_by, max_participants, time_limit_minutes, status)
SELECT 
    '123e4567-e89b-12d3-a456-426614174001'::uuid,
    'Data Structure Challenge',
    'Compete in data structure implementation challenges',
    u.id,
    4,
    45,
    'waiting'
FROM public.users u 
WHERE u.role = 'admin' 
AND NOT EXISTS (SELECT 1 FROM public.lobbies WHERE id = '123e4567-e89b-12d3-a456-426614174001'::uuid)
LIMIT 1;