
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  points: number;
  weeklyProgress: number;
  badges: string[];
}

export const Leaderboard = () => {
  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      name: 'Alex Rivera',
      initials: 'AR',
      points: 2850,
      weeklyProgress: 95,
      badges: ['🔥', '💪', '🎯']
    },
    {
      rank: 2,
      name: 'Sam Chen',
      initials: 'SC',
      points: 2720,
      weeklyProgress: 88,
      badges: ['🚀', '⚡', '🏆']
    },
    {
      rank: 3,
      name: 'Jordan Kim',
      initials: 'JK',
      points: 2650,
      weeklyProgress: 92,
      badges: ['🎨', '💻', '🌟']
    },
    {
      rank: 4,
      name: 'You',
      initials: 'YO',
      points: 2480,
      weeklyProgress: 78,
      badges: ['📚', '🎓']
    },
    {
      rank: 5,
      name: 'Maria Lopez',
      initials: 'ML',
      points: 2340,
      weeklyProgress: 85,
      badges: ['💡', '🔧']
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Award className="w-4 h-4 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
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

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Weekly Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`p-3 rounded-lg border-2 ${getRankColor(entry.rank)} ${
                entry.name === 'You' ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <span className="font-bold text-sm">#{entry.rank}</span>
                </div>
                
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`text-xs ${
                    entry.name === 'You' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {entry.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-sm ${
                      entry.name === 'You' ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {entry.name}
                    </h4>
                    <div className="text-sm font-bold text-gray-900">
                      {entry.points} pts
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1">
                      {entry.badges.map((badge, index) => (
                        <span key={index} className="text-sm">
                          {badge}
                        </span>
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entry.weeklyProgress}% this week
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Keep going!</strong> You're only 170 points away from 3rd place! 🎯
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
