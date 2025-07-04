
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Star, Award, Crown, Zap } from 'lucide-react';
import { useUserAchievements } from '@/hooks/useUserAchievements';

export const AchievementsPanel = () => {
  const { achievements, loading } = useUserAchievements();

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'common': 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Medal,
          gradient: 'from-gray-400 to-gray-600'
        };
      case 'rare': 
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Star,
          gradient: 'from-blue-400 to-blue-600'
        };
      case 'epic': 
        return { 
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: Award,
          gradient: 'from-purple-400 to-purple-600'
        };
      case 'legendary': 
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: Crown,
          gradient: 'from-yellow-400 to-orange-600'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Medal,
          gradient: 'from-gray-400 to-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Achievements
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const earnedAchievements = achievements.filter(a => a.unlocked);
  const inProgressAchievements = achievements.filter(a => !a.unlocked && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.unlocked && a.progress === 0);

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Achievements
              </span>
              <p className="text-sm text-gray-600 font-normal">Your learning milestones</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-sm">
            {earnedAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Achievements Yet</h3>
            <p className="text-gray-500">Start learning to unlock achievements!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Earned Achievements */}
            {earnedAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Earned ({earnedAchievements.length})
                </h4>
                <div className="grid gap-3">
                  {earnedAchievements.map((achievement) => {
                    const config = getRarityConfig(achievement.rarity || 'common');
                    const IconComponent = config.icon;
                    
                    return (
                      <div
                        key={achievement.id}
                        className="relative p-4 rounded-xl border-2 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md hover:shadow-lg transition-all duration-200 group overflow-hidden"
                      >
                        {/* Celebration Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm">{achievement.name}</h4>
                              <Badge className={`text-xs px-2 py-0.5 ${config.color} font-medium`}>
                                {achievement.rarity || 'common'}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{achievement.description}</p>
                            
                            <div className="flex items-center gap-3">
                              {achievement.points > 0 && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 font-medium">
                                  +{achievement.points} pts
                                </Badge>
                              )}
                              {achievement.earned_at && (
                                <span className="text-xs text-gray-500">
                                  {new Date(achievement.earned_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In Progress Achievements */}
            {inProgressAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  In Progress ({inProgressAchievements.length})
                </h4>
                <div className="grid gap-3">
                  {inProgressAchievements.map((achievement) => {
                    const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                    const config = getRarityConfig(achievement.rarity || 'common');
                    const IconComponent = config.icon;
                    
                    return (
                      <div
                        key={achievement.id}
                        className="p-4 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} opacity-75 group-hover:opacity-100 transition-opacity duration-200`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{achievement.name}</h4>
                              <Badge className={`text-xs px-2 py-0.5 ${config.color}`}>
                                {achievement.rarity || 'common'}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{achievement.description}</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                              <div className="relative">
                                <Progress value={progressPercent} className="h-2" />
                                <div 
                                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>

                            {achievement.points > 0 && (
                              <Badge className="text-xs bg-gray-100 text-gray-700 mt-2">
                                +{achievement.points} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-gray-400" />
                  Locked ({lockedAchievements.length})
                </h4>
                <div className="grid gap-3">
                  {lockedAchievements.slice(0, 3).map((achievement) => {
                    const config = getRarityConfig(achievement.rarity || 'common');
                    const IconComponent = config.icon;
                    
                    return (
                      <div
                        key={achievement.id}
                        className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200 opacity-60 hover:opacity-80 transition-opacity duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-gray-300">
                            <IconComponent className="w-6 h-6 text-gray-500" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-600 text-sm">{achievement.name}</h4>
                              <Badge className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600">
                                {achievement.rarity || 'common'}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{achievement.description}</p>
                            
                            {achievement.points > 0 && (
                              <Badge className="text-xs bg-gray-200 text-gray-600">
                                +{achievement.points} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
