
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
        
        // Get all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        console.log('Profiles found:', profilesData);

        if (!profilesData || profilesData.length === 0) {
          console.log('No profiles found');
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Get all user progress data
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('user_id, total_points, study_streak');

        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }

        console.log('Progress data:', progressData);

        // Get achievement counts
        const { data: achievementData, error: achievementError } = await supabase
          .from('user_achievements')
          .select('user_id');

        if (achievementError) {
          console.error('Error fetching achievements:', achievementError);
        }

        // Get post counts
        const { data: postData, error: postError } = await supabase
          .from('discussion_posts')
          .select('user_id');

        if (postError) {
          console.error('Error fetching posts:', postError);
        }

        // Create leaderboard entries for ALL profiles
        const leaderboardData = profilesData.map(profile => {
          // Aggregate progress data for this user (sum all points and get max streak)
          const userProgressEntries = progressData?.filter(p => p.user_id === profile.id) || [];
          const totalPoints = userProgressEntries.reduce((sum, p) => sum + (p.total_points || 0), 0);
          const maxStreak = Math.max(...userProgressEntries.map(p => p.study_streak || 0), 0);
          
          // Count achievements for this user
          const achievementCount = achievementData?.filter(a => a.user_id === profile.id).length || 0;
          
          // Count posts for this user
          const postCount = postData?.filter(p => p.user_id === profile.id).length || 0;

          const displayName = profile.full_name || profile.email?.split('@')[0] || 'Unknown User';

          return {
            user_id: profile.id,
            full_name: displayName,
            total_points: totalPoints,
            study_streak: maxStreak,
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
