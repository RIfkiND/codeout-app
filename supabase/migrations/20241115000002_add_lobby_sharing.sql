-- Add lobby_code column for sharing functionality
-- Run this in your Supabase SQL Editor

-- 1. Add lobby_code column to lobbies table
ALTER TABLE public.lobbies 
ADD COLUMN IF NOT EXISTS lobby_code VARCHAR(6) UNIQUE;

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lobbies_lobby_code ON public.lobbies(lobby_code) WHERE lobby_code IS NOT NULL;

-- 3. Create function to generate lobby codes
CREATE OR REPLACE FUNCTION generate_lobby_code() RETURNS VARCHAR(6) AS $$
DECLARE
    code VARCHAR(6);
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding confusing chars
    i INT;
    attempts INT := 0;
BEGIN
    LOOP
        code := '';
        -- Generate 6-character code
        FOR i IN 1..6 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM public.lobbies WHERE lobby_code = code) THEN
            RETURN code;
        END IF;
        
        attempts := attempts + 1;
        IF attempts > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique lobby code after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION generate_lobby_code() TO authenticated;

SELECT 'Lobby sharing functionality added successfully!' as status;