
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { AdvancedSearchFilter, FilterOptions } from '@/components/dashboard/AdvancedSearchFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface CourseContent {
  id: string;
  title: string;
  description: string | null;
  topics: string[];
  preparation_materials: string | null;
  gdrive_video_links: string[];
  week_number: number | null;
  session_date: string | null;
}

const CourseContent = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, markSessionComplete } = useCourseProgress();
  
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    category: 'all',
    difficulty: 'all',
    duration: 'all',
    status: 'all',
    week: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchCourseContent();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    filterContent();
  }, [courseContent, searchQuery, activeFilters]);

  const fetchCourseContent = async () => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('is_published', true)
        .order('week_number', { ascending: true });

      if (error) throw error;

      const transformedContent = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        topics: Array.isArray(item.topics) ? item.topics.filter((topic): topic is string => typeof topic === 'string') : [],
        preparation_materials: item.preparation_materials,
        gdrive_video_links: Array.isArray(item.gdrive_video_links) ? item.gdrive_video_links.filter((link): link is string => typeof link === 'string') : [],
        week_number: item.week_number,
        session_date: item.session_date,
      })) || [];

      setCourseContent(transformedContent);
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = courseContent;

    if (searchQuery) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (activeFilters.week !== 'all') {
      const weekNumber = parseInt(activeFilters.week.replace('week', ''));
      filtered = filtered.filter(content => content.week_number === weekNumber);
    }

    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(content => {
        const isCompleted = progress.completedSessions.includes(content.id);
        switch (activeFilters.status) {
          case 'completed':
            return isCompleted;
          case 'not-started':
            return !isCompleted;
          default:
            return true;
        }
      });
    }

    setFilteredContent(filtered);
  };

  const handleVideoComplete = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error: sessionError } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id,
          content_id: sessionId,
          completed: true,
          session_duration: 60
        });

      if (sessionError) throw sessionError;

      const { data: contentData } = await supabase
        .from('course_content')
        .select('week_number')
        .eq('id', sessionId)
        .single();

      const weekNumber = contentData?.week_number || 1;

      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', weekNumber)
        .single();

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            total_points: (existingProgress.total_points || 0) + 50,
            study_streak: Math.max((existingProgress.study_streak || 0), 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            week_number: weekNumber,
            total_points: 50,
            study_streak: 1
          });
      }

      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'session_complete',
          description: `Completed session: ${courseContent.find(c => c.id === sessionId)?.title}`,
          points_earned: 50
        });

      markSessionComplete(sessionId);
      
      toast({
        title: 'Session Completed! 🎉',
        description: 'Great job! +50 points earned for completing this session.',
      });

    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark session as complete. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Course Content 📚
          </h1>
          <p className="text-gray-600 text-lg">Access your learning materials and track progress</p>
        </div>

        <div className="mb-8">
          <AdvancedSearchFilter
            onSearch={setSearchQuery}
            onFilter={setActiveFilters}
            searchQuery={searchQuery}
            activeFilters={activeFilters}
          />
        </div>

        {filteredContent.length === 0 ? (
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-gray-50 to-white backdrop-blur-sm">
            <CardContent className="p-20 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-700 mb-6">
                {searchQuery || Object.values(activeFilters).some(v => v !== 'all') ? 'No matching content found' : 'No Content Available'}
              </h3>
              <p className="text-gray-500 max-w-lg mx-auto text-xl leading-relaxed">
                {searchQuery || Object.values(activeFilters).some(v => v !== 'all')
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                  : 'Course content will be published here as the bootcamp progresses. Check back soon for new materials!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredContent.map((content) => (
              <Card key={content.id} className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:scale-[1.03] overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8">
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-2xl mb-4 break-words leading-tight group-hover:text-blue-100 transition-colors">
                        {content.title}
                      </CardTitle>
                      {content.description && (
                        <p className="text-blue-100 leading-relaxed text-lg">
                          {content.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      {content.week_number && (
                        <Badge variant="secondary" className="bg-white/25 text-white border-white/40 font-medium text-sm px-4 py-2">
                          Week {content.week_number}
                        </Badge>
                      )}
                      {progress.completedSessions.includes(content.id) && (
                        <Badge className="bg-green-500 text-white font-medium text-sm px-4 py-2 shadow-lg">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {content.topics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                          Topics Covered
                        </h4>
                        <div className="space-y-4">
                          {content.topics.map((topic, index) => (
                            <div key={index} className="flex items-start gap-4 text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                              <span className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="break-words leading-relaxed font-medium">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-8">
                      {content.session_date && (
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-3 text-lg">
                            <Calendar className="w-6 h-6" />
                            Session Date
                          </h4>
                          <p className="text-amber-700 font-medium text-lg">
                            {new Date(content.session_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}

                      {content.gdrive_video_links.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                            <Video className="w-6 h-6 text-purple-600" />
                            Session Videos ({content.gdrive_video_links.length})
                          </h4>
                          <div className="space-y-4">
                            {content.gdrive_video_links.map((link, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 text-blue-600 hover:text-blue-800 font-medium p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                  <Video className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                  <span className="flex-1 text-lg">Session Video {index + 1}</span>
                                  <ExternalLink className="w-5 h-5 flex-shrink-0" />
                                </a>
                                {!progress.completedSessions.includes(content.id) && (
                                  <Button
                                    onClick={() => handleVideoComplete(content.id)}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    Mark Session Complete (+50 Points) ⭐
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {content.preparation_materials && (
                      <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-3 text-lg">
                          📚 Preparation Materials
                        </h4>
                        <p className="text-blue-700 leading-relaxed text-base">
                          {content.preparation_materials}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
