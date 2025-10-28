import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Trophy, Award, Target, Zap, Star, Crown, Medal, Gift } from "lucide-react";
import useAchievementStore from "../../store/achievementStore";

function AchievementsGallery() {
  const { 
    userAchievements, 
    availableAchievements, 
    fetchUserAchievements, 
    fetchAvailableAchievements,
    loading 
  } = useAchievementStore();

  useEffect(() => {
    fetchUserAchievements();
    fetchAvailableAchievements();
  }, [fetchUserAchievements, fetchAvailableAchievements]);

  function getAchievementIcon(category) {
    const icons = {
      streak: Zap,
      accuracy: Target,
      practice: Trophy,
      speed: Medal,
      mastery: Crown,
      milestone: Star,
      special: Gift,
      default: Award
    };
    return icons[category] || icons.default;
  }

  function getRarityColor(rarity) {
    switch (rarity) {
      case "legendary":
        return "border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800";
      case "epic":
        return "border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800";
      case "rare":
        return "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800";
      default:
        return "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800";
    }
  }

  function getProgressColor(progress) {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-300";
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedAchievements = userAchievements?.filter(ua => ua.unlockedAt) || [];
  const inProgressAchievements = availableAchievements?.filter(a => {
    const userAchievement = userAchievements?.find(ua => ua.achievementId._id === a._id);
    return userAchievement && !userAchievement.unlockedAt && userAchievement.progress > 0;
  }) || [];
  const lockedAchievements = availableAchievements?.filter(a => {
    const userAchievement = userAchievements?.find(ua => ua.achievementId._id === a._id);
    return !userAchievement || (!userAchievement.unlockedAt && userAchievement.progress === 0);
  }) || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your progress and unlock rewards as you study</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{unlockedAchievements.length}</div>
            <div className="text-sm text-blue-700">Unlocked</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-900">{inProgressAchievements.length}</div>
            <div className="text-sm text-yellow-700">In Progress</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6 text-center">
            <Medal className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{lockedAchievements.length}</div>
            <div className="text-sm text-gray-700">Locked</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {unlockedAchievements.reduce((sum, ua) => sum + (ua.achievementId.pointsValue || 0), 0)}
            </div>
            <div className="text-sm text-purple-700">Total Points</div>
          </CardContent>
        </Card>
      </div>

      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Unlocked Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievementId;
              const Icon = getAchievementIcon(achievement.category);
              
              return (
                <Card 
                  key={userAchievement._id}
                  className={`relative overflow-hidden ${getRarityColor(achievement.rarityLevel)}`}
                >
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-white bg-opacity-50">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                        <p className="text-sm opacity-80 mb-3">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-white bg-opacity-50 capitalize">
                            {achievement.rarityLevel}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{achievement.pointsValue} pts</div>
                            <div className="text-xs opacity-75">
                              {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {inProgressAchievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-yellow-600" />
            In Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((achievement) => {
              const userAchievement = userAchievements.find(ua => ua.achievementId._id === achievement._id);
              const Icon = getAchievementIcon(achievement.category);
              const progress = userAchievement?.progress || 0;
              const progressPercentage = Math.min((progress / 100) * 100, 100);
              
              return (
                <Card key={achievement._id} className="border-2 border-dashed border-yellow-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-yellow-100">
                        <Icon className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className={`h-2 ${getProgressColor(progressPercentage)}`}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="capitalize">
                            {achievement.rarityLevel}
                          </Badge>
                          <div className="text-sm font-semibold text-gray-600">
                            {achievement.pointsValue} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Medal className="h-6 w-6 text-gray-500" />
            Locked Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.slice(0, 6).map((achievement) => {
              const Icon = getAchievementIcon(achievement.category);
              
              return (
                <Card key={achievement._id} className="opacity-60 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gray-100">
                        <Icon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 text-gray-700">{achievement.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 capitalize">
                            {achievement.rarityLevel}
                          </Badge>
                          <div className="text-sm font-semibold text-gray-500">
                            {achievement.pointsValue} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {lockedAchievements.length > 6 && (
            <div className="text-center mt-4">
              <p className="text-gray-500">
                And {lockedAchievements.length - 6} more achievements to discover...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AchievementsGallery;
