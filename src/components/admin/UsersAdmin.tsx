
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, RefreshCw } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  user_roles?: {
    role: string;
  } | null;
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
      console.log('Fetching users for admin...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
      setUsers(data || []);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            Total: {users.length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Admins: {users.filter(u => u.user_roles?.role === 'admin').length}
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Unknown User'}
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
