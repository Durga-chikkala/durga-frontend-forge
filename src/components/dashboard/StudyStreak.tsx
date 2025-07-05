
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, Target } from 'lucide-react';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const StudyStreak = () => {
  const { streakData, loading, refetch } = useStudyStreak();
  const { user } = useAuth();
  const { toast } = useToast();

  const markDayComplete = async () => {
    if (!user) return;

    try {
      // Create a study session for today
      const { error } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id,
          completed: true,
          session_duration: 30 // Default 30 minutes
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Study session recorded! Keep up the streak!',
      });

      // Refresh the streak data
      refetch();
    } catch (error) {
      console.error('Error marking day complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to record study session',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-200 rounded-full mx-auto mb-2"></div>
              <div className="h-3 sm:h-4 bg-orange-200 rounded w-24 sm:w-32 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayIndex = streakData.weekData.length - 1;
  const hasStudiedToday = streakData.weekData[todayIndex]?.studied || false;

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          Study Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 sm:space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
            {streakData.currentStreak}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">Days Current Streak</p>
          <Badge variant="outline" className="mt-2 bg-orange-100 text-orange-800 border-orange-300 text-xs sm:text-sm">
            {streakData.currentStreak > 0 ? '🔥 On Fire!' : '💪 Start Your Streak!'}
          </Badge>
        </div>

        {/* Week View */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            This Week
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {streakData.weekData.map((day, index) => (
              <div key={index} className="text-center">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                  day.studied 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {day.studied ? '✓' : '○'}
                </div>
                <span className="text-xs text-gray-600">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mark Today Complete Button */}
        {!hasStudiedToday && (
          <div className="text-center">
            <Button
              onClick={markDayComplete}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
              size="sm"
            >
              Mark Today Complete
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 sm:pt-4 border-t border-orange-200">
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-gray-900">{streakData.longestStreak}</div>
            <p className="text-xs text-gray-600">Longest Streak</p>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-gray-900">{streakData.weeklyGoalProgress}%</div>
            <p className="text-xs text-gray-600">Weekly Goal</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
