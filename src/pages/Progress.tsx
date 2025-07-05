import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { AdvancedProgressTracker } from '@/components/dashboard/AdvancedProgressTracker';
import { StudyStreak } from '@/components/dashboard/StudyStreak';
import { LearningPath } from '@/components/dashboard/LearningPath';
import { AchievementsPanel } from '@/components/dashboard/AchievementsPanel';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  BookOpen, 
  Users,
  Zap,
  Star,
  Trophy,
  Clock,
  CheckCircle
} from 'lucide-react';

const ProgressPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [progressStats, setProgressStats] = useState({
    totalWeeks: 0,
    completedWeeks: 0,
    currentWeek: 1,
    weeklyProgress: 0,
    totalPoints: 0,
    rank: 0,
    totalUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      checkAdminRole();
      fetchProgressStats();
    }
  }, [user, loading, navigate]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    setIsAdmin(data?.role === 'admin');
  };

  const fetchProgressStats = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching progress stats for user:', user.id);

      // Get total weeks from course content
      const { data: contentData, error: contentError } = await supabase
        .from('course_content')
        .select('week_number')
        .eq('is_published', true)
        .order('week_number', { ascending: false })
        .limit(1);

      if (contentError) {
        console.error('Error fetching content data:', contentError);
      }

      const totalWeeks = contentData?.[0]?.week_number || 12;

      // Get user's progress records
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('week_number, is_completed, total_points')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error fetching progress data:', progressError);
      }

      // Calculate completed weeks from progress table
      const completedWeeksFromProgress = progressData?.filter(p => p.is_completed).length || 0;
      
      // Calculate total points from progress table
      const totalPointsFromProgress = progressData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;

      // Get activity points
      const { data: activityData, error: activityError } = await supabase
        .from('user_activities')
        .select('points_earned')
        .eq('user_id', user.id);

      if (activityError) {
        console.error('Error fetching activity data:', activityError);
      }

      const totalPointsFromActivities = activityData?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
      const totalPoints = totalPointsFromProgress + totalPointsFromActivities;

      // Calculate current week (next incomplete week)
      const completedWeeks = completedWeeksFromProgress;
      const currentWeek = Math.min(completedWeeks + 1, totalWeeks);

      // Get user ranking based on total points
      const { data: allUsersProgress, error: rankingError } = await supabase
        .from('profiles')
        .select('id');

      if (rankingError) {
        console.error('Error fetching ranking data:', rankingError);
      }

      // Get all users with their total points for ranking
      const { data: allUserStats } = await supabase
        .from('user_progress')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });

      const userRank = (allUserStats?.findIndex(u => u.user_id === user.id) || 0) + 1;
      const totalUsers = allUsersProgress?.length || 0;

      const calculatedStats = {
        totalWeeks,
        completedWeeks,
        currentWeek,
        weeklyProgress: totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0,
        totalPoints,
        rank: userRank || 0,
        totalUsers
      };

      console.log('Calculated progress stats:', calculatedStats);
      setProgressStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation isAdmin={isAdmin} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 text-lg">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation isAdmin={isAdmin} />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Your Learning Progress 📈
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
              Track your journey, celebrate milestones, and stay motivated on your path to frontend mastery
            </p>
          </div>

          {/* Progress Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{progressStats.completedWeeks}</p>
                <p className="text-blue-100 text-xs sm:text-sm">Weeks Completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{progressStats.totalPoints}</p>
                <p className="text-emerald-100 text-xs sm:text-sm">Points Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">#{progressStats.rank || 'N/A'}</p>
                <p className="text-purple-100 text-xs sm:text-sm">Your Rank</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{progressStats.totalUsers}</p>
                <p className="text-yellow-100 text-xs sm:text-sm">Students</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Bar */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Course Progress</h3>
                    <p className="text-sm sm:text-base text-gray-600">Week {progressStats.currentWeek} of {progressStats.totalWeeks}</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg">
                  {Math.round(progressStats.weeklyProgress)}%
                </Badge>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Overall completion</span>
                  <span>{progressStats.completedWeeks} / {progressStats.totalWeeks} weeks</span>
                </div>
                <div className="relative">
                  <Progress value={progressStats.weeklyProgress} className="h-3 sm:h-4" />
                  <div 
                    className="absolute top-0 left-0 h-3 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressStats.weeklyProgress}%` }}
                  />
                </div>
                
                {progressStats.weeklyProgress >= 100 && (
                  <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mt-2 sm:mt-3">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Congratulations! Course completed! 🎉</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <AdvancedProgressTracker />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <StudyStreak />
            <StatsCard />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LearningPath />
          <AchievementsPanel />
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
