
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

export const StatsCard = () => {
  const { stats, loading } = useUserStats();

  const statItems = [
    {
      title: 'Sessions Completed',
      value: loading ? '...' : stats.sessionsCompleted.toString(),
      total: loading ? '...' : stats.totalSessions.toString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Study Streak',
      value: loading ? '...' : stats.studyStreak.toString(),
      unit: 'days',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Achievements',
      value: loading ? '...' : stats.achievementsEarned.toString(),
      unit: 'earned',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Forum Posts',
      value: loading ? '...' : stats.forumPosts.toString(),
      unit: 'posts',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  {stat.total && (
                    <p className="text-xs text-gray-500">/{stat.total}</p>
                  )}
                  {stat.unit && (
                    <p className="text-xs text-gray-500">{stat.unit}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
