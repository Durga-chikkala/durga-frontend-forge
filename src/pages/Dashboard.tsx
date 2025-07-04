
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInitializeUserData } from '@/hooks/useInitializeUserData';
import { Navigation } from '@/components/Navigation';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { AchievementsPanel } from '@/components/dashboard/AchievementsPanel';
import { DiscussionForum } from '@/components/dashboard/DiscussionForum';
import { ProgressTracker } from '@/components/dashboard/ProgressTracker';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LearningPath } from '@/components/dashboard/LearningPath';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { StudyStreak } from '@/components/dashboard/StudyStreak';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { RealTimeNotifications } from '@/components/dashboard/RealTimeNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  
  // Initialize user data for new users
  useInitializeUserData();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Navigation />
      <RealTimeNotifications />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to continue your learning journey?
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">Day</div>
                  <div className="text-sm opacity-90">Current</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <UserProfileCard profile={profile} />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <StatsCard />
            <ProgressTracker />
            <LearningPath />
            <DiscussionForum />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <StudyStreak />
            <Leaderboard />
            <AchievementsPanel />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
