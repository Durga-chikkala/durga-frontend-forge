
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Calendar, MessageCircle, TrendingUp, Award } from 'lucide-react';
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
    totalAchievements: 0,
    growthRate: 0
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

        // Calculate growth rate (mock calculation)
        const growthRate = totalUsers && totalUsers > 0 ? Math.round(((activeUsers || 0) / totalUsers) * 100) : 0;

        setEngagementStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalPosts: totalPosts || 0,
          totalAchievements: totalAchievements || 0,
          growthRate
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
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Discussion Posts',
      value: engagementStats.totalPosts,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Active Sessions',
      value: stats.sessions,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Engagement Rate',
      value: engagementStats.growthRate,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Active Students',
      value: engagementStats.activeUsers,
      total: engagementStats.totalUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Achievements Earned',
      value: engagementStats.totalAchievements,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      change: '+22%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className={`${item.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${item.borderColor} border-l-4 overflow-hidden`}>
          <CardContent className="p-6 relative">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10">
              <item.icon className="w-20 h-20" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/60 backdrop-blur-sm`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                {item.change && (
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.change}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${item.color}`}>
                    {item.value}{item.suffix || ''}
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
