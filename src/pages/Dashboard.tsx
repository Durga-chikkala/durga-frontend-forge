
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
import { TrendingUp, Users, Calendar, BookOpen, Trophy, Target, ArrowRight, Clock, Star } from 'lucide-react';

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
    completedThisWeek: 0,
    upcomingSessions: 0,
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

      // Fetch actual user progress data
      const { data: userSessions } = await supabase
        .from('user_study_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true);

      // Get current week sessions
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const thisWeekSessions = userSessions?.filter(session => 
        new Date(session.created_at) >= oneWeekAgo
      ) || [];

      // Fetch upcoming sessions
      const { count: upcomingSessions } = await supabase
        .from('scheduled_sessions')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .gte('session_date', new Date().toISOString());

      // Fetch total users for community size
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      setDashboardStats({
        weeklyGoal: 5,
        completedThisWeek: thisWeekSessions.length,
        upcomingSessions: upcomingSessions || 0,
        totalUsers: totalUsers || 0
      });

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  const weeklyCompletionRate = dashboardStats.weeklyGoal > 0 ? (dashboardStats.completedThisWeek / dashboardStats.weeklyGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation isAdmin={isAdmin} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Continue your frontend development journey and unlock your potential
            </p>
          </div>

          {/* Weekly Goal Progress Card */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Weekly Learning Goal</h3>
                      <p className="text-sm text-gray-600">Stay consistent to build momentum</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                    {dashboardStats.completedThisWeek}/{dashboardStats.weeklyGoal} Sessions
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress this week</span>
                    <span className="font-medium text-gray-900">{Math.round(weeklyCompletionRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(weeklyCompletionRate, 100)}%` }}
                    ></div>
                  </div>
                  {weeklyCompletionRate >= 100 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-2">
                      <Trophy className="w-4 h-4" />
                      <span>Goal achieved! Keep up the great work! 🎉</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium mb-1">Learning Community</p>
                  <p className="text-2xl lg:text-3xl font-bold mb-1">{dashboardStats.totalUsers}</p>
                  <p className="text-blue-200 text-xs">Active students</p>
                </div>
                <Users className="w-8 h-8 text-blue-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-emerald-100 text-sm font-medium mb-1">This Week</p>
                  <p className="text-2xl lg:text-3xl font-bold mb-1">{dashboardStats.completedThisWeek}</p>
                  <p className="text-emerald-200 text-xs">Sessions completed</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-100 text-sm font-medium mb-1">Upcoming</p>
                  <p className="text-2xl lg:text-3xl font-bold mb-1">{dashboardStats.upcomingSessions}</p>
                  <p className="text-purple-200 text-xs">Live sessions</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium mb-1">Weekly Goal</p>
                  <p className="text-2xl lg:text-3xl font-bold mb-1">{Math.round(weeklyCompletionRate)}%</p>
                  <p className="text-orange-200 text-xs">Progress made</p>
                </div>
                <Target className="w-8 h-8 text-orange-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
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

        {/* Navigation Cards */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Explore Your Learning Path</h2>
            <p className="text-gray-600 text-lg">Discover all the tools and resources available to you</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="group cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-50"
              onClick={() => navigate('/course-content')}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Course Content</h3>
                <p className="text-sm text-gray-600 mb-4">Access lessons, videos, and materials</p>
                <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="text-sm font-medium">Start Learning</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-50"
              onClick={() => navigate('/progress')}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">My Progress</h3>
                <p className="text-sm text-gray-600 mb-4">Track your learning journey</p>
                <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  <span className="text-sm font-medium">View Progress</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-yellow-50"
              onClick={() => navigate('/leaderboard')}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Leaderboard</h3>
                <p className="text-sm text-gray-600 mb-4">See how you rank among peers</p>
                <div className="flex items-center justify-center text-yellow-600 group-hover:text-yellow-700 transition-colors">
                  <span className="text-sm font-medium">View Rankings</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-purple-50"
              onClick={() => navigate('/community')}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-sm text-gray-600 mb-4">Connect with fellow students</p>
                <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-700 transition-colors">
                  <span className="text-sm font-medium">Join Discussion</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
