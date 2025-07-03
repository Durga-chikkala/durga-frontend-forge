
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export const ProgressTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    totalWeeks: 0,
    completedWeeks: 0,
    currentWeek: 1,
    progressPercentage: 0
  });

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      // Get total published course content to determine total weeks
      const { data: courseData } = await supabase
        .from('course_content')
        .select('week_number')
        .eq('is_published', true)
        .order('week_number', { ascending: false })
        .limit(1);

      const totalWeeks = courseData?.[0]?.week_number || 12; // Default to 12 weeks if no data

      // Get user's completed progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('week_number, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      const completedWeeks = userProgress?.length || 0;
      const completedWeekNumbers = userProgress?.map(p => p.week_number) || [];
      const maxCompletedWeek = completedWeekNumbers.length > 0 ? Math.max(...completedWeekNumbers) : 0;
      const currentWeek = Math.min(maxCompletedWeek + 1, totalWeeks);
      const progressPercentage = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

      setProgressData({
        totalWeeks,
        completedWeeks,
        currentWeek,
        progressPercentage
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const handleMarkComplete = async () => {
    if (!user || progressData.currentWeek > progressData.totalWeeks) return;

    try {
      // Check if progress already exists for this week
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', progressData.currentWeek)
        .single();

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_progress')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            total_points: (existingProgress.total_points || 0) + 100
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            week_number: progressData.currentWeek,
            is_completed: true,
            completed_at: new Date().toISOString(),
            total_points: 100,
            study_streak: progressData.completedWeeks + 1
          });

        if (error) throw error;
      }

      // Create a study session record
      const { error: sessionError } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id,
          completed: true,
          session_duration: 60
        });

      if (sessionError) throw sessionError;

      toast({
        title: 'Week Completed! 🎉',
        description: `Great job completing week ${progressData.currentWeek}! +100 points earned.`,
      });

      // Refresh data
      fetchProgressData();
      
    } catch (error) {
      console.error('Error marking week complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark week as complete. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-blue-200 rounded w-48"></div>
            <div className="h-4 bg-blue-200 rounded w-full"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-blue-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Course Progress</h3>
            <p className="text-gray-600">Track your learning journey to mastery</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-sm font-semibold text-gray-700 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              Week {progressData.currentWeek} of {progressData.totalWeeks}
            </div>
            {progressData.currentWeek <= progressData.totalWeeks && (
              <Button
                onClick={handleMarkComplete}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ✓ Complete Week {progressData.currentWeek}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Overall Progress</span>
            <span className="text-2xl font-bold text-gray-900">{Math.round(progressData.progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressData.progressPercentage} 
            className="h-4 bg-white/70 shadow-inner" 
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center space-y-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
            <div className="text-2xl font-bold text-gray-900">{progressData.completedWeeks}</div>
            <div className="text-sm text-gray-600 font-medium">Weeks Completed</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center space-y-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <Clock className="w-8 h-8 text-blue-500 mx-auto" />
            <div className="text-2xl font-bold text-gray-900">{progressData.currentWeek}</div>
            <div className="text-sm text-gray-600 font-medium">Current Week</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center space-y-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <Target className="w-8 h-8 text-purple-500 mx-auto" />
            <div className="text-2xl font-bold text-gray-900">{progressData.totalWeeks - progressData.completedWeeks}</div>
            <div className="text-sm text-gray-600 font-medium">Weeks Remaining</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center space-y-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(progressData.progressPercentage)}%</div>
            <div className="text-sm text-gray-600 font-medium">Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
