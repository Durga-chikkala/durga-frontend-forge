
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Award, TrendingUp } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

export const StatsCard = () => {
  const { stats, loading } = useUserStats();

  const statItems = [
    {
      title: 'Sessions',
      value: loading ? '...' : stats.sessionsCompleted.toString(),
      total: loading ? '...' : stats.totalSessions.toString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Streak',
      value: loading ? '...' : stats.studyStreak.toString(),
      unit: 'days',
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Points',
      value: loading ? '...' : stats.totalPoints.toString(),
      unit: 'earned',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Achievements',
      value: loading ? '...' : stats.achievementsEarned.toString(),
      unit: 'unlocked',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          Your Stats
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          {statItems.map((stat, index) => (
            <div key={index} className={`p-3 sm:p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} transition-all duration-200 hover:scale-105`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 rounded-lg bg-white/70 backdrop-blur-sm`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                    {stat.total && (
                      <p className="text-xs sm:text-sm text-gray-500">/{stat.total}</p>
                    )}
                    {stat.unit && (
                      <p className="text-xs sm:text-sm text-gray-500">{stat.unit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
