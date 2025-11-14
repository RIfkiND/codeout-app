-- Migration: Add multi-challenge support for lobbies
-- Created: 2024-11-14

-- Create lobby_challenges table to support multiple challenges per lobby
CREATE TABLE IF NOT EXISTS public.lobby_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    challenge_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lobby_id, challenge_order),
    UNIQUE(lobby_id, challenge_id)
);

-- Add current challenge tracking to lobbies
ALTER TABLE public.lobbies
ADD COLUMN IF NOT EXISTS current_challenge_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_challenges INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS challenge_mode VARCHAR(20) DEFAULT 'single' CHECK (challenge_mode IN ('single', 'multi'));

-- Update lobby status to support multi-challenge flow
ALTER TYPE lobby_status ADD VALUE IF NOT EXISTS 'challenge_transition';
ALTER TYPE lobby_status ADD VALUE IF NOT EXISTS 'completed';

-- Create lobby_challenge_submissions to track submissions per challenge
CREATE TABLE IF NOT EXISTS public.lobby_challenge_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    challenge_order INTEGER NOT NULL,
    completion_time_ms INTEGER,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lobby_id, challenge_id, user_id)
);

-- Create overall lobby standings table
CREATE TABLE IF NOT EXISTS public.lobby_standings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    average_completion_time_ms INTEGER,
    final_rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lobby_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lobby_challenges_lobby_id ON public.lobby_challenges(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_challenges_order ON public.lobby_challenges(lobby_id, challenge_order);
CREATE INDEX IF NOT EXISTS idx_lobby_challenge_submissions_lobby_challenge ON public.lobby_challenge_submissions(lobby_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_lobby_challenge_submissions_user ON public.lobby_challenge_submissions(lobby_id, user_id);
CREATE INDEX IF NOT EXISTS idx_lobby_standings_lobby_id ON public.lobby_standings(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_standings_rank ON public.lobby_standings(lobby_id, final_rank);

-- Enable RLS for new tables
ALTER TABLE public.lobby_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_standings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lobby_challenges
CREATE POLICY "Users can view challenges in lobbies they're in" ON public.lobby_challenges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_challenges.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

CREATE POLICY "Lobby creators can manage lobby challenges" ON public.lobby_challenges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.lobbies l 
            WHERE l.id = lobby_challenges.lobby_id 
            AND l.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_challenges.lobby_id 
            AND lu.user_id = auth.uid()
            AND lu.is_creator = true
        )
    );

-- RLS Policies for lobby_challenge_submissions
CREATE POLICY "Users can view submissions in lobbies they're in" ON public.lobby_challenge_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_challenge_submissions.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can submit to challenges in lobbies they're in" ON public.lobby_challenge_submissions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_challenge_submissions.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

-- RLS Policies for lobby_standings
CREATE POLICY "Users can view standings in lobbies they're in" ON public.lobby_standings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lobby_users lu 
            WHERE lu.lobby_id = lobby_standings.lobby_id 
            AND lu.user_id = auth.uid()
        )
    );

-- Function to advance to next challenge
CREATE OR REPLACE FUNCTION public.advance_to_next_challenge(lobby_id_param UUID)
RETURNS VOID AS $$
DECLARE
    current_order INTEGER;
    next_order INTEGER;
    total_challenges_count INTEGER;
    next_challenge_id UUID;
BEGIN
    -- Get current challenge info
    SELECT current_challenge_order, total_challenges 
    INTO current_order, total_challenges_count
    FROM public.lobbies 
    WHERE id = lobby_id_param;
    
    -- Calculate next challenge order
    next_order := current_order + 1;
    
    -- Check if there are more challenges
    IF next_order <= total_challenges_count THEN
        -- Get the next challenge ID
        SELECT challenge_id INTO next_challenge_id
        FROM public.lobby_challenges
        WHERE lobby_id = lobby_id_param AND challenge_order = next_order;
        
        -- Update lobby to next challenge
        UPDATE public.lobbies
        SET 
            current_challenge_order = next_order,
            challenge_id = next_challenge_id,
            status = 'challenge_transition',
            countdown_start_time = NOW() + INTERVAL '10 seconds'
        WHERE id = lobby_id_param;
        
        -- Mark current challenge as completed
        UPDATE public.lobby_challenges
        SET 
            status = 'completed',
            completed_at = NOW()
        WHERE lobby_id = lobby_id_param AND challenge_order = current_order;
        
        -- Mark next challenge as active
        UPDATE public.lobby_challenges
        SET 
            status = 'active',
            started_at = NOW() + INTERVAL '10 seconds'
        WHERE lobby_id = lobby_id_param AND challenge_order = next_order;
    ELSE
        -- All challenges completed, finish the lobby
        UPDATE public.lobbies
        SET status = 'completed'
        WHERE id = lobby_id_param;
        
        -- Mark final challenge as completed
        UPDATE public.lobby_challenges
        SET 
            status = 'completed',
            completed_at = NOW()
        WHERE lobby_id = lobby_id_param AND challenge_order = current_order;
        
        -- Calculate final standings
        PERFORM public.calculate_final_standings(lobby_id_param);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate final standings
