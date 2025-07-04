
-- First, let's ensure we have proper foreign key relationships and missing tables

-- Create user_roles table if it doesn't exist properly
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add proper foreign key to discussion_posts -> profiles
ALTER TABLE public.discussion_posts 
DROP CONSTRAINT IF EXISTS discussion_posts_user_id_fkey;

ALTER TABLE public.discussion_posts 
ADD CONSTRAINT discussion_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to discussion_replies -> profiles  
ALTER TABLE public.discussion_replies 
DROP CONSTRAINT IF EXISTS discussion_replies_user_id_fkey;

ALTER TABLE public.discussion_replies 
ADD CONSTRAINT discussion_replies_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to questions -> profiles
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_user_id_fkey1;

ALTER TABLE public.questions 
ADD CONSTRAINT questions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add proper foreign key to user_activities -> profiles
ALTER TABLE public.user_activities 
DROP CONSTRAINT IF EXISTS user_activities_user_id_fkey;

ALTER TABLE public.user_activities 
ADD CONSTRAINT user_activities_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to user_progress -> profiles
ALTER TABLE public.user_progress 
DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

ALTER TABLE public.user_progress 
ADD CONSTRAINT user_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to user_achievements -> profiles
ALTER TABLE public.user_achievements 
DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

ALTER TABLE public.user_achievements 
ADD CONSTRAINT user_achievements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to user_study_sessions -> profiles
ALTER TABLE public.user_study_sessions 
DROP CONSTRAINT IF EXISTS user_study_sessions_user_id_fkey;

ALTER TABLE public.user_study_sessions 
ADD CONSTRAINT user_study_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to session_registrations -> profiles
ALTER TABLE public.session_registrations 
DROP CONSTRAINT IF EXISTS session_registrations_user_id_fkey;

ALTER TABLE public.session_registrations 
ADD CONSTRAINT session_registrations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add proper foreign key to session_registrations -> scheduled_sessions
ALTER TABLE public.session_registrations 
ADD CONSTRAINT session_registrations_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.scheduled_sessions(id) ON DELETE CASCADE;

-- Fix RLS policies that might be blocking data access

-- Allow users to view all profiles (needed for leaderboard and discussions)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);

-- Allow users to view their own profile details
CREATE POLICY "Users can view own profile details" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all user roles (needed for admin checks)
CREATE POLICY "Everyone can view user roles" ON public.user_roles FOR SELECT USING (true);

-- Allow admin operations on user_roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default admin role for existing users if not exists (optional)
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin' 
FROM public.profiles 
WHERE email IN ('sample@gmail.com', 'admin@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussion_posts_user_id ON public.discussion_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
