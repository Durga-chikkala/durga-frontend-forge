
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, Crown } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useState } from 'react';

export const InteractiveLeaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();
  const [viewMode, setViewMode] = useState<'points' | 'streak' | 'achievements'>('points');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSortedLeaderboard = () => {
    switch (viewMode) {
      case 'streak':
        return [...leaderboard].sort((a, b) => b.study_streak - a.study_streak);
      case 'achievements':
        return [...leaderboard].sort((a, b) => b.achievements_count - a.achievements_count);
      default:
        return leaderboard;
    }
  };

  const getDisplayValue = (entry: any) => {
    switch (viewMode) {
      case 'streak': return `${entry.study_streak} days`;
      case 'achievements': return `${entry.achievements_count} badges`;
      default: return `${entry.total_points} pts`;
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown User') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            Interactive Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-white/50">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = getSortedLeaderboard();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            Interactive Leaderboard
          </div>
          <Badge className="bg-purple-600 text-white">
            {sortedData.length} Users
          </Badge>
        </CardTitle>
        
        {/* View Mode Toggles */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={viewMode === 'points' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('points')}
            className={viewMode === 'points' ? 'bg-purple-600 text-white' : ''}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Points
          </Button>
          <Button
            variant={viewMode === 'streak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('streak')}
            className={viewMode === 'streak' ? 'bg-purple-600 text-white' : ''}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Streak
          </Button>
          <Button
            variant={viewMode === 'achievements' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('achievements')}
            className={viewMode === 'achievements' ? 'bg-purple-600 text-white' : ''}
          >
            <Award className="w-4 h-4 mr-1" />
            Badges
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {sortedData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leaderboard data yet</p>
              <p className="text-sm text-gray-400">Complete sessions to appear on the leaderboard!</p>
            </div>
          ) : (
            sortedData.map((entry, index) => {
              const displayRank = index + 1;
              
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 shadow-md'
                      : 'bg-white/70 backdrop-blur-sm hover:bg-white/90'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    <Badge className={`px-3 py-1 font-bold ${getRankBadgeColor(displayRank)}`}>
                      #{displayRank}
                    </Badge>
                    {getRankIcon(displayRank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarFallback className={`${
                      entry.isCurrentUser 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getInitials(entry.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold truncate ${
                        entry.isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {entry.full_name}
                        {entry.isCurrentUser && (
                          <span className="text-blue-600 ml-2">(You)</span>
                        )}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{entry.total_points} pts</span>
                      <span>•</span>
                      <span>{entry.study_streak} day streak</span>
                      <span>•</span>
                      <span>{entry.achievements_count} badges</span>
                    </div>
                  </div>

                  {/* Primary Metric */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      entry.isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {getDisplayValue(entry)}
                    </div>
                    {entry.posts_count > 0 && (
                      <div className="text-xs text-gray-500">
                        {entry.posts_count} posts
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
