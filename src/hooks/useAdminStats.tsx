
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  avgProgressScore: number;
  weeklyEngagement: Array<{
    week: string;
    users: number;
    sessions: number;
    completion: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    points: number;
    streak: number;
    completedWeeks: number;
  }>;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    completionRate: 0,
    avgProgressScore: 0,
    weeklyEngagement: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = useCallback(async () => {
    try {
      console.log('Fetching admin stats...');

      // Get total users count from profiles table
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching total users:', usersError);
      }

      console.log('Total users:', totalUsers);

      // Get active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentActivities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (activitiesError) {
        console.error('Error fetching recent activities:', activitiesError);
      }

      const activeUsers = new Set(recentActivities?.map(a => a.user_id) || []).size;
      console.log('Active users:', activeUsers);

      // Get user progress data for completion rate and average score
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*');

      if (progressError) {
        console.error('Error fetching progress data:', progressError);
      }

      console.log('Progress data:', progressData);

      // Calculate completion rate (users who completed at least one week)
      const usersWithCompletedWeeks = new Set(
        progressData?.filter(p => p.is_completed).map(p => p.user_id) || []
      ).size;
      const completionRate = totalUsers && totalUsers > 0 ? Math.round((usersWithCompletedWeeks / totalUsers) * 100) : 0;

      // Calculate average progress score
      const totalPoints = progressData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;
      const avgProgressScore = totalUsers && totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

      // Get top performers with actual names using join
      const { data: topPerformersData, error: topPerformersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          user_progress!user_progress_user_id_fkey (
            total_points,
            study_streak,
            is_completed
          )
        `)
        .not('user_progress.total_points', 'is', null)
        .order('user_progress.total_points', { ascending: false })
        .limit(10);

      if (topPerformersError) {
        console.error('Error fetching top performers:', topPerformersError);
      }

      // Process top performers data
      const topPerformers = (topPerformersData || [])
        .map(profile => {
          const progressEntries = profile.user_progress || [];
          const totalPoints = progressEntries.reduce((sum: number, p: any) => sum + (p.total_points || 0), 0);
          const maxStreak = Math.max(...progressEntries.map((p: any) => p.study_streak || 0), 0);
          const completedWeeks = progressEntries.filter((p: any) => p.is_completed).length;

          const displayName = profile.full_name || profile.email?.split('@')[0] || 'Unknown User';

          return {
            id: profile.id,
            name: displayName,
            points: totalPoints,
            streak: maxStreak,
            completedWeeks
          };
        })
        .filter(performer => performer.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, 3);

      console.log('Top performers:', topPerformers);

      // Get weekly engagement data
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const { data: activityData, error: weeklyError } = await supabase
        .from('user_activities')
        .select('created_at, user_id')
        .gte('created_at', fourWeeksAgo.toISOString())
        .order('created_at', { ascending: true });

      if (weeklyError) {
        console.error('Error fetching weekly data:', weeklyError);
      }

      // Group activities by week
      const weeklyEngagement = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        weekEnd.setHours(23, 59, 59, 999);

        const weekActivities = activityData?.filter(activity => {
          const activityDate = new Date(activity.created_at);
          return activityDate >= weekStart && activityDate <= weekEnd;
        }) || [];

        const uniqueUsers = new Set(weekActivities.map(a => a.user_id)).size;
        
        // Get completion data for this week
        const weekCompletions = progressData?.filter(p => {
          if (!p.completed_at) return false;
          const completedDate = new Date(p.completed_at);
          return completedDate >= weekStart && completedDate <= weekEnd;
        }).length || 0;

        weeklyEngagement.push({
          week: `Week ${4 - i}`,
          users: uniqueUsers,
          sessions: weekActivities.length,
          completion: Math.min(weekCompletions * 10, 100) // Scale for visualization
        });
      }

      console.log('Weekly engagement:', weeklyEngagement);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers,
        completionRate,
        avgProgressScore,
        weeklyEngagement,
        topPerformers
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  return { stats, loading, refetch: fetchAdminStats };
};
