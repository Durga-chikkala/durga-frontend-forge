
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
      // Get total weeks from course content
      const { data: contentData } = await supabase
        .from('course_content')
        .select('week_number')
        .eq('is_published', true)
        .order('week_number', { ascending: false })
        .limit(1);

      const totalWeeks = contentData?.[0]?.week_number || 12;

      // Get user's completed sessions
      const { data: sessionsData } = await supabase
        .from('user_study_sessions')
        .select('content_id, created_at')
        .eq('user_id', user.id)
        .eq('completed', true);

      // Get user's total points
      const { data: pointsData } = await supabase
        .from('user_progress')
        .select('total_points')
        .eq('user_id', user.id);

      const totalPoints = pointsData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;

      // Get current week (based on course start date or current date)
      const currentWeek = Math.min(Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000)) % totalWeeks || 1, totalWeeks);

      // Calculate completed weeks
      const completedWeeks = sessionsData?.length ? Math.min(Math.floor(sessionsData.length / 2), totalWeeks) : 0;

      // Get user ranking
      const { data: rankingData } = await supabase
        .from('user_progress')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });

      const userRank = rankingData?.findIndex(r => r.user_id === user.id) + 1 || 0;
      const totalUsers = rankingData?.length || 0;

      setProgressStats({
        totalWeeks,
        completedWeeks,
        currentWeek,
        weeklyProgress: (currentWeek / totalWeeks) * 100,
        totalPoints,
        rank: userRank,
        totalUsers
      });
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
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Your Learning Progress 📈
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Track your journey, celebrate milestones, and stay motivated on your path to frontend mastery
            </p>
          </div>

          {/* Progress Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold mb-1">{progressStats.completedWeeks}</p>
                <p className="text-blue-100 text-sm">Weeks Completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold mb-1">{progressStats.totalPoints}</p>
                <p className="text-emerald-100 text-sm">Points Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold mb-1">#{progressStats.rank || 'N/A'}</p>
                <p className="text-purple-100 text-sm">Your Rank</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold mb-1">{progressStats.totalUsers}</p>
                <p className="text-yellow-100 text-sm">Students</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Bar */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Course Progress</h3>
                    <p className="text-gray-600">Week {progressStats.currentWeek} of {progressStats.totalWeeks}</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-lg">
                  {Math.round(progressStats.weeklyProgress)}%
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Overall completion</span>
                  <span>{progressStats.completedWeeks} / {progressStats.totalWeeks} weeks</span>
                </div>
                <div className="relative">
                  <Progress value={progressStats.weeklyProgress} className="h-4" />
                  <div 
                    className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressStats.weeklyProgress}%` }}
                  />
                </div>
                
                {progressStats.weeklyProgress >= 100 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-3">
                    <Trophy className="w-4 h-4" />
                    <span>Congratulations! Course completed! 🎉</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AdvancedProgressTracker />
          </div>
          <div className="space-y-6">
            <StudyStreak />
            <StatsCard />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LearningPath />
          <AchievementsPanel />
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
