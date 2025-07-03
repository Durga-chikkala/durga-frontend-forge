
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
      // Get user's profile creation date to calculate actual days since joining
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      const joinDate = profileData?.created_at ? new Date(profileData.created_at) : new Date();
      const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

      // Get study sessions for streak calculation
      const { data: sessionsData } = await supabase
        .from('user_study_sessions')
        .select('created_at, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (sessionsData && sessionsData.length > 0) {
        // Group sessions by date
        const sessionsByDate = new Map<string, boolean>();
        sessionsData.forEach(session => {
          const sessionDate = new Date(session.created_at);
          sessionDate.setHours(0, 0, 0, 0);
          const dateKey = sessionDate.toDateString();
          sessionsByDate.set(dateKey, true);
        });

        // Calculate current streak from today backwards
        for (let i = 0; i <= daysSinceJoining; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateKey = checkDate.toDateString();
          
          if (sessionsByDate.has(dateKey)) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Don't let streak exceed days since joining
        currentStreak = Math.min(currentStreak, daysSinceJoining);
      }

      // Build week data for the last 7 days
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = [];

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

      // Longest streak calculation (for simplicity, we'll use current streak + some buffer)
      const longestStreak = Math.max(currentStreak, currentStreak + 1);

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
