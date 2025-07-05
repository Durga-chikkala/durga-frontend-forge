
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Zap, Trophy, Users } from 'lucide-react';

interface ProgressHeaderProps {
  progressStats: {
    completedWeeks: number;
    totalPoints: number;
    rank: number;
    totalUsers: number;
  };
}

export const ProgressHeader = ({ progressStats }: ProgressHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Your Learning Progress 📈
        </h1>
        <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
          Track your journey, celebrate milestones, and stay motivated on your path to frontend mastery
        </p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{progressStats.completedWeeks}</p>
            <p className="text-blue-100 text-xs sm:text-sm">Weeks Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{progressStats.totalPoints}</p>
            <p className="text-emerald-100 text-xs sm:text-sm">Points Earned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">#{progressStats.rank || 'N/A'}</p>
            <p className="text-purple-100 text-xs sm:text-sm">Your Rank</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{progressStats.totalUsers}</p>
            <p className="text-yellow-100 text-xs sm:text-sm">Students</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
