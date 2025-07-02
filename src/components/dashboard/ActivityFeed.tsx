
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageCircle, Award, Calendar } from 'lucide-react';

interface Activity {
  id: string;
  type: 'session' | 'post' | 'achievement' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export const ActivityFeed = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'session',
      title: 'Completed React Hooks Session',
      description: 'Finished Week 3 materials',
      timestamp: '2 hours ago',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Early Bird Badge',
      description: 'Joined 5 sessions on time',
      timestamp: '1 day ago',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      id: '3',
      type: 'post',
      title: 'Posted in Discussion',
      description: 'Asked about React optimization',
      timestamp: '2 days ago',
      icon: MessageCircle,
      color: 'text-green-600'
    },
    {
      id: '4',
      type: 'milestone',
      title: 'Reached 50% Progress',
      description: 'Halfway through the bootcamp!',
      timestamp: '3 days ago',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-800';
      case 'achievement': return 'bg-purple-100 text-purple-800';
      case 'post': return 'bg-green-100 text-green-800';
      case 'milestone': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="flex-shrink-0">
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
