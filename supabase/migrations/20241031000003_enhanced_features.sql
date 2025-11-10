-- Database improvements for challenge creation with images and better structure
-- Run this after the initial schema

-- Add image and media support to challenges
ALTER TABLE public.challenges 
ADD COLUMN images JSONB DEFAULT '[]', -- Array of image URLs/metadata
ADD COLUMN video_url TEXT, -- Optional video explanation
ADD COLUMN hints JSONB DEFAULT '[]', -- Array of hints for users
ADD COLUMN solution_explanation TEXT, -- Detailed solution explanation
ADD COLUMN starter_code JSONB DEFAULT '{}', -- Starter code for different languages
ADD COLUMN tags TEXT[] DEFAULT '{}'; -- Additional tags for better searchability

-- Add challenge statistics
ALTER TABLE public.challenges
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN attempt_count INTEGER DEFAULT 0,
ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 0.0; -- Percentage of successful submissions

-- Add challenge templates table for reusable patterns
CREATE TABLE public.challenge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Template structure
  language TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add media files table for storing images, videos, etc.
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase storage
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add challenge ratings and reviews
CREATE TABLE public.challenge_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Add programming languages table for better language management
CREATE TABLE public.programming_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  file_extension TEXT NOT NULL,
  monaco_language_id TEXT, -- For Monaco Editor
  piston_language TEXT, -- For Piston API
  piston_version TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  template_code TEXT, -- Default template for this language
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Improve submissions table with more detailed tracking
ALTER TABLE public.submissions
ADD COLUMN language_version TEXT,
ADD COLUMN output TEXT, -- Store the actual output
ADD COLUMN compilation_error TEXT, -- Store compilation errors separately
ADD COLUMN runtime_error TEXT, -- Store runtime errors separately
ADD COLUMN test_results JSONB, -- Store detailed test results
ADD COLUMN submission_number INTEGER DEFAULT 1; -- Track multiple submissions per user/challenge

-- Add user achievements system
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Achievement icon/badge
  criteria JSONB NOT NULL, -- Achievement criteria as JSON
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Add challenge collections/playlists
CREATE TABLE public.challenge_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.collection_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.challenge_collections(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, challenge_id)
);

-- Add user preferences and settings
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preferred_theme TEXT DEFAULT 'dark',
  preferred_font_size INTEGER DEFAULT 14,
  preferred_font_family TEXT DEFAULT 'JetBrains Mono',
  auto_save_code BOOLEAN DEFAULT TRUE,
  show_hints BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}', -- Additional custom settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_challenges_images ON public.challenges USING gin(images);
CREATE INDEX idx_challenges_tags ON public.challenges USING gin(tags);
CREATE INDEX idx_challenges_view_count ON public.challenges(view_count);
CREATE INDEX idx_challenges_success_rate ON public.challenges(success_rate);
CREATE INDEX idx_media_files_uploaded_by ON public.media_files(uploaded_by);
CREATE INDEX idx_challenge_ratings_challenge_id ON public.challenge_ratings(challenge_id);
CREATE INDEX idx_challenge_ratings_rating ON public.challenge_ratings(rating);
CREATE INDEX idx_submissions_submission_number ON public.submissions(submission_number);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_collection_challenges_collection_id ON public.collection_challenges(collection_id);

-- Add RLS policies for new tables

-- Challenge templates
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates are viewable by everyone" ON public.challenge_templates
  FOR SELECT USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.challenge_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates" ON public.challenge_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Media files
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media files" ON public.media_files
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Users can upload media files" ON public.media_files
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Challenge ratings
ALTER TABLE public.challenge_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone" ON public.challenge_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create own ratings" ON public.challenge_ratings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ratings" ON public.challenge_ratings
  FOR UPDATE USING (user_id = auth.uid());

-- Programming languages (read-only for users, admin-only for modifications)
ALTER TABLE public.programming_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Languages are viewable by everyone" ON public.programming_languages
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage languages" ON public.programming_languages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements
  FOR SELECT USING (true);

-- Challenge collections
ALTER TABLE public.challenge_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections are viewable by everyone" ON public.challenge_collections
  FOR SELECT USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can create collections" ON public.challenge_collections
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own collections" ON public.challenge_collections
  FOR UPDATE USING (created_by = auth.uid());

