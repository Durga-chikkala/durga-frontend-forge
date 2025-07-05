
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProgressStatsData {
  totalWeeks: number;
  completedWeeks: number;
  currentWeek: number;
  weeklyProgress: number;
  totalPoints: number;
  rank: number;
  totalUsers: number;
}

export const useProgressStats = () => {
  const { user } = useAuth();
  const [progressStats, setProgressStats] = useState<ProgressStatsData>({
    totalWeeks: 0,
    completedWeeks: 0,
    currentWeek: 1,
    weeklyProgress: 0,
    totalPoints: 0,
    rank: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchProgressStats = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching progress stats for user:', user.id);

      // Get total weeks from course content
      const { data: contentData, error: contentError } = await supabase
        .from('course_content')
        .select('week_number')
        .eq('is_published', true)
        .order('week_number', { ascending: false })
        .limit(1);

      if (contentError) {
        console.error('Error fetching content data:', contentError);
      }

      const totalWeeks = contentData?.[0]?.week_number || 12;

      // Get user's progress records
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('week_number, is_completed, total_points')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error fetching progress data:', progressError);
      }

      // Calculate completed weeks from progress table
      const completedWeeksFromProgress = progressData?.filter(p => p.is_completed).length || 0;
      
      // Calculate total points from progress table
      const totalPointsFromProgress = progressData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;

      // Get activity points
      const { data: activityData, error: activityError } = await supabase
        .from('user_activities')
        .select('points_earned')
        .eq('user_id', user.id);

      if (activityError) {
        console.error('Error fetching activity data:', activityError);
      }

      const totalPointsFromActivities = activityData?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
      const totalPoints = totalPointsFromProgress + totalPointsFromActivities;

      // Calculate current week (next incomplete week)
      const completedWeeks = completedWeeksFromProgress;
      const currentWeek = Math.min(completedWeeks + 1, totalWeeks);

      // Get user ranking based on total points
      const { data: allUsersProgress, error: rankingError } = await supabase
        .from('profiles')
        .select('id');

      if (rankingError) {
        console.error('Error fetching ranking data:', rankingError);
      }

      // Get all users with their total points for ranking
      const { data: allUserStats } = await supabase
        .from('user_progress')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });

      const userRank = (allUserStats?.findIndex(u => u.user_id === user.id) || 0) + 1;
      const totalUsers = allUsersProgress?.length || 0;

      const calculatedStats = {
        totalWeeks,
        completedWeeks,
        currentWeek,
        weeklyProgress: totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0,
        totalPoints,
        rank: userRank || 0,
        totalUsers
      };

      console.log('Calculated progress stats:', calculatedStats);
      setProgressStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressStats();
  }, [user]);

  return { progressStats, loading };
};
