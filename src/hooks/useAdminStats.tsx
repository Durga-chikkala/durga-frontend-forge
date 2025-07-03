
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
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (users with activity in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentSessions } = await supabase
        .from('user_study_sessions')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const activeUsers = new Set(recentSessions?.map(s => s.user_id) || []).size;

      // Get user progress data
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*');

      // Calculate completion rate (users who completed at least one week)
      const usersWithProgress = new Set(progressData?.filter(p => p.is_completed).map(p => p.user_id) || []).size;
      const completionRate = totalUsers && totalUsers > 0 ? (usersWithProgress / totalUsers) * 100 : 0;

      // Calculate average progress score
      const totalPoints = progressData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;
      const avgProgressScore = totalUsers && totalUsers > 0 ? totalPoints / totalUsers : 0;

      // Get top performers (real data, limited to actual users)
      const { data: topPerformersData } = await supabase
        .from('user_progress')
        .select(`
          user_id,
          total_points,
          study_streak,
          profiles!user_progress_user_id_fkey(full_name)
        `)
        .not('total_points', 'is', null)
        .order('total_points', { ascending: false })
        .limit(5);

      // Remove duplicates and format top performers
      const uniquePerformers = new Map();
      topPerformersData?.forEach(p => {
        const userId = p.user_id;
        const existing = uniquePerformers.get(userId);
        if (!existing || (p.total_points || 0) > (existing.total_points || 0)) {
          uniquePerformers.set(userId, p);
        }
      });

      const topPerformers = Array.from(uniquePerformers.values()).map(p => ({
        id: p.user_id,
        name: (p.profiles as any)?.full_name || 'Anonymous User',
        points: p.total_points || 0,
        streak: p.study_streak || 0,
        completedWeeks: progressData?.filter(prog => 
          prog.user_id === p.user_id && prog.is_completed
        ).length || 0
      })).slice(0, 3); // Limit to top 3 to avoid duplicates

      // Generate weekly engagement data based on actual sessions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentSessionsForWeeks } = await supabase
        .from('user_study_sessions')
        .select('created_at, user_id, completed')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Group sessions by week
      const weeklyData = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        weekEnd.setHours(23, 59, 59, 999);

        const weekSessions = recentSessionsForWeeks?.filter(session => {
          const sessionDate = new Date(session.created_at);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        }) || [];

        const uniqueUsers = new Set(weekSessions.map(s => s.user_id)).size;
        const completedSessions = weekSessions.filter(s => s.completed).length;
        const completionRate = weekSessions.length > 0 ? Math.round((completedSessions / weekSessions.length) * 100) : 0;

        weeklyData.push({
          week: `Week ${4 - i}`,
          users: uniqueUsers,
          sessions: weekSessions.length,
          completion: completionRate
        });
      }

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers,
        completionRate: Math.round(completionRate),
        avgProgressScore: Math.round(avgProgressScore),
        weeklyEngagement: weeklyData,
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
