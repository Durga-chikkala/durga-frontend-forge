
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy } from 'lucide-react';

interface WeeklyProgressBarProps {
  progressStats: {
    currentWeek: number;
    totalWeeks: number;
    weeklyProgress: number;
    completedWeeks: number;
  };
}

export const WeeklyProgressBar = ({ progressStats }: WeeklyProgressBarProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-6 sm:mb-8">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Course Progress</h3>
              <p className="text-sm sm:text-base text-gray-600">Week {progressStats.currentWeek} of {progressStats.totalWeeks}</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg">
            {Math.round(progressStats.weeklyProgress)}%
          </Badge>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>Overall completion</span>
            <span>{progressStats.completedWeeks} / {progressStats.totalWeeks} weeks</span>
          </div>
          <div className="relative">
            <Progress value={progressStats.weeklyProgress} className="h-3 sm:h-4" />
            <div 
              className="absolute top-0 left-0 h-3 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressStats.weeklyProgress}%` }}
            />
          </div>
          
          {progressStats.weeklyProgress >= 100 && (
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mt-2 sm:mt-3">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Congratulations! Course completed! 🎉</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
