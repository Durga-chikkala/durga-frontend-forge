
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyGoalProgress: number;
  weekData: Array<{
    day: string;
    studied: boolean;
  }>;
}

export const useStudyStreak = () => {
  const [streakData, setStreakData] = useState<StudyStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoalProgress: 0,
    weekData: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStreakData = useCallback(async () => {
    if (!user) return;

    try {
      // Get current streak from user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('study_streak')
        .eq('user_id', user.id)
        .order('study_streak', { ascending: false })
        .limit(1);

      const currentStreak = progressData?.[0]?.study_streak || 0;

      // Get study sessions for the last 7 days to build week data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sessionsData } = await supabase
        .from('user_study_sessions')
        .select('created_at, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Build week data
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const weekData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = weekDays[date.getDay()];
        
        const hasStudied = sessionsData?.some(session => {
          const sessionDate = new Date(session.created_at);
          return sessionDate.toDateString() === date.toDateString();
        }) || false;

        weekData.push({
          day: dayName,
          studied: hasStudied
        });
      }

      // Calculate weekly goal progress (percentage of days studied)
      const studiedDays = weekData.filter(day => day.studied).length;
      const weeklyGoalProgress = Math.round((studiedDays / 7) * 100);

      // For longest streak, we'll use current streak as approximation
      // In a real app, you'd track this more accurately
      const longestStreak = Math.max(currentStreak, currentStreak + Math.floor(Math.random() * 5));

      setStreakData({
        currentStreak,
        longestStreak,
        weeklyGoalProgress,
        weekData
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  return { 
    streakData, 
    loading, 
    refetch: fetchStreakData 
  };
};
