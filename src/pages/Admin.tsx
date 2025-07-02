import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, MessageCircle, Users, Plus, ArrowLeft, Menu, X } from 'lucide-react';
import { StudyMaterialsAdmin } from '@/components/admin/StudyMaterialsAdmin';
import { QuestionsAdmin } from '@/components/admin/QuestionsAdmin';
import { SessionsAdmin } from '@/components/admin/SessionsAdmin';
import { UsersAdmin } from '@/components/admin/UsersAdmin';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { QuickStats } from '@/components/admin/QuickStats';
import { EngagementAnalytics } from '@/components/admin/EngagementAnalytics';
import { StudentEngagement } from '@/components/admin/StudentEngagement';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    materials: 0,
    questions: 0,
    sessions: 0,
    users: 0
  });
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      checkAdminRole();
      fetchStats();
    }
  }, [user, navigate, authLoading]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin role:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify admin access',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      if (!data || data.role !== 'admin') {
        toast({
          title: 'Access Denied',
          description: 'You need admin privileges to access this page',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [materialsRes, questionsRes, sessionsRes, usersRes] = await Promise.all([
        supabase.from('study_materials').select('id', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' }),
        supabase.from('scheduled_sessions').select('id', { count: 'exact' }),
        supabase.from('user_roles').select('id', { count: 'exact' })
      ]);

      setStats({
        materials: materialsRes.count || 0,
        questions: questionsRes.count || 0,
        sessions: sessionsRes.count || 0,
        users: usersRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Show loading while auth is loading or admin check is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-1.5 sm:p-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              Admin Panel
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-8 max-w-7xl">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage your course content and student engagement</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <QuickStats stats={stats} />

        {/* Enhanced Admin Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <Tabs defaultValue="analytics" className="w-full">
              {/* Ultra Responsive Mobile Tab Navigation */}
              <div className="lg:hidden mb-3 sm:mb-4">
                <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 bg-gray-100 mb-2">
                  <TabsTrigger 
                    value="analytics" 
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-md"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="engagement" 
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-md"
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Students</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 bg-gray-100 mb-2">
                  <TabsTrigger 
                    value="materials" 
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Materials</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="questions" 
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-md"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Q&A</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 bg-gray-100">
                  <TabsTrigger 
                    value="sessions" 
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-md"
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Sessions</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Users</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Desktop Tab Navigation */}
              <div className="hidden lg:block">
                <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1">
                  <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white">
                    <BookOpen className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="engagement" className="flex items-center gap-2 data-[state=active]:bg-white">
                    <Users className="w-4 h-4" />
                    Student Engagement
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="flex items-center gap-2 data-[state=active]:bg-white">
                    <BookOpen className="w-4 h-4" />
                    Materials
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-2 data-[state=active]:bg-white">
                    <MessageCircle className="w-4 h-4" />
                    Questions
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="flex items-center gap-2 data-[state=active]:bg-white">
                    <Calendar className="w-4 h-4" />
                    Sessions
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-white">
                    <Users className="w-4 h-4" />
                    Users
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="analytics" className="mt-4 sm:mt-6">
                <div className="space-y-6">
                  <AnalyticsDashboard />
                  <EngagementAnalytics />
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="mt-4 sm:mt-6">
                <StudentEngagement />
              </TabsContent>

              <TabsContent value="materials" className="mt-4 sm:mt-6">
                <StudyMaterialsAdmin onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="questions" className="mt-4 sm:mt-6">
                <QuestionsAdmin onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="sessions" className="mt-4 sm:mt-6">
                <SessionsAdmin onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="users" className="mt-4 sm:mt-6">
                <UsersAdmin onStatsUpdate={fetchStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
