import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import {
  Crown,
  Trophy,
  Medal,
  Users,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import useLeaderboardStore from "@/store/leaderboardStore";
import useAuthStore from "@/store/authStore";

function LeaderboardPage() {
  const { leaderboard, userRank, fetchLeaderboard, fetchUserRank, loading } =
    useLeaderboardStore();

  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [selectedPeriod, setSelectedPeriod] = useState("all-time");

  const categories = [
    { key: "overall", label: "Overall", icon: Crown },
    { key: "accuracy", label: "Accuracy", icon: Target },
    { key: "speed", label: "Speed", icon: Zap },
    { key: "streak", label: "Streak", icon: TrendingUp },
  ];

  const periods = [
    { key: "all-time", label: "All Time" },
    { key: "monthly", label: "This Month" },
    { key: "weekly", label: "This Week" },
    { key: "daily", label: "Today" },
  ];

  useEffect(() => {
    fetchLeaderboard(selectedCategory, selectedPeriod);
    if (user) {
      fetchUserRank(selectedCategory, selectedPeriod);
    }
  }, [fetchLeaderboard, fetchUserRank, selectedCategory, selectedPeriod, user]);

  function getRankIcon(rank) {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
    return null;
  }

  function getRankColor(rank) {
    if (rank === 1)
      return "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100";
    if (rank === 2)
      return "border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100";
    if (rank === 3)
      return "border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100";
    return "border-gray-200 bg-white";
  }

  function formatScore(score, category) {
    switch (category) {
      case "accuracy":
        return `${score.toFixed(1)}%`;
      case "speed":
        return `${score.toFixed(1)}s/q`;
      case "streak":
        return `${score} days`;
      default:
        return score.toLocaleString();
    }
  }

  function getAvatarFallback(displayName) {
    return (
      displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600">
          Compete with other learners and track your progress
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.key}
              variant={
                selectedCategory === category.key ? "default" : "outline"
              }
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {periods.map((period) => (
          <Button
            key={period.key}
            size="sm"
            variant={selectedPeriod === period.key ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period.key)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {userRank && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-bold text-blue-700">
                      #{userRank.rank}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Your Rank</p>
                    <p className="text-sm text-blue-700">
                      {formatScore(userRank.score, selectedCategory)}
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Top {Math.round((userRank.rank / userRank.totalUsers) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performers -{" "}
            {categories.find((c) => c.key === selectedCategory)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId._id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${getRankColor(entry.rank)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank) || (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <span className="text-sm font-bold text-gray-600">
                            #{entry.rank}
                          </span>
                        </div>
                      )}
                    </div>

                    <Avatar className="h-10 w-10">
                      {entry.userId.avatar ? (
                        <img
                          src={entry.userId.avatar}
                          alt={entry.userId.displayName}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-semibold text-blue-700">
                            {getAvatarFallback(entry.userId.displayName)}
                          </span>
                        </div>
                      )}
                    </Avatar>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {entry.userId.displayName || "Anonymous User"}
                        {entry.userId._id === user?._id && (
                          <span className="ml-2 text-sm text-blue-600">
                            (You)
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Level: {entry.userId.level || 1}</span>
                        {entry.streak && entry.streak > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {entry.streak} day streak
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {formatScore(entry.score, selectedCategory)}
                    </div>
                    {entry.change && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          entry.change > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendingUp className="h-3 w-3" />
                        {entry.change > 0 ? "+" : ""}
                        {entry.change}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-2 text-gray-500">
                No leaderboard data available
              </p>
              <p className="text-sm text-gray-400">
                Take some quizzes to start competing!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaderboardPage;
