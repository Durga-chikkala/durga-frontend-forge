
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

        if (!profiles || profiles.length === 0) {
          console.log('No profiles found');
          setLeaderboard([]);
          return;
        }

        console.log('Profiles found:', profiles);

        // Fetch additional data for each profile
        const leaderboardData = await Promise.all(
          profiles.map(async (profile) => {
            try {
              // Get user progress - sum all points for the user
              const { data: progressData } = await supabase
                .from('user_progress')
                .select('total_points, study_streak')
                .eq('user_id', profile.id);

              // Get user activities total points
              const { data: activitiesData } = await supabase
                .from('user_activities')
                .select('points_earned')
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
              const progressPoints = progressData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;
              const activityPoints = activitiesData?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
              const totalPoints = progressPoints + activityPoints;
              
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
            } catch (error) {
              console.error('Error processing profile:', profile.id, error);
              return null;
            }
          })
        );

        // Filter out null entries and sort by total points (descending)
        const validLeaderboardData = leaderboardData.filter(Boolean) as LeaderboardEntry[];
        validLeaderboardData.sort((a, b) => b.total_points - a.total_points);

        // Assign ranks
        validLeaderboardData.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        console.log('Final leaderboard data:', validLeaderboardData);
        setLeaderboard(validLeaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  return { leaderboard, loading };
};
