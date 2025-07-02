
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  badge_color: string;
  criteria_type: string;
  criteria_value: number;
  earned_at?: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export const useUserAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        // Get all available achievements
        const { data: allAchievements } = await supabase
          .from('achievements')
          .select('*')
          .eq('is_active', true);

        // Get user's earned achievements
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        // Get user stats for progress calculation
        const { data: userStats } = await supabase
          .from('user_study_sessions')
          .select('completed')
          .eq('user_id', user.id);

        const { data: userPosts } = await supabase
          .from('discussion_posts')
          .select('id')
          .eq('user_id', user.id);

        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('study_streak')
          .eq('user_id', user.id)
          .order('study_streak', { ascending: false })
          .limit(1);

        const completedSessions = userStats?.filter(s => s.completed).length || 0;
        const forumPosts = userPosts?.length || 0;
        const currentStreak = userProgress?.[0]?.study_streak || 0;

        const earnedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]) || []);

        const processedAchievements = allAchievements?.map(achievement => {
          const earned = earnedMap.has(achievement.id);
          let progress = 0;

          // Calculate progress based on criteria type
          switch (achievement.criteria_type) {
            case 'completion':
              progress = completedSessions;
              break;
            case 'participation':
              progress = forumPosts;
              break;
            case 'streak':
              progress = currentStreak;
              break;
            case 'milestone':
              progress = earned ? 1 : 0;
              break;
          }

          return {
            ...achievement,
            earned_at: earnedMap.get(achievement.id),
            unlocked: earned,
            progress: Math.min(progress, achievement.criteria_value),
            maxProgress: achievement.criteria_value,
            rarity: achievement.points > 300 ? 'legendary' : achievement.points > 200 ? 'epic' : achievement.points > 100 ? 'rare' : 'common'
          };
        }) || [];

        setAchievements(processedAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  return { achievements, loading };
};
