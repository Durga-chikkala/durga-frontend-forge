
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Lock, Play, Clock } from 'lucide-react';
import { useLearningPath } from '@/hooks/useLearningPath';

export const LearningPath = () => {
  const { pathItems, loading } = useLearningPath();

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
      case 'completed': return 'bg-green-50 border-green-200 text-green-800';
      case 'current': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'locked': return 'bg-gray-50 border-gray-200 text-gray-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Learning Path</CardTitle>
          <p className="text-sm text-gray-600">Your personalized journey to frontend mastery</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="p-4 rounded-xl border bg-gray-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
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
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Learning Path</CardTitle>
        <p className="text-sm text-gray-600">Your personalized journey to frontend mastery</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pathItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-3 py-1 font-medium bg-white/80"
                    >
                      Week {item.week}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Est. {item.estimatedTime}</span>
                    </div>
                    {item.status === 'current' && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium"
                      >
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
