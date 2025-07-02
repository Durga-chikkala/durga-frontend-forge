
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Lock, Play } from 'lucide-react';

interface PathItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  week: number;
  estimatedTime: string;
}

export const LearningPath = () => {
  const pathItems: PathItem[] = [
    {
      id: '1',
      title: 'HTML & CSS Fundamentals',
      description: 'Master the building blocks of web development',
      status: 'completed',
      week: 1,
      estimatedTime: '8 hours'
    },
    {
      id: '2',
      title: 'JavaScript Essentials',
      description: 'Learn core JavaScript concepts and ES6+ features',
      status: 'completed',
      week: 2,
      estimatedTime: '12 hours'
    },
    {
      id: '3',
      title: 'React Fundamentals',
      description: 'Build interactive UIs with React components',
      status: 'current',
      week: 3,
      estimatedTime: '15 hours'
    },
    {
      id: '4',
      title: 'State Management',
      description: 'Master React hooks and state management patterns',
      status: 'locked',
      week: 4,
      estimatedTime: '10 hours'
    },
    {
      id: '5',
      title: 'API Integration',
      description: 'Connect your app to external APIs and databases',
      status: 'locked',
      week: 5,
      estimatedTime: '12 hours'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current': return <Play className="w-5 h-5 text-blue-600" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-400" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'locked': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Learning Path</CardTitle>
        <p className="text-sm text-gray-600">Your personalized journey to frontend mastery</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pathItems.map((item, index) => (
            <div key={item.id} className={`p-4 rounded-lg border transition-all ${
              item.status === 'current' 
                ? 'border-blue-200 bg-blue-50/50' 
                : item.status === 'completed'
                ? 'border-green-200 bg-green-50/50'
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <Badge className={`text-xs px-2 py-1 ${getStatusColor(item.status)}`}>
                      Week {item.week}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Est. {item.estimatedTime}
                    </span>
                    {item.status === 'current' && (
                      <Button size="sm" className="text-xs">
                        Continue Learning
                      </Button>
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
