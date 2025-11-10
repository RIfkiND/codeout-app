-- Add username field to user_profiles table
-- This migration adds username support with uniqueness constraints

-- Add username column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for better performance on username lookups
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);

-- Add constraint to ensure username is lowercase and alphanumeric with underscores/hyphens
ALTER TABLE public.user_profiles 
ADD CONSTRAINT username_format_check 
CHECK (username IS NULL OR username ~ '^[a-z0-9_-]+$');

-- Add constraint for username length (3-30 characters)
ALTER TABLE public.user_profiles 
ADD CONSTRAINT username_length_check 
CHECK (username IS NULL OR (LENGTH(username) >= 3 AND LENGTH(username) <= 30));

-- Update existing user profiles to generate default usernames
-- This will use a combination of name/email with a random suffix to ensure uniqueness
DO $$
DECLARE
    profile_record RECORD;
    new_username TEXT;
    username_base TEXT;
    counter INTEGER;
BEGIN
    FOR profile_record IN 
        SELECT up.id, up.user_id, u.name, u.email 
        FROM public.user_profiles up
        JOIN public.users u ON up.user_id = u.id
        WHERE up.username IS NULL
    LOOP
        -- Generate base username from name or email
        IF profile_record.name IS NOT NULL THEN
            username_base := lower(regexp_replace(profile_record.name, '[^a-zA-Z0-9]', '', 'g'));
        ELSE
            username_base := lower(regexp_replace(split_part(profile_record.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
        END IF;
        
        -- Ensure minimum length
        IF LENGTH(username_base) < 3 THEN
            username_base := username_base || 'user';
        END IF;
        
        -- Truncate if too long
        IF LENGTH(username_base) > 20 THEN
            username_base := LEFT(username_base, 20);
        END IF;
        
        -- Find unique username
        new_username := username_base;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = new_username) LOOP
            new_username := username_base || counter::TEXT;
            counter := counter + 1;
            
            -- Prevent infinite loop
            IF counter > 9999 THEN
                new_username := username_base || extract(epoch from now())::BIGINT;
                EXIT;
            END IF;
        END LOOP;
        
        -- Update the profile with the generated username
        UPDATE public.user_profiles 
        SET username = new_username 
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- Add function to validate username format
CREATE OR REPLACE FUNCTION validate_username(input_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if username is valid format
    IF input_username IS NULL OR 
       LENGTH(input_username) < 3 OR 
       LENGTH(input_username) > 30 OR
       input_username !~ '^[a-z0-9_-]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if username is available
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE username = input_username) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for username uniqueness
CREATE POLICY "Username must be unique" ON public.user_profiles
  FOR INSERT WITH CHECK (
    username IS NULL OR 
    NOT EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE username = NEW.username AND user_id != NEW.user_id
    )
  );

CREATE POLICY "Username updates must be unique" ON public.user_profiles
  FOR UPDATE WITH CHECK (
    username IS NULL OR 
    NOT EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE username = NEW.username AND user_id != NEW.user_id
    )
  );

-- Update the handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_username TEXT;
    username_base TEXT;
    counter INTEGER;
BEGIN
  -- Insert user record
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
  );
  
  -- Generate unique username
  IF new.raw_user_meta_data->>'user_name' IS NOT NULL THEN
    username_base := lower(regexp_replace(new.raw_user_meta_data->>'user_name', '[^a-zA-Z0-9]', '', 'g'));
  ELSIF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    username_base := lower(regexp_replace(new.raw_user_meta_data->>'full_name', '[^a-zA-Z0-9]', '', 'g'));
  ELSE
    username_base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  END IF;
  
  -- Ensure minimum length
  IF LENGTH(username_base) < 3 THEN
    username_base := username_base || 'user';
  END IF;
  
  -- Truncate if too long
  IF LENGTH(username_base) > 20 THEN
    username_base := LEFT(username_base, 20);
  END IF;
  
  -- Find unique username
  new_username := username_base;
  counter := 1;
  
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = new_username) LOOP
    new_username := username_base || counter::TEXT;
    counter := counter + 1;
    
    IF counter > 9999 THEN
      new_username := username_base || extract(epoch from now())::BIGINT;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert user profile with generated username
  INSERT INTO public.user_profiles (user_id, avatar_url, github_username, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name',
    new_username
  );
  
  return new;
END;
$$ language plpgsql security definer;