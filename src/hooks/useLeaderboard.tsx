
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
        
        // Get all profiles with their progress data
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            user_progress!user_progress_user_id_fkey (
              total_points,
              study_streak
            ),
            user_achievements!user_achievements_user_id_fkey (
              id
            ),
            discussion_posts!discussion_posts_user_id_fkey (
              id
            )
          `);

        if (leaderboardError) {
          console.error('Error fetching leaderboard:', leaderboardError);
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        console.log('Raw leaderboard data:', leaderboardData);

        if (!leaderboardData || leaderboardData.length === 0) {
          console.log('No profiles found');
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Process the data to create leaderboard entries
        const processedData = leaderboardData.map(profile => {
          // Calculate total points from all progress entries
          const progressEntries = profile.user_progress || [];
          const totalPoints = progressEntries.reduce((sum: number, p: any) => sum + (p.total_points || 0), 0);
          
          // Get maximum study streak
          const maxStreak = Math.max(...progressEntries.map((p: any) => p.study_streak || 0), 0);
          
          // Count achievements and posts
          const achievementCount = (profile.user_achievements || []).length;
          const postCount = (profile.discussion_posts || []).length;

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
        processedData.sort((a, b) => b.total_points - a.total_points);

        // Assign ranks
        processedData.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        console.log('Final leaderboard data:', processedData);
        setLeaderboard(processedData);
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
