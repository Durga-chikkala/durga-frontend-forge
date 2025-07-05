
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
        console.log('Fetching comprehensive leaderboard data...');
        setLoading(true);
        
        // Get all profiles first
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

        console.log('Found profiles:', profiles.length);

        // Process each profile to get their stats
        const leaderboardPromises = profiles.map(async (profile) => {
          try {
            // Get user progress points and streak
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('total_points, study_streak')
              .eq('user_id', profile.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            // Get activity points
            const { data: activityData } = await supabase
              .from('user_activities')
              .select('points_earned')
              .eq('user_id', profile.id);

            // Get achievements count
            const { data: achievementsData } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', profile.id);

            // Get posts count
            const { data: postsData } = await supabase
              .from('discussion_posts')
              .select('id')
              .eq('user_id', profile.id);

            const progressPoints = progressData?.[0]?.total_points || 0;
            const activityPoints = activityData?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;
            const totalPoints = progressPoints + activityPoints;
            const studyStreak = progressData?.[0]?.study_streak || 0;
            const achievementsCount = achievementsData?.length || 0;
            const postsCount = postsData?.length || 0;

            const displayName = profile.full_name || profile.email?.split('@')[0] || 'User';

            return {
              user_id: profile.id,
              full_name: displayName,
              total_points: totalPoints,
              study_streak: studyStreak,
              achievements_count: achievementsCount,
              posts_count: postsCount,
              rank: 0, // Will be set after sorting
              isCurrentUser: profile.id === user?.id
            };
          } catch (error) {
            console.error(`Error processing profile ${profile.id}:`, error);
            return {
              user_id: profile.id,
              full_name: profile.full_name || profile.email?.split('@')[0] || 'User',
              total_points: 0,
              study_streak: 0,
              achievements_count: 0,
              posts_count: 0,
              rank: 0,
              isCurrentUser: profile.id === user?.id
            };
          }
        });

        const leaderboardData = await Promise.all(leaderboardPromises);

        // Sort by total points (descending)
        leaderboardData.sort((a, b) => b.total_points - a.total_points);

        // Assign ranks
        leaderboardData.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        console.log('Final processed leaderboard:', leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  return { leaderboard, loading };
};
