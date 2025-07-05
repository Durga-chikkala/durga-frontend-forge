
-- Fix RLS policies to allow proper data visibility for community features

-- Allow everyone to view all profiles (needed for leaderboard and discussions)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Everyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow everyone to view all user progress (needed for leaderboard)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Everyone can view user progress" 
  ON public.user_progress 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own progress" 
  ON public.user_progress 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view all user activities (needed for leaderboard and activity feed)
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Everyone can view user activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own activities" 
  ON public.user_activities 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view all user achievements (needed for leaderboard)
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Everyone can view user achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own achievements" 
  ON public.user_achievements 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view user study sessions (needed for accurate stats)
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_study_sessions;
CREATE POLICY "Everyone can view user sessions" 
  ON public.user_study_sessions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own sessions" 
  ON public.user_study_sessions 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add missing RLS policies for user_roles table
CREATE POLICY "Everyone can view user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage user roles" 
  ON public.user_roles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
