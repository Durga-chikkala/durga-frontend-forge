
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RealTimeNotifications } from '@/components/dashboard/RealTimeNotifications';
import { StudyStreak } from '@/components/dashboard/StudyStreak';
import { AchievementsPanel } from '@/components/dashboard/AchievementsPanel';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AdvancedProgressTracker } from '@/components/dashboard/AdvancedProgressTracker';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Calendar, BookOpen, Trophy, Zap, Target } from 'lucide-react';

interface Profile {
  full_name: string;
  email: string;
  created_at?: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    weeklyGoal: 5,
    completedThisWeek: 3,
    upcomingSessions: 2,
    totalUsers: 0
  });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchData();
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch dashboard statistics
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { count: upcomingSessions } = await supabase
        .from('scheduled_sessions')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .gte('session_date', new Date().toISOString());

      setDashboardStats(prev => ({
        ...prev,
        totalUsers: totalUsers || 0,
        upcomingSessions: upcomingSessions || 0
      }));

    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      setIsAdmin(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const weeklyCompletionRate = (dashboardStats.completedThisWeek / dashboardStats.weeklyGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Navigation with Notifications */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Navigation isAdmin={isAdmin} />
          <RealTimeNotifications />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome back, {profile?.full_name || 'Student'}! 🚀
          </h1>
          <p className="text-gray-600 text-xl">Continue your advanced frontend development journey</p>
          
          {/* Weekly Goal Progress */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
                <Badge className="bg-green-100 text-green-700">
                  {dashboardStats.completedThisWeek}/{dashboardStats.weeklyGoal}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(weeklyCompletionRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">{Math.round(weeklyCompletionRate)}% complete</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Learners</p>
                  <p className="text-3xl font-bold">{dashboardStats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold">{dashboardStats.completedThisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Upcoming</p>
                  <p className="text-3xl font-bold">{dashboardStats.upcomingSessions}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Goal Progress</p>
                  <p className="text-3xl font-bold">{Math.round(weeklyCompletionRate)}%</p>
                </div>
                <Target className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card */}
            <UserProfileCard profile={profile} />

            {/* Advanced Progress Tracker */}
            <AdvancedProgressTracker />

            {/* Quick Actions */}
            <QuickActions />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Study Streak */}
            <StudyStreak />

            {/* Stats Card */}
            <StatsCard />

            {/* Achievements Panel */}
            <AchievementsPanel />

            {/* Activity Feed */}
            <ActivityFeed />
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Explore More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              onClick={() => navigate('/course-content')}
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="font-semibold">Course Content</span>
            </Button>

            <Button
              onClick={() => navigate('/progress')}
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300 hover:scale-105"
            >
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="font-semibold">My Progress</span>
            </Button>

            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 hover:scale-105"
            >
              <Trophy className="w-8 h-8 text-yellow-600" />
              <span className="font-semibold">Leaderboard</span>
            </Button>

            <Button
              onClick={() => navigate('/community')}
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 hover:scale-105"
            >
              <Users className="w-8 h-8 text-purple-600" />
              <span className="font-semibold">Community</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
