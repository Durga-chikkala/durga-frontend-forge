
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Target, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useUserStats } from '@/hooks/useUserStats';

export const AdvancedProgressTracker = () => {
  const { progress, loading } = useCourseProgress();
  const { stats, loading: statsLoading } = useUserStats();

  if (loading || statsLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = progress.totalWeeks > 0 ? (progress.completedWeeks / progress.totalWeeks) * 100 : 0;
  const weeklyProgress = progress.currentWeek > 0 ? ((progress.currentWeek - 1) / progress.totalWeeks) * 100 : 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Learning Progress</h3>
              <p className="text-sm text-gray-600">Track your journey through the course</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1">
            Week {progress.currentWeek} of {progress.totalWeeks}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-semibold text-gray-700">Overall Completion</span>
              <p className="text-xs text-gray-500">Your progress through the entire course</p>
            </div>
            <span className="text-lg font-bold text-blue-600">{Math.round(completionRate)}%</span>
          </div>
          <div className="relative">
            <Progress value={completionRate} className="h-4 bg-gray-100" />
            <div 
              className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-semibold text-gray-700">Current Week Progress</span>
              <p className="text-xs text-gray-500">How far you are in the current week</p>
            </div>
            <span className="text-lg font-bold text-purple-600">{Math.round(weeklyProgress)}%</span>
          </div>
          <div className="relative">
            <Progress value={weeklyProgress} className="h-4 bg-gray-100" />
            <div 
              className="absolute top-0 left-0 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{progress.completedSessions.length}</div>
            <div className="text-xs font-medium text-blue-700">Sessions Completed</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.totalPoints || 0}</div>
            <div className="text-xs font-medium text-yellow-700">Points Earned</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.studyStreak || 0}</div>
            <div className="text-xs font-medium text-emerald-700">Day Streak</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Clock className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
          <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
            <CheckCircle className="w-4 h-4 mr-2" />
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
