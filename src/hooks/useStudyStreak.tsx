
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
      // Get user's latest progress for accurate streak
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('study_streak')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      // Get study sessions for week data
      const { data: sessionsData } = await supabase
        .from('user_study_sessions')
        .select('created_at, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      // Use the streak from user_progress table for accuracy
      const currentStreak = progressData?.[0]?.study_streak || 0;

      // Build week data for the last 7 days
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = weekDays[date.getDay()];
        
        const hasStudied = sessionsData?.some(session => {
          const sessionDate = new Date(session.created_at);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.toDateString() === date.toDateString();
        }) || false;

        weekData.push({
          day: dayName,
          studied: hasStudied
        });
      }

      // Calculate weekly goal progress
      const studiedDays = weekData.filter(day => day.studied).length;
      const weeklyGoalProgress = Math.round((studiedDays / 7) * 100);

      // Use current streak as longest for simplicity (can be enhanced later)
      const longestStreak = Math.max(currentStreak, 1);

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
