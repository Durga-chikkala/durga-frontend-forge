
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { AdvancedProgressTracker } from '@/components/dashboard/AdvancedProgressTracker';
import { StudyStreak } from '@/components/dashboard/StudyStreak';
import { LearningPath } from '@/components/dashboard/LearningPath';
import { AchievementsPanel } from '@/components/dashboard/AchievementsPanel';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProgressHeader } from '@/components/progress/ProgressHeader';
import { WeeklyProgressBar } from '@/components/progress/WeeklyProgressBar';
import { useProgressStats } from '@/hooks/useProgressStats';
import { supabase } from '@/integrations/supabase/client';

const ProgressPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { progressStats, loading: loadingStats } = useProgressStats();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      checkAdminRole();
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
        <ProgressHeader progressStats={progressStats} />

        {/* Weekly Progress Bar */}
        <WeeklyProgressBar progressStats={progressStats} />

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
