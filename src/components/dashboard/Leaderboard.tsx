
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export const Leaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />;
      case 2: return <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
      case 3: return <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />;
      default: return <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
      case 3: return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300';
      default: return 'bg-white border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown User') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 sm:space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse p-2 sm:p-3 rounded-lg border-2 bg-gray-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 sm:h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-12 sm:w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No rankings yet</p>
              <p className="text-xs sm:text-sm text-gray-400">Complete activities to appear on the leaderboard!</p>
            </div>
          ) : (
            leaderboard.slice(0, 5).map((entry) => (
              <div
                key={entry.user_id}
                className={`p-2 sm:p-3 rounded-lg border-2 ${getRankColor(entry.rank)} ${
                  entry.isCurrentUser ? 'ring-1 sm:ring-2 ring-blue-300 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="font-bold text-xs sm:text-sm">#{entry.rank}</span>
                  </div>
                  
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                    <AvatarFallback className={`text-xs ${
                      entry.isCurrentUser 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getInitials(entry.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold text-xs sm:text-sm truncate ${
                        entry.isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {entry.isCurrentUser ? 'You' : entry.full_name}
                      </h4>
                      <div className="text-xs sm:text-sm font-bold text-gray-900 ml-2">
                        {entry.total_points} pts
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex gap-1 sm:gap-2 text-xs text-gray-600">
                        <span>🔥 {entry.study_streak}</span>
                        <span>🏆 {entry.achievements_count}</span>
                        <span>💬 {entry.posts_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {leaderboard.length > 0 && (
          <div className="text-center mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-700">
              <strong>Keep going!</strong> Stay active to climb the leaderboard! 🎯
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
