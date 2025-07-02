
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, BookOpen, MessageCircle, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivity {
  id: string;
  user_name: string;
  description: string;
  created_at: string;
  activity_type: string;
}

export const AnalyticsDashboard = () => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [metrics, setMetrics] = useState([
    {
      title: 'Active Students',
      value: '0',
      change: '+0%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Session Completion',
      value: '0%',
      change: '+0%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Forum Engagement',
      value: '0',
      change: '+0%',
      trend: 'up' as const,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Points Earned',
      value: '0',
      change: '+0%',
      trend: 'up' as const,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get recent activities with user names
        const { data: activities } = await supabase
          .from('user_activities')
          .select(`
            id,
            description,
            created_at,
            activity_type,
            profiles!user_activities_user_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Get active students count (users with activity in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeStudents } = await supabase
          .from('user_activities')
          .select('user_id', { count: 'exact' })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Get total completed sessions
        const { count: completedSessions } = await supabase
          .from('user_study_sessions')
          .select('id', { count: 'exact' })
          .eq('completed', true);

        // Get total sessions
        const { count: totalSessions } = await supabase
          .from('user_study_sessions')
          .select('id', { count: 'exact' });

        // Get forum posts count
        const { count: forumPosts } = await supabase
          .from('discussion_posts')
          .select('id', { count: 'exact' });

        // Get total points earned
        const { data: pointsData } = await supabase
          .from('user_progress')
          .select('total_points');

        const totalPoints = pointsData?.reduce((sum, user) => sum + (user.total_points || 0), 0) || 0;
        const completionRate = totalSessions ? Math.round((completedSessions || 0) / totalSessions * 100) : 0;

        const processedActivities: RecentActivity[] = activities?.map(activity => ({
          id: activity.id,
          user_name: activity.profiles?.full_name || 'Unknown User',
          description: activity.description,
          created_at: activity.created_at,
          activity_type: activity.activity_type
        })) || [];

        setRecentActivity(processedActivities);
        
        setMetrics([
          {
            title: 'Active Students',
            value: (activeStudents || 0).toString(),
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Session Completion',
            value: `${completionRate}%`,
            change: '+5%',
            trend: 'up',
            icon: BookOpen,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Forum Engagement',
            value: (forumPosts || 0).toString(),
            change: '+8%',
            trend: 'up',
            icon: MessageCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          {
            title: 'Total Points Earned',
            value: totalPoints.toString(),
            change: '+15%',
            trend: 'up',
            icon: Calendar,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          }
        ]);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    metric.trend === 'up' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {metric.change}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Student Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Student activities will appear here as they engage with the platform.</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{activity.user_name}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Analytics visualization coming soon</p>
              <p className="text-sm text-gray-400">Detailed charts and trends will be available here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
