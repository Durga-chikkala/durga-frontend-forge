
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserStats {
  sessionsCompleted: number;
  totalSessions: number;
  studyStreak: number;
  achievementsEarned: number;
  forumPosts: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    sessionsCompleted: 0,
    totalSessions: 0,
    studyStreak: 0,
    achievementsEarned: 0,
    forumPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get completed sessions
        const { data: completedSessions } = await supabase
          .from('user_study_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('completed', true);

        // Get total available sessions
        const { data: totalSessions } = await supabase
          .from('course_content')
          .select('id')
          .eq('is_published', true);

        // Get current study streak
        const { data: progress } = await supabase
          .from('user_progress')
          .select('study_streak')
          .eq('user_id', user.id)
          .order('study_streak', { ascending: false })
          .limit(1);

        // Get earned achievements
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', user.id);

        // Get forum posts
        const { data: posts } = await supabase
          .from('discussion_posts')
          .select('id')
          .eq('user_id', user.id);

        setStats({
          sessionsCompleted: completedSessions?.length || 0,
          totalSessions: totalSessions?.length || 0,
          studyStreak: progress?.[0]?.study_streak || 0,
          achievementsEarned: achievements?.length || 0,
          forumPosts: posts?.length || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