CREATE OR REPLACE FUNCTION public.calculate_final_standings(lobby_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Calculate and update final standings
    WITH user_scores AS (
        SELECT 
            user_id,
            SUM(score) as total_score,
            COUNT(*) FILTER (WHERE is_completed = true) as challenges_completed,
            AVG(completion_time_ms) as avg_completion_time
        FROM public.lobby_challenge_submissions
        WHERE lobby_id = lobby_id_param
        GROUP BY user_id
    ),
    ranked_users AS (
        SELECT 
            user_id,
            total_score,
            challenges_completed,
            avg_completion_time,
            RANK() OVER (
                ORDER BY 
                    challenges_completed DESC,
                    total_score DESC,
                    avg_completion_time ASC
            ) as final_rank
        FROM user_scores
    )
    INSERT INTO public.lobby_standings (lobby_id, user_id, total_score, challenges_completed, average_completion_time_ms, final_rank)
    SELECT 
        lobby_id_param,
        user_id,
        total_score,
        challenges_completed,
        avg_completion_time::INTEGER,
        final_rank
    FROM ranked_users
    ON CONFLICT (lobby_id, user_id) 
    DO UPDATE SET
        total_score = EXCLUDED.total_score,
        challenges_completed = EXCLUDED.challenges_completed,
        average_completion_time_ms = EXCLUDED.average_completion_time_ms,
        final_rank = EXCLUDED.final_rank,
        updated_at = NOW();
        
    -- Also update lobby_users final scores
    UPDATE public.lobby_users
    SET 
        final_score = ls.total_score,
        final_rank = ls.final_rank
    FROM public.lobby_standings ls
    WHERE lobby_users.lobby_id = lobby_id_param 
    AND lobby_users.user_id = ls.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if all participants completed current challenge
CREATE OR REPLACE FUNCTION public.check_challenge_completion()
RETURNS TRIGGER AS $$
DECLARE
    lobby_id_val UUID;
    current_challenge_id UUID;
    total_participants INTEGER;
    completed_participants INTEGER;
BEGIN
    lobby_id_val := NEW.lobby_id;
    
    -- Get current challenge info
    SELECT challenge_id INTO current_challenge_id
    FROM public.lobbies
    WHERE id = lobby_id_val;
    
    -- Count total participants and completed submissions for current challenge
    SELECT 
        COUNT(DISTINCT lu.user_id),
        COUNT(DISTINCT lcs.user_id) FILTER (WHERE lcs.is_completed = true)
    INTO total_participants, completed_participants
    FROM public.lobby_users lu
    LEFT JOIN public.lobby_challenge_submissions lcs ON (
        lcs.lobby_id = lu.lobby_id 
        AND lcs.user_id = lu.user_id 
        AND lcs.challenge_id = current_challenge_id
    )
    WHERE lu.lobby_id = lobby_id_val;
    
    -- If all participants completed the challenge, advance to next
    IF completed_participants >= total_participants THEN
        PERFORM public.advance_to_next_challenge(lobby_id_val);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-advance when challenge is completed
DROP TRIGGER IF EXISTS check_challenge_completion_trigger ON public.lobby_challenge_submissions;
CREATE TRIGGER check_challenge_completion_trigger
    AFTER INSERT OR UPDATE OF is_completed ON public.lobby_challenge_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_challenge_completion();

-- Function to start multi-challenge lobby
CREATE OR REPLACE FUNCTION public.start_multi_challenge_lobby(
    lobby_id_param UUID,
    challenge_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
    challenge_id UUID;
    order_num INTEGER := 1;
BEGIN
    -- Clear existing lobby challenges
    DELETE FROM public.lobby_challenges WHERE lobby_id = lobby_id_param;
    
    -- Insert challenges in order
    FOREACH challenge_id IN ARRAY challenge_ids
    LOOP
        INSERT INTO public.lobby_challenges (lobby_id, challenge_id, challenge_order, status)
        VALUES (
            lobby_id_param, 
            challenge_id, 
            order_num,
            CASE WHEN order_num = 1 THEN 'active' ELSE 'pending' END
        );
        order_num := order_num + 1;
    END LOOP;
    
    -- Update lobby settings
    UPDATE public.lobbies
    SET 
        challenge_mode = 'multi',
        total_challenges = array_length(challenge_ids, 1),
        current_challenge_order = 1,
        challenge_id = challenge_ids[1],
        status = 'running',
        countdown_start_time = NOW()
    WHERE id = lobby_id_param;
    
    -- Mark first challenge as started
    UPDATE public.lobby_challenges
    SET started_at = NOW()
    WHERE lobby_id = lobby_id_param AND challenge_order = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;