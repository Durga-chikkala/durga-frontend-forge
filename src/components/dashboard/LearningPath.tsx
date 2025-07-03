
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Lock, Play, Clock, BookOpen } from 'lucide-react';
import { useLearningPath } from '@/hooks/useLearningPath';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const LearningPath = () => {
  const { pathItems, loading, refetch } = useLearningPath();
  const { user } = useAuth();
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current': return <Play className="w-6 h-6 text-blue-600" />;
      case 'locked': return <Lock className="w-6 h-6 text-gray-400" />;
      default: return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800';
      case 'current': return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800';
      case 'locked': return 'bg-gray-50 border-gray-200 text-gray-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const handleStartLearning = async (weekNumber: number) => {
    if (!user) return;

    try {
      // Create a study session for this week
      const { error } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id,
          completed: false,
          session_duration: 0
        });

      if (error) throw error;

      toast({
        title: 'Learning Session Started! 📚',
        description: `You've started learning Week ${weekNumber}. Good luck!`,
      });

      refetch();
    } catch (error) {
      console.error('Error starting learning session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start learning session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
              <p className="text-gray-600 mt-1">Your personalized journey to frontend mastery</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="p-6 rounded-xl border bg-gray-50 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <div className="h-5 bg-gray-300 rounded w-48"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
            <p className="text-gray-600 mt-1">Your personalized journey to frontend mastery</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {pathItems.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Learning Content Available</h3>
              <p className="text-gray-500">Course content will appear here once it's published</p>
            </div>
          ) : (
            pathItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor(item.status)} ${
                  item.status === 'current' ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-3 py-1 font-semibold bg-white/90 shadow-sm"
                      >
                        Week {item.week}
                      </Badge>
                      {item.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed text-base">{item.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Est. {item.estimatedTime}</span>
                      </div>
                      {item.status === 'current' && (
                        <Button 
                          onClick={() => handleStartLearning(item.week)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </Button>
                      )}
                      {item.status === 'locked' && (
                        <Badge variant="outline" className="text-gray-500 bg-gray-100">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
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
