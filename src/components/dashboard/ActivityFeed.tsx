
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, MessageSquare, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useUserActivities } from '@/hooks/useUserActivities';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed = () => {
  const { activities, loading } = useUserActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'discussion_post':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'study_session':
        return <BookOpen className="w-4 h-4 text-green-600" />;
      case 'community':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'login':
        return <TrendingUp className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      case 'discussion_post':
        return 'bg-blue-100 text-blue-800';
      case 'study_session':
        return 'bg-green-100 text-green-800';
      case 'community':
        return 'bg-purple-100 text-purple-800';
      case 'login':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          Recent Activity
          <Badge variant="secondary" className="ml-2">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Start engaging to see your activity here!</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-green-200 transition-colors bg-white"
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-gray-50">
                  {getActivityIcon(activity.activity_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs px-2 py-1 ${getActivityColor(activity.activity_type)}`}>
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                    {activity.points_earned > 0 && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        +{activity.points_earned} pts
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
