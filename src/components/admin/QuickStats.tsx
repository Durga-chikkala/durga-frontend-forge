
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
    engagementRate: 0
  });

  useEffect(() => {
    const fetchEngagementStats = async () => {
      try {
        console.log('Fetching engagement stats...');

        // Get active users (users with recent activity in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: recentActivities } = await supabase
          .from('user_activities')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const activeUsers = new Set(recentActivities?.map(a => a.user_id) || []).size;

        // Get total posts
        const { count: totalPosts } = await supabase
          .from('discussion_posts')
          .select('id', { count: 'exact' });

        // Get total achievements earned
        const { count: totalAchievements } = await supabase
          .from('user_achievements')
          .select('id', { count: 'exact' });

        // Calculate engagement rate (active users / total users)
        const engagementRate = stats.users > 0 ? Math.round((activeUsers / stats.users) * 100) : 0;

        console.log('Engagement stats:', {
          totalUsers: stats.users,
          activeUsers,
          totalPosts: totalPosts || 0,
          totalAchievements: totalAchievements || 0,
          engagementRate
        });

        setEngagementStats({
          totalUsers: stats.users,
          activeUsers,
          totalPosts: totalPosts || 0,
          totalAchievements: totalAchievements || 0,
          engagementRate
        });
      } catch (error) {
        console.error('Error fetching engagement stats:', error);
      }
    };

    if (stats.users > 0) {
      fetchEngagementStats();
    }
  }, [stats]);

  const statItems = [
    {
      title: 'Study Materials',
      value: stats.materials,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      description: 'Published materials'
    },
    {
      title: 'Discussion Posts',
      value: engagementStats.totalPosts,
      icon: MessageCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      description: 'Community discussions'
    },
    {
      title: 'Active Sessions',
      value: stats.sessions,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      description: 'Scheduled sessions'
    },
    {
      title: 'Engagement Rate',
      value: engagementStats.engagementRate,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      description: '30-day active users'
    },
    {
      title: 'Total Students',
      value: engagementStats.totalUsers,
      activeValue: engagementStats.activeUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200',
      description: `${engagementStats.activeUsers} active this month`
    },
    {
      title: 'Achievements',
      value: engagementStats.totalAchievements,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      description: 'Total earned'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className={`${item.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group`}>
          <CardContent className="p-6 relative">
            {/* Background Icon */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <item.icon className="w-16 h-16" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${item.color}`}>
                    {item.value}{item.suffix || ''}
                  </p>
                  {item.activeValue && (
                    <p className="text-sm text-gray-600">
                      ({item.activeValue} active)
                    </p>
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
