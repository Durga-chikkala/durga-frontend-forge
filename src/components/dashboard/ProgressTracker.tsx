
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProgressTrackerProps {
  totalWeeks: number;
  completedWeeks: number;
  currentWeek: number;
}

export const ProgressTracker = ({
  totalWeeks,
  completedWeeks,
  currentWeek,
}: ProgressTrackerProps) => {
  const { markWeekComplete } = useCourseProgress();
  const { user } = useAuth();
  const { toast } = useToast();
  const progressPercentage = (completedWeeks / totalWeeks) * 100;

  const handleMarkComplete = async () => {
    if (!user || currentWeek > totalWeeks) return;

    try {
      // Create or update user progress
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', currentWeek)
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
            week_number: currentWeek,
            is_completed: true,
            completed_at: new Date().toISOString(),
            total_points: 100,
            study_streak: completedWeeks + 1
          });

        if (error) throw error;
      }

      // Also create a study session record
      const { error: sessionError } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id,
          completed: true,
          session_duration: 60
        });

      if (sessionError) throw sessionError;

      markWeekComplete(currentWeek);
      
      toast({
        title: 'Week Completed! 🎉',
        description: `Great job completing week ${currentWeek}! +100 points earned.`,
      });

      // Refresh the page after a short delay to show updated progress
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error marking week complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark week as complete. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">Course Progress</h3>
            <p className="text-sm text-gray-600">Track your learning journey</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-sm font-medium text-gray-700 bg-white/70 px-3 py-1.5 rounded-full">
              Week {currentWeek} of {totalWeeks}
            </div>
            {currentWeek <= totalWeeks && (
              <Button
                onClick={handleMarkComplete}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium shadow-sm"
              >
                Mark Week {currentWeek} Complete
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-white/70" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-4 text-center space-y-2">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
            <div className="text-lg font-bold text-gray-900">{completedWeeks}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>

          <div className="bg-white/70 rounded-lg p-4 text-center space-y-2">
            <Clock className="w-6 h-6 text-blue-500 mx-auto" />
            <div className="text-lg font-bold text-gray-900">{currentWeek}</div>
            <div className="text-xs text-gray-600">Current Week</div>
          </div>

          <div className="bg-white/70 rounded-lg p-4 text-center space-y-2">
            <Target className="w-6 h-6 text-purple-500 mx-auto" />
            <div className="text-lg font-bold text-gray-900">{totalWeeks - completedWeeks}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>

          <div className="bg-white/70 rounded-lg p-4 text-center space-y-2">
            <TrendingUp className="w-6 h-6 text-orange-500 mx-auto" />
            <div className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
