
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Mail, MessageSquare, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  email: string;  
  initials: string;
  lastActive: string;
  engagementScore: number;
  streak: number;
  forumPosts: number;
  achievements: number;
  status: 'active' | 'at-risk' | 'inactive';
  weeklyProgress: number;
}

export const StudentEngagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get all profiles with their engagement data
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (!profilesData) return;

        const studentsData = await Promise.all(
          profilesData.map(async (profile) => {
            // Get user progress
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('study_streak, total_points')
              .eq('user_id', profile.id)
              .order('study_streak', { ascending: false })
              .limit(1);

            // Get forum posts count
            const { count: forumPosts } = await supabase
              .from('discussion_posts')
              .select('id', { count: 'exact' })
              .eq('user_id', profile.id);

            // Get achievements count
            const { count: achievements } = await supabase
              .from('user_achievements')
              .select('id', { count: 'exact' })
              .eq('user_id', profile.id);

            // Get last activity
            const { data: lastActivity } = await supabase
              .from('user_activities')
              .select('created_at')
              .eq('user_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1);

            // Get completed sessions in last week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const { count: recentSessions } = await supabase
              .from('user_study_sessions')
              .select('id', { count: 'exact' })
              .eq('user_id', profile.id)
              .eq('completed', true)
              .gte('created_at', weekAgo.toISOString());

            const streak = progressData?.[0]?.study_streak || 0;
            const totalPoints = progressData?.[0]?.total_points || 0;
            const lastActiveDate = lastActivity?.[0]?.created_at;
            
            // Calculate engagement score (0-100)
            const engagementScore = Math.min(100, 
              (streak * 5) + 
              (totalPoints / 10) + 
              ((forumPosts || 0) * 5) + 
              ((achievements || 0) * 10) +
              ((recentSessions || 0) * 15)
            );

            // Determine status
            let status: 'active' | 'at-risk' | 'inactive' = 'inactive';
            if (engagementScore >= 70) status = 'active';
            else if (engagementScore >= 30) status = 'at-risk';

            // Calculate last active time
            let lastActive = 'Never';
            if (lastActiveDate) {
              const diffTime = Date.now() - new Date(lastActiveDate).getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 0) lastActive = 'Today';
              else if (diffDays === 1) lastActive = '1 day ago';
              else if (diffDays < 7) lastActive = `${diffDays} days ago`;
              else if (diffDays < 30) lastActive = `${Math.floor(diffDays / 7)} weeks ago`;
              else lastActive = 'Over a month ago';
            }

            const weeklyProgress = Math.min(100, (recentSessions || 0) * 20);

            return {
              id: profile.id,
              name: profile.full_name,
              email: profile.email,
              initials: profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
              lastActive,
              engagementScore: Math.round(engagementScore),
              streak,
              forumPosts: forumPosts || 0,
              achievements: achievements || 0,
              status,
              weeklyProgress
            };
          })
        );

        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'inactive':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter(s => s.status === 'at-risk').length}
            </div>
            <div className="text-sm text-gray-600">At Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {students.filter(s => s.status === 'inactive').length}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </CardContent>
        </Card>
      </div>

      {/* Student Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Student Engagement Overview</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {students.length === 0 ? 'No students found' : 'No students match your search'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {student.initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <Badge className={`text-xs px-2 py-1 ${getStatusColor(student.status)}`}>
                          {getStatusIcon(student.status)}
                          <span className="ml-1 capitalize">{student.status}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Engagement:</span>
                          <div className="font-semibold">{student.engagementScore}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Streak:</span>
                          <div className="font-semibold">{student.streak} days</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Forum Posts:</span>
                          <div className="font-semibold">{student.forumPosts}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Achievements:</span>
                          <div className="font-semibold">{student.achievements}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          Last active: {student.lastActive}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Reward
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
