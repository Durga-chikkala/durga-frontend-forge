
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
        
        // First, get all profiles to ensure we have user data
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        console.log('Profiles data:', profilesData);

        if (!profilesData || profilesData.length === 0) {
          console.log('No profiles found');
          setLeaderboard([]);
          return;
        }

        // Get user progress data
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('user_id, total_points, study_streak');

        console.log('Progress data:', progressData);

        // Get achievement counts
        const { data: achievementData } = await supabase
          .from('user_achievements')
          .select('user_id');

        // Get post counts
        const { data: postData } = await supabase
          .from('discussion_posts')
          .select('user_id');

        // Process the data to create leaderboard entries
        const leaderboardData = profilesData.map(profile => {
          // Find progress data for this user
          const userProgress = progressData?.find(p => p.user_id === profile.id);
          
          // Count achievements for this user
          const achievementCount = achievementData?.filter(a => a.user_id === profile.id).length || 0;
          
          // Count posts for this user
          const postCount = postData?.filter(p => p.user_id === profile.id).length || 0;

          return {
            user_id: profile.id,
            full_name: profile.full_name || profile.email?.split('@')[0] || 'Unknown User',
            total_points: userProgress?.total_points || 0,
            study_streak: userProgress?.study_streak || 0,
            achievements_count: achievementCount,
            posts_count: postCount,
            rank: 0, // Will be set after sorting
            isCurrentUser: profile.id === user?.id
          };
        });

        // Sort by total points (descending)
        leaderboardData.sort((a, b) => b.total_points - a.total_points);

        // Assign ranks
        leaderboardData.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        console.log('Final leaderboard data:', leaderboardData);
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
