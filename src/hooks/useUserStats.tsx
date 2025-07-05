
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

        // Get completed sessions count (properly count unique completed sessions)
        const { data: completedSessions, error: sessionsError } = await supabase
          .from('user_study_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (sessionsError) {
          console.error('Error fetching completed sessions:', sessionsError);
        }

        // Get total available published content (this represents total possible sessions)
        const { data: totalContent, error: contentError } = await supabase
          .from('course_content')
          .select('id')
          .eq('is_published', true);

        if (contentError) {
          console.error('Error fetching total content:', contentError);
        }

        // Get user progress for streak and points
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('study_streak, total_points')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }

        // Get activity points
        const { data: activities, error: activitiesError } = await supabase
          .from('user_activities')
          .select('points_earned')
          .eq('user_id', user.id);

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError);
        }

        // Get achievements count
        const { data: achievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', user.id);

        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
        }

        // Get forum posts count
        const { data: posts, error: postsError } = await supabase
          .from('discussion_posts')
          .select('id')
          .eq('user_id', user.id);

        if (postsError) {
          console.error('Error fetching posts:', postsError);
        }

        // Calculate accurate stats
        const sessionsCompletedCount = completedSessions?.length || 0;
        const totalSessionsCount = totalContent?.length || 0;
        const currentStreak = progressData?.[0]?.study_streak || 0;
        const progressPoints = progressData?.[0]?.total_points || 0;
        const activityPoints = activities?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;
        const totalPoints = progressPoints + activityPoints;
        const achievementsCount = achievements?.length || 0;
        const postsCount = posts?.length || 0;

        const calculatedStats = {
          sessionsCompleted: sessionsCompletedCount,
          totalSessions: totalSessionsCount,
          studyStreak: currentStreak,
          achievementsEarned: achievementsCount,
          forumPosts: postsCount,
          totalPoints: totalPoints
        };

        console.log('Calculated user stats:', calculatedStats);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error calculating user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
