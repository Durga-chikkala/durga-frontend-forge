
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, RefreshCw, Users, Crown } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  user_roles?: {
    role: string;
  } | null;
  total_points?: number;
  posts_count?: number;
}

interface UsersAdminProps {
  onStatsUpdate: () => void;
}

export const UsersAdmin = ({ onStatsUpdate }: UsersAdminProps) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('student');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching comprehensive users data for admin...');
      
      // Get all profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Get additional data for each user
      const usersWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            // Get user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id)
              .single();

            // Get user points from progress
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('total_points')
              .eq('user_id', profile.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            // Get user points from activities
            const { data: activityData } = await supabase
              .from('user_activities')
              .select('points_earned')
              .eq('user_id', profile.id);

            // Get posts count
            const { data: postsData } = await supabase
              .from('discussion_posts')
              .select('id')
              .eq('user_id', profile.id);

            const progressPoints = progressData?.[0]?.total_points || 0;
            const activityPoints = activityData?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;
            const totalPoints = progressPoints + activityPoints;
            const postsCount = postsData?.length || 0;

            return {
              ...profile,
              user_roles: roleData,
              total_points: totalPoints,
              posts_count: postsCount
            };
          } catch (error) {
            console.error(`Error fetching data for user ${profile.id}:`, error);
            return {
              ...profile,
              user_roles: null,
              total_points: 0,
              posts_count: 0
            };
          }
        })
      );

      console.log('Fetched users with comprehensive data:', usersWithData);
      setUsers(usersWithData);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUser.id,
          role: newRole
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'User role updated successfully' });
      setShowRoleDialog(false);
      setSelectedUser(null);
      fetchUsers();
      onStatsUpdate();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const openRoleDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.user_roles?.role || 'student');
    setShowRoleDialog(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  const adminCount = users.filter(u => u.user_roles?.role === 'admin').length;
  const instructorCount = users.filter(u => u.user_roles?.role === 'instructor').length;
  const studentCount = users.filter(u => !u.user_roles?.role || u.user_roles.role === 'student').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h2>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{studentCount}</div>
            <div className="text-sm text-gray-600">Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{instructorCount}</div>
            <div className="text-sm text-gray-600">Instructors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{adminCount}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.user_roles?.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                        {user.full_name || 'Unknown User'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.user_roles?.role === 'admin' ? 'default' : 
                                 user.user_roles?.role === 'instructor' ? 'secondary' : 'outline'}
                      >
                        {user.user_roles?.role || 'student'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.total_points || 0}</TableCell>
                    <TableCell>{user.posts_count || 0}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRoleDialog(user)}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedUser.full_name || 'Unknown User'}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">Points: {selectedUser.total_points || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button onClick={handleRoleUpdate} className="w-full">
                Update Role
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
