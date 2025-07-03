
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useUserStats } from '@/hooks/useUserStats';

export const AdvancedProgressTracker = () => {
  const { progress, loading } = useCourseProgress();
  const { stats, loading: statsLoading } = useUserStats();

  if (loading || statsLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-gray-300 rounded"></div>
              <div className="h-16 bg-gray-300 rounded"></div>
              <div className="h-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = progress.totalWeeks > 0 ? (progress.completedWeeks / progress.totalWeeks) * 100 : 0;
  const weeklyProgress = progress.currentWeek > 0 ? ((progress.currentWeek - 1) / progress.totalWeeks) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Advanced Learning Progress
          </div>
          <Badge className="bg-blue-600 text-white">
            Week {progress.currentWeek} of {progress.totalWeeks}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Completion</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-3 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </Progress>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
            <span className="text-sm font-bold text-purple-600">{Math.round(weeklyProgress)}%</span>
          </div>
          <Progress value={weeklyProgress} className="h-3 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${weeklyProgress}%` }}
            />
          </Progress>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{progress.completedSessions.length}</div>
            <div className="text-xs text-gray-600">Sessions Done</div>
          </div>
          
          <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_points || 0}</div>
            <div className="text-xs text-gray-600">Total Points</div>
          </div>
          
          <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.study_streak || 0}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Clock className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
          <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
            <CheckCircle className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
