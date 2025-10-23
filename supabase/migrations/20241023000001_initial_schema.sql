-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE lobby_status AS ENUM ('waiting', 'running', 'finished');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (one-to-one with users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  total_score INTEGER DEFAULT 0,
  challenges_solved INTEGER DEFAULT 0,
  preferred_language TEXT DEFAULT 'javascript',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lobbies table (must be created before challenges due to foreign key reference)
CREATE TABLE public.lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status lobby_status DEFAULT 'waiting',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 50,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_example TEXT,
  output_example TEXT,
  testcases JSONB, -- Store as JSON for flexibility
  difficulty difficulty_level DEFAULT 'easy',
  max_score INTEGER DEFAULT 100,
  time_limit INTEGER DEFAULT 300, -- in seconds
  memory_limit INTEGER DEFAULT 128, -- in MB
  is_global BOOLEAN DEFAULT TRUE, -- TRUE for single-player, FALSE for lobby-specific
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE, -- For lobby challenges
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: lobby challenges must have lobby_id, global challenges must not
  CONSTRAINT challenge_type_check CHECK (
    (is_global = TRUE AND lobby_id IS NULL) OR
    (is_global = FALSE AND lobby_id IS NOT NULL)
  )
);

-- Create challenge_categories junction table
CREATE TABLE public.challenge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, category_id)
);

-- Create lobby_users junction table
CREATE TABLE public.lobby_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lobby_id, user_id)
);

-- Create single_player_sessions table
CREATE TABLE public.single_player_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status session_status DEFAULT 'in_progress',
  total_score INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Either lobby_id or single_player_session_id should be set, not both
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  single_player_session_id UUID REFERENCES public.single_player_sessions(id) ON DELETE CASCADE,
  
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  execution_time INTEGER, -- in milliseconds
  memory_used INTEGER, -- in KB
  test_cases_passed INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  error_message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either lobby_id or single_player_session_id is set, but not both
  CONSTRAINT submission_type_check CHECK (
    (lobby_id IS NOT NULL AND single_player_session_id IS NULL) OR
    (lobby_id IS NULL AND single_player_session_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX idx_challenges_created_by ON public.challenges(created_by);
CREATE INDEX idx_challenges_is_global ON public.challenges(is_global);
CREATE INDEX idx_challenges_lobby_id ON public.challenges(lobby_id);
CREATE INDEX idx_lobbies_status ON public.lobbies(status);
CREATE INDEX idx_lobbies_created_by ON public.lobbies(created_by);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_challenge_id ON public.submissions(challenge_id);
CREATE INDEX idx_submissions_lobby_id ON public.submissions(lobby_id);
CREATE INDEX idx_submissions_session_id ON public.submissions(single_player_session_id);
CREATE INDEX idx_submissions_submitted_at ON public.submissions(submitted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.single_player_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can read their own data and public profile info
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User profiles are readable by everyone, but only updatable by owner
CREATE POLICY "User profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Categories are readable by everyone
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Only admins can create/modify categories
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Challenges are readable by everyone
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

-- Users can create lobby challenges, only admins can create global challenges
CREATE POLICY "Users can create lobby challenges, admins can create all" ON public.challenges
  FOR INSERT WITH CHECK (
    -- Users can create lobby challenges (is_global = FALSE)
    (is_global = FALSE AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())) OR
    -- Only admins can create global challenges (is_global = TRUE)
    (is_global = TRUE AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Users can update own challenges, admins can update all" ON public.challenges
  FOR UPDATE USING (
    -- Users can update their own challenges
    (created_by = auth.uid()) OR
    -- Admins can update all challenges
    (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Users can delete own challenges, admins can delete all" ON public.challenges
  FOR DELETE USING (
    -- Users can delete their own challenges
    (created_by = auth.uid()) OR
    -- Admins can delete all challenges
    (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  );

-- Challenge categories follow challenge permissions
CREATE POLICY "Challenge categories follow challenge permissions" ON public.challenge_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lobbies are viewable by everyone
CREATE POLICY "Lobbies are viewable by everyone" ON public.lobbies
  FOR SELECT USING (true);

-- Users can create lobbies (like quiz apps)
CREATE POLICY "Users can create lobbies" ON public.lobbies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()
    )
  );

-- Lobby creators can update their lobbies
CREATE POLICY "Lobby creators can update lobbies" ON public.lobbies
  FOR UPDATE USING (created_by = auth.uid());

-- Users can join lobbies
CREATE POLICY "Users can join lobbies" ON public.lobby_users
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Lobby users can view lobby memberships" ON public.lobby_users
  FOR SELECT USING (true);

-- Users can manage their own sessions
CREATE POLICY "Users can manage own sessions" ON public.single_player_sessions
  FOR ALL USING (user_id = auth.uid());

-- Users can view their own submissions and public submission stats
CREATE POLICY "Users can view own submissions" ON public.submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own submissions" ON public.submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create functions for automatic user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
  );
  
  INSERT INTO public.user_profiles (user_id, avatar_url, github_username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name'
  );
  
  return new;
END;
$$ language plpgsql security definer;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR each ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lobbies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Array', 'Problems involving arrays and lists'),
('String', 'String manipulation and processing'),
('Math', 'Mathematical problems and algorithms'),
('Dynamic Programming', 'Problems solved using dynamic programming'),
('Graph', 'Graph theory and algorithms'),
('Tree', 'Binary trees and tree algorithms'),
('Sorting', 'Sorting algorithms and related problems'),
('Search', 'Binary search and searching algorithms'),
('Greedy', 'Greedy algorithms and optimization'),
('Backtracking', 'Backtracking and recursive solutions');