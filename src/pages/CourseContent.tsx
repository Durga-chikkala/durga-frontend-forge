
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { AdvancedSearchFilter, FilterOptions } from '@/components/dashboard/AdvancedSearchFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, ExternalLink, Calendar, Play, CheckCircle, Clock, Award, Users } from 'lucide-react';
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchCourseContent();
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    filterContent();
  }, [courseContent, searchQuery, activeFilters]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    setIsAdmin(data?.role === 'admin');
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation isAdmin={isAdmin} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 text-lg">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = filteredContent.filter(content => 
    progress.completedSessions.includes(content.id)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation isAdmin={isAdmin} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Course Content 📚
              </h1>
              <p className="text-gray-600 text-lg mb-4">Master frontend development with our comprehensive curriculum</p>
              
              {/* Stats Bar */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{completedCount} Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{filteredContent.length - completedCount} Remaining</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Interactive Learning</span>
                </div>
              </div>
            </div>
            
            {/* Progress Overview Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 min-w-[280px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Your Progress</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {Math.round((completedCount / Math.max(filteredContent.length, 1)) * 100)}%
                </p>
                <p className="text-sm text-gray-600">
                  {completedCount} of {filteredContent.length} sessions completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <AdvancedSearchFilter
            onSearch={setSearchQuery}
            onFilter={setActiveFilters}
            searchQuery={searchQuery}
            activeFilters={activeFilters}
          />
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                {searchQuery || Object.values(activeFilters).some(v => v !== 'all') ? 'No matching content found' : 'No Content Available'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
                {searchQuery || Object.values(activeFilters).some(v => v !== 'all')
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                  : 'Course content will be published here as the bootcamp progresses. Check back soon for new materials!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {filteredContent.map((content) => {
              const isCompleted = progress.completedSessions.includes(content.id);
              
              return (
                <Card key={content.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                  <CardHeader className={`p-8 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'} text-white relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>
                    
                    <div className="relative flex justify-between items-start gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          {content.week_number && (
                            <Badge variant="secondary" className="bg-white/25 text-white border-white/40 font-medium px-3 py-1">
                              Week {content.week_number}
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge className="bg-white/25 text-white font-medium px-3 py-1 border border-white/40">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-2xl lg:text-3xl mb-4 leading-tight group-hover:text-blue-100 transition-colors">
                          {content.title}
                        </CardTitle>
                        
                        {content.description && (
                          <p className="text-blue-100 leading-relaxed text-lg opacity-90">
                            {content.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-white/25' : 'bg-white/20'} backdrop-blur-sm`}>
                          {isCompleted ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                          ) : (
                            <Play className="w-8 h-8 text-white ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      {/* Session Date */}
                      {content.session_date && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                          <div className="p-2 bg-amber-500 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-amber-800 mb-1">Session Date</h4>
                            <p className="text-amber-700 font-medium">
                              {new Date(content.session_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Topics */}
                      {content.topics.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            Topics Covered ({content.topics.length})
                          </h4>
                          <div className="grid gap-3">
                            {content.topics.map((topic, index) => (
                              <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>
                                <span className="text-gray-700 font-medium leading-relaxed">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      {content.gdrive_video_links.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Video className="w-5 h-5 text-purple-600" />
                            </div>
                            Session Videos ({content.gdrive_video_links.length})
                          </h4>
                          <div className="space-y-4">
                            {content.gdrive_video_links.map((link, index) => (
                              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                      <Video className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-gray-900">Session Video {index + 1}</h5>
                                      <p className="text-sm text-gray-600">Interactive learning content</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Video
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <Button
                                    asChild
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-2"
                                    >
                                      <Play className="w-4 h-4" />
                                      Watch Video
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                  
                                  {!isCompleted && (
                                    <Button
                                      onClick={() => handleVideoComplete(content.id)}
                                      variant="outline"
                                      className="flex-1 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                                    >
                                      <Award className="w-4 h-4 mr-2" />
                                      Mark Complete (+50 pts)
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preparation Materials */}
                      {content.preparation_materials && (
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            Preparation Materials
                          </h4>
                          <p className="text-blue-700 leading-relaxed">
                            {content.preparation_materials}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
