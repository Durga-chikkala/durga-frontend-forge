
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal } from 'lucide-react';
import { useUserAchievements } from '@/hooks/useUserAchievements';

export const AchievementsPanel = () => {
  const { achievements, loading } = useUserAchievements();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg border-2 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-2 bg-gray-300 rounded"></div>
                  </div>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No achievements yet</p>
              <p className="text-sm text-gray-400">Keep learning to unlock achievements!</p>
            </div>
          ) : (
            achievements.map((achievement) => {
              const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
              
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full text-lg ${
                      achievement.unlocked ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {achievement.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.name}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0.5 ${getRarityColor(achievement.rarity || 'common')}`}
                        >
                          {achievement.rarity || 'common'}
                        </Badge>
                      </div>
                      
                      <p className={`text-xs mb-2 ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && (
                        <div className="space-y-1">
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.maxProgress}
                          </p>
                        </div>
                      )}

                      {achievement.points > 0 && (
                        <Badge className="text-xs mt-2 bg-blue-100 text-blue-800">
                          {achievement.points} pts
                        </Badge>
                      )}
                    </div>
                    
                    {achievement.unlocked && (
                      <div className="text-yellow-500">
                        <Trophy className="w-5 h-5" />
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
