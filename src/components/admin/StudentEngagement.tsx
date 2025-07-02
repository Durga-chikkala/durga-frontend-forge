
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Mail, MessageSquare, Award, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Alex Rivera', 
      email: 'alex@example.com',
      initials: 'AR',
      lastActive: '2 hours ago',
      engagementScore: 95,
      streak: 12,
      forumPosts: 8,
      achievements: 15,
      status: 'active',
      weeklyProgress: 95
    },
    {
      id: '2',
      name: 'Sam Chen',
      email: 'sam@example.com',
      initials: 'SC',
      lastActive: '1 day ago',
      engagementScore: 78,
      streak: 5,
      forumPosts: 3,
      achievements: 8,
      status: 'active',
      weeklyProgress: 78
    },
    {
      id: '3',
      name: 'Jordan Kim',
      email: 'jordan@example.com',
      initials: 'JK',
      lastActive: '3 days ago',
      engagementScore: 45,
      streak: 0,
      forumPosts: 1,
      achievements: 3,
      status: 'at-risk',
      weeklyProgress: 35
    },
    {
      id: '4',
      name: 'Maria Lopez',
      email: 'maria@example.com',
      initials: 'ML',
      lastActive: '1 week ago',
      engagementScore: 20,
      streak: 0,
      forumPosts: 0,
      achievements: 1,
      status: 'inactive',
      weeklyProgress: 15
    }
  ]);

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
            {filteredStudents.map((student) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
