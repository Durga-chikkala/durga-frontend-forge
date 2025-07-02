
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageCircle, Award, Calendar } from 'lucide-react';
import { useUserActivities } from '@/hooks/useUserActivities';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed = () => {
  const { activities, loading } = useUserActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_complete': return BookOpen;
      case 'post_created': return MessageCircle;
      case 'achievement_earned': return Award;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session_complete': return 'text-blue-600';
      case 'post_created': return 'text-green-600';
      case 'achievement_earned': return 'text-purple-600';
      default: return 'text-orange-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'session_complete': return 'bg-blue-100 text-blue-800';
      case 'post_created': return 'bg-green-100 text-green-800';
      case 'achievement_earned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Complete sessions and engage in discussions to see activity here!</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 ${getActivityColor(activity.activity_type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getTypeColor(activity.activity_type)}`}>
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                      {activity.points_earned > 0 && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                          +{activity.points_earned} pts
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
