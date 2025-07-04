
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInitializeUserData } from '@/hooks/useInitializeUserData';
import { Navigation } from '@/components/Navigation';
import { QuickStats } from '@/components/admin/QuickStats';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { StudyMaterialsAdmin } from '@/components/admin/StudyMaterialsAdmin';
import { QuestionsAdmin } from '@/components/admin/QuestionsAdmin';
import { SessionsAdmin } from '@/components/admin/SessionsAdmin';
import { UsersAdmin } from '@/components/admin/UsersAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    questions: 0,
    sessions: 0
  });
  
  // Initialize user data
  useInitializeUserData();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      
      // Get real counts from database
      const [usersResult, materialsResult, questionsResult, sessionsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('study_materials').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('scheduled_sessions').select('*', { count: 'exact', head: true })
      ]);

      console.log('Raw counts:', {
        users: usersResult.count,
        materials: materialsResult.count,
        questions: questionsResult.count,
        sessions: sessionsResult.count
      });

      setStats({
        users: usersResult.count || 0,
        materials: materialsResult.count || 0,
        questions: questionsResult.count || 0,
        sessions: sessionsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set to 0 if there's an error instead of keeping old values
      setStats({
        users: 0,
        materials: 0,
        questions: 0,
        sessions: 0
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
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
            Admin Dashboard 🛠️
          </h1>
          <p className="text-gray-600 text-lg">Manage your learning platform</p>
        </div>

        <QuickStats stats={stats} />

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="materials">
            <StudyMaterialsAdmin onStatsUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionsAdmin onStatsUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsAdmin onStatsUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="users">
            <UsersAdmin onStatsUpdate={fetchStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
