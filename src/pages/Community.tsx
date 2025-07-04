
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInitializeUserData } from '@/hooks/useInitializeUserData';
import { Navigation } from '@/components/Navigation';
import { DiscussionForum } from '@/components/dashboard/DiscussionForum';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

const Community = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Initialize user data when they access the community
  useInitializeUserData();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Community 💬
          </h1>
          <p className="text-gray-600 text-lg">Connect with fellow students and share knowledge</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DiscussionForum />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
