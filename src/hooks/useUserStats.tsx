
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserStats {
  sessionsCompleted: number;
  totalSessions: number;
  studyStreak: number;
  achievementsEarned: number;
  forumPosts: number;
  totalPoints: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    sessionsCompleted: 0,
    totalSessions: 0,
    studyStreak: 0,
    achievementsEarned: 0,
    forumPosts: 0,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        console.log('Fetching user stats for user:', user.id);

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

        // Get current study streak and total points from progress
        const { data: progress } = await supabase
          .from('user_progress')
          .select('study_streak, total_points')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get total points from activities
        const { data: activities } = await supabase
          .from('user_activities')
          .select('points_earned')
          .eq('user_id', user.id);

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

        // Calculate total points from both progress and activities
        const progressPoints = progress?.[0]?.total_points || 0;
        const activityPoints = activities?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;
        const totalPoints = progressPoints + activityPoints;

        const newStats = {
          sessionsCompleted: completedSessions?.length || 0,
          totalSessions: totalSessions?.length || 0,
          studyStreak: progress?.[0]?.study_streak || 0,
          achievementsEarned: achievements?.length || 0,
          forumPosts: posts?.length || 0,
          totalPoints: totalPoints
        };

        console.log('User stats calculated:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Set default stats on error
        setStats({
          sessionsCompleted: 0,
          totalSessions: 0,
          studyStreak: 0,
          achievementsEarned: 0,
          forumPosts: 0,
          totalPoints: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
