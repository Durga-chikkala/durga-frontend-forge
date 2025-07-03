
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

      // Get real top performers - deduplicated by user
      const { data: topPerformersRaw } = await supabase
        .from('user_progress')
        .select(`
          user_id,
          total_points,
          study_streak,
          profiles!user_progress_user_id_fkey(full_name)
        `)
        .not('total_points', 'is', null)
        .order('total_points', { ascending: false });

      // Deduplicate by user_id and get top 3
      const userMap = new Map();
      topPerformersRaw?.forEach(performer => {
        const userId = performer.user_id;
        const existing = userMap.get(userId);
        if (!existing || (performer.total_points || 0) > (existing.total_points || 0)) {
          userMap.set(userId, performer);
        }
      });

      const topPerformers = Array.from(userMap.values())
        .slice(0, 3)
        .map(p => ({
          id: p.user_id,
          name: (p.profiles as any)?.full_name || 'Anonymous User',
          points: p.total_points || 0,
          streak: p.study_streak || 0,
          completedWeeks: progressData?.filter(prog => 
            prog.user_id === p.user_id && prog.is_completed
          ).length || 0
        }));

      // Get real weekly engagement data from user_study_sessions
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const { data: sessionData } = await supabase
        .from('user_study_sessions')
        .select('created_at, user_id, completed')
        .gte('created_at', fourWeeksAgo.toISOString())
        .order('created_at', { ascending: true });

      // Group sessions by week
      const weeklyData = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        weekEnd.setHours(23, 59, 59, 999);

        const weekSessions = sessionData?.filter(session => {
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
          completion: Math.min(completionRate, 100) // Cap at 100%
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
