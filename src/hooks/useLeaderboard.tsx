
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
        console.log('Fetching leaderboard data...');
        setLoading(true);
        
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setLeaderboard([]);
          return;
        }

        console.log('Profiles found:', profiles);

        if (!profiles || profiles.length === 0) {
          console.log('No profiles found');
          setLeaderboard([]);
          return;
        }

        // Fetch additional data for each profile
        const leaderboardData = await Promise.all(
          profiles.map(async (profile) => {
            // Get user progress
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('total_points, study_streak')
              .eq('user_id', profile.id);

            // Get achievements count
            const { count: achievementsCount } = await supabase
              .from('user_achievements')
              .select('id', { count: 'exact' })
              .eq('user_id', profile.id);

            // Get posts count
            const { count: postsCount } = await supabase
              .from('discussion_posts')
              .select('id', { count: 'exact' })
              .eq('user_id', profile.id);

            // Calculate totals
            const totalPoints = progressData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;
            const maxStreak = Math.max(...(progressData?.map(p => p.study_streak || 0) || [0]), 0);

            const displayName = profile.full_name || profile.email?.split('@')[0] || 'Unknown User';

            return {
              user_id: profile.id,
              full_name: displayName,
              total_points: totalPoints,
              study_streak: maxStreak,
              achievements_count: achievementsCount || 0,
              posts_count: postsCount || 0,
              rank: 0, // Will be set after sorting
              isCurrentUser: profile.id === user?.id
            };
          })
        );

        // Sort by total points (descending)
        leaderboardData.sort((a, b) => b.total_points - a.total_points);

        // Assign ranks
        leaderboardData.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        console.log('Final leaderboard data:', leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
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