-- User settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (user_id = auth.uid());

-- Insert default programming languages
INSERT INTO public.programming_languages (name, display_name, file_extension, monaco_language_id, piston_language, piston_version, template_code) VALUES
('javascript', 'JavaScript', '.js', 'javascript', 'javascript', '18.15.0', 'function solution() {\n    // Your code here\n    return null;\n}'),
('python', 'Python', '.py', 'python', 'python', '3.10.0', 'def solution():\n    # Your code here\n    return None'),
('java', 'Java', '.java', 'java', 'java', '15.0.2', 'public class Solution {\n    public Object solution() {\n        // Your code here\n        return null;\n    }\n}'),
('cpp', 'C++', '.cpp', 'cpp', 'cpp', '10.2.0', '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto solution() {\n        // Your code here\n        return nullptr;\n    }\n};'),
('c', 'C', '.c', 'c', 'c', '10.2.0', '#include <stdio.h>\n\nint solution() {\n    // Your code here\n    return 0;\n}'),
('typescript', 'TypeScript', '.ts', 'typescript', 'typescript', '5.0.3', 'function solution(): any {\n    // Your code here\n    return null;\n}'),
('rust', 'Rust', '.rs', 'rust', 'rust', '1.68.2', 'fn solution() {\n    // Your code here\n}'),
('go', 'Go', '.go', 'go', 'go', '1.16.2', 'package main\n\nfunc solution() {\n    // Your code here\n}');

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon, criteria, points) VALUES
('First Steps', 'Complete your first challenge', '🎯', '{"type": "challenges_completed", "count": 1}', 10),
('Getting Started', 'Complete 5 challenges', '🚀', '{"type": "challenges_completed", "count": 5}', 25),
('Problem Solver', 'Complete 10 challenges', '🧩', '{"type": "challenges_completed", "count": 10}', 50),
('Code Master', 'Complete 25 challenges', '👑', '{"type": "challenges_completed", "count": 25}', 100),
('Perfectionist', 'Get 100% on 3 challenges', '⭐', '{"type": "perfect_scores", "count": 3}', 30),
('Speed Demon', 'Complete a challenge in under 30 seconds', '⚡', '{"type": "fast_completion", "time": 30}', 40),
('Polyglot', 'Solve challenges in 3 different languages', '🌍', '{"type": "languages_used", "count": 3}', 60);

-- Add functions for statistics calculation
CREATE OR REPLACE FUNCTION calculate_challenge_success_rate(challenge_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_submissions INTEGER;
  successful_submissions INTEGER;
  success_rate DECIMAL(5,2);
BEGIN
  SELECT COUNT(*) INTO total_submissions 
  FROM public.submissions 
  WHERE challenge_id = calculate_challenge_success_rate.challenge_id;
  
  SELECT COUNT(*) INTO successful_submissions 
  FROM public.submissions 
  WHERE challenge_id = calculate_challenge_success_rate.challenge_id 
  AND is_correct = TRUE;
  
  IF total_submissions = 0 THEN
    success_rate = 0.0;
  ELSE
    success_rate = (successful_submissions::DECIMAL / total_submissions::DECIMAL) * 100;
  END IF;
  
  -- Update the challenge statistics
  UPDATE public.challenges 
  SET success_rate = calculate_challenge_success_rate.success_rate,
      attempt_count = total_submissions
  WHERE id = calculate_challenge_success_rate.challenge_id;
  
  RETURN success_rate;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update challenge statistics on new submissions
CREATE OR REPLACE FUNCTION update_challenge_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update challenge statistics
  PERFORM calculate_challenge_success_rate(NEW.challenge_id);
  
  -- Update user profile statistics
  UPDATE public.user_profiles 
  SET challenges_solved = (
    SELECT COUNT(DISTINCT challenge_id) 
    FROM public.submissions 
    WHERE user_id = NEW.user_id AND is_correct = TRUE
  ),
  total_score = (
    SELECT COALESCE(SUM(score), 0)
    FROM public.submissions 
    WHERE user_id = NEW.user_id AND is_correct = TRUE
  )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenge_stats_trigger
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION update_challenge_stats();

-- Add trigger for user settings creation
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();