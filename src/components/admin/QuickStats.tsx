
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Calendar, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatsProps {
  stats: {
    materials: number;
    questions: number;
    sessions: number;
    users: number;
  };
}

export const QuickStats = ({ stats }: StatsProps) => {
  const [engagementStats, setEngagementStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalAchievements: 0
  });

  useEffect(() => {
    const fetchEngagementStats = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        // Get active users (users with recent activity)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeUsers } = await supabase
          .from('user_activities')
          .select('user_id', { count: 'exact' })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Get total posts
        const { count: totalPosts } = await supabase
          .from('discussion_posts')
          .select('id', { count: 'exact' });

        // Get total achievements earned
        const { count: totalAchievements } = await supabase
          .from('user_achievements')
          .select('id', { count: 'exact' });

        setEngagementStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalPosts: totalPosts || 0,
          totalAchievements: totalAchievements || 0
        });
      } catch (error) {
        console.error('Error fetching engagement stats:', error);
      }
    };

    fetchEngagementStats();
  }, []);

  const statItems = [
    {
      title: 'Study Materials',
      value: stats.materials,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Discussion Posts',
      value: engagementStats.totalPosts,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Scheduled Sessions',
      value: stats.sessions,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Active Users',
      value: engagementStats.activeUsers,
      total: engagementStats.totalUsers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${item.borderColor} border-l-4`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg ${item.bgColor} flex-shrink-0`}>
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{item.title}</p>
                <div className="flex items-center gap-1">
                  <p className={`text-xl sm:text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                  {item.total && (
                    <p className="text-sm text-gray-500">/ {item.total}</p>
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
