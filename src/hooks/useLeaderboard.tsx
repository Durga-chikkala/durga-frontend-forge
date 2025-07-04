import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_points: number;
  study_streak: number;
  achievements_count: number;
  posts_count: number;
  rank: number;
  isCurrentUser: boolean;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get all user progress data with profile information
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select(`
            user_id,
            total_points,
            study_streak,
            profiles!user_progress_user_id_fkey(full_name, email)
          `)
          .not('total_points', 'is', null)
          .order('total_points', { ascending: false });

        if (progressError) {
          console.error('Error fetching progress data:', progressError);
          return;
        }

        // Create a map to deduplicate by user_id and keep highest points
        const userMap = new Map();
        progressData?.forEach(entry => {
          const userId = entry.user_id;
          const existing = userMap.get(userId);
          if (!existing || (entry.total_points || 0) > (existing.total_points || 0)) {
            userMap.set(userId, entry);
          }
        });

        const uniqueProgressData = Array.from(userMap.values());

        // Get achievement counts per user
        const { data: achievementData } = await supabase
          .from('user_achievements')
          .select('user_id');

        // Get post counts per user
        const { data: postData } = await supabase
          .from('discussion_posts')
          .select('user_id');

        const achievementCounts = achievementData?.reduce((acc, curr) => {
          acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const postCounts = postData?.reduce((acc, curr) => {
          acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Build leaderboard with proper fallback names
        const leaderboardData = uniqueProgressData.map((entry, index) => {
          let displayName = 'Unknown User';
          
          // Try to get name from profiles
          if (entry.profiles?.full_name) {
            displayName = entry.profiles.full_name;
          } else if (entry.profiles?.email) {
            // Fallback to email if no full name
            displayName = entry.profiles.email.split('@')[0];
          }

          return {
            user_id: entry.user_id,
            full_name: displayName,
            total_points: entry.total_points || 0,
            study_streak: entry.study_streak || 0,
            achievements_count: achievementCounts[entry.user_id] || 0,
            posts_count: postCounts[entry.user_id] || 0,
            rank: index + 1,
            isCurrentUser: entry.user_id === user?.id
          };
        });

        console.log('Leaderboard data:', leaderboardData);
        setLeaderboard(leaderboardData.slice(0, 10));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  return { leaderboard, loading };
};
