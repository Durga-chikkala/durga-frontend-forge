
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { InteractiveLeaderboard } from '@/components/dashboard/InteractiveLeaderboard';
import { StatsCard } from '@/components/dashboard/StatsCard';

const Leaderboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Leaderboard 🏆
          </h1>
          <p className="text-gray-600 text-lg">See how you rank against other students</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveLeaderboard />
          <StatsCard />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
