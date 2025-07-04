
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
        
        // Get all profiles with comprehensive data in a single query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            user_progress(total_points, study_streak),
            user_activities(points_earned),
            user_achievements(id),
            discussion_posts(id)
          `);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setLeaderboard([]);
          return;
        }

        if (!profilesData || profilesData.length === 0) {
          console.log('No profiles found');
          setLeaderboard([]);
          return;
        }

        console.log('Comprehensive profiles data:', profilesData);

        // Process the data to create leaderboard entries
        const leaderboardData = profilesData.map((profile: any) => {
          // Calculate total points from user_progress
          const progressPoints = Array.isArray(profile.user_progress) 
            ? profile.user_progress.reduce((sum: number, p: any) => sum + (p.total_points || 0), 0)
            : 0;

          // Calculate total points from user_activities
          const activityPoints = Array.isArray(profile.user_activities)
            ? profile.user_activities.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0)
            : 0;

          // Get maximum study streak
          const maxStreak = Array.isArray(profile.user_progress) && profile.user_progress.length > 0
            ? Math.max(...profile.user_progress.map((p: any) => p.study_streak || 0))
            : 0;

          // Count achievements
          const achievementsCount = Array.isArray(profile.user_achievements) 
            ? profile.user_achievements.length 
            : 0;

          // Count posts
          const postsCount = Array.isArray(profile.discussion_posts) 
            ? profile.discussion_posts.length 
            : 0;

          const totalPoints = progressPoints + activityPoints;
          const displayName = profile.full_name || profile.email?.split('@')[0] || 'Unknown User';

          return {
            user_id: profile.id,
            full_name: displayName,
            total_points: totalPoints,
            study_streak: maxStreak,
            achievements_count: achievementsCount,
            posts_count: postsCount,
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

    if (user) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  return { leaderboard, loading };
};
