
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Activity, MessageSquare, Trophy, BookOpen, Users, Plus } from 'lucide-react';
import { useUserActivities } from '@/hooks/useUserActivities';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export const ActivityFeed = () => {
  const { activities, loading, createActivity } = useUserActivities();

  // Create some sample activities if none exist (for demo purposes)
  useEffect(() => {
    if (!loading && activities.length === 0) {
      // Add a welcome activity for new users
      createActivity('login', 'Welcome to the platform! Start your learning journey.', 10);
    }
  }, [loading, activities, createActivity]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'discussion_post':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'study_session':
        return <BookOpen className="w-4 h-4 text-green-600" />;
      case 'community':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'login':
        return <Activity className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'discussion_post':
        return 'bg-blue-100 text-blue-800';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      case 'study_session':
        return 'bg-green-100 text-green-800';
      case 'community':
        return 'bg-purple-100 text-purple-800';
      case 'login':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addSampleActivity = () => {
    const sampleActivities = [
      { type: 'study_session', description: 'Completed a study session', points: 25 },
      { type: 'discussion_post', description: 'Posted in discussion forum', points: 15 },
      { type: 'achievement', description: 'Earned "First Steps" badge', points: 50 },
      { type: 'community', description: 'Helped a fellow student', points: 20 }
    ];
    
    const randomActivity = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
    createActivity(randomActivity.type, randomActivity.description, randomActivity.points);
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded mb-1"></div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent Activity
            <Badge variant="secondary" className="ml-2">
              {activities.length}
            </Badge>
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={addSampleActivity}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No recent activity</p>
              <p className="text-sm text-gray-400">Your activities will appear here as you engage with the platform</p>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={addSampleActivity}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Sample Activity
              </Button>
            </div>
          ) : (
            activities.slice(0, 12).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors duration-200 bg-white"
              >
                <div className="p-2 rounded-full bg-gray-50">
                  {getActivityIcon(activity.activity_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs px-2 py-1 ${getActivityColor(activity.activity_type)}`}>
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                    {activity.points_earned && activity.points_earned > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{activity.points_earned} pts
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-1">
                    {activity.description}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > 12 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View all activity
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
