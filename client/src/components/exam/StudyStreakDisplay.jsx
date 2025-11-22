import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Calendar, TrendingUp, Flame, CheckCircle, ArrowLeft } from "lucide-react";
import useStudyStreakStore from "../../store/studyStreakStore";

function StudyStreakDisplay() {
  const navigate = useNavigate();
  const {
    currentStreak,
    longestStreak,
    streakHistory,
    todayCompleted,
    fetchStreakData,
    loading,
  } = useStudyStreakStore();

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  function getStreakTitle(streak) {
    if (streak >= 100) return "Legendary Scholar";
    if (streak >= 50) return "Master Student";
    if (streak >= 30) return "Dedicated Learner";
    if (streak >= 14) return "Consistent Student";
    if (streak >= 7) return "Week Warrior";
    if (streak >= 3) return "Getting Started";
    return "New Learner";
  }

  function getDaysOfWeek() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const isToday = date.toDateString() === today.toDateString();
      const isCompleted = streakHistory?.some(
        (entry) => new Date(entry.date).toDateString() === date.toDateString()
      );

      return {
        day,
        date: date.getDate(),
        isToday,
        isCompleted: isCompleted || (isToday && todayCompleted),
      };
    });
  }

  function getNextMilestone(current) {
    const milestones = [3, 7, 14, 30, 50, 100];
    return milestones.find((m) => m > current) || 100;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const weekDays = getDaysOfWeek();
  const nextMilestone = getNextMilestone(currentStreak);
  const daysToMilestone = nextMilestone - currentStreak;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Study streak</h1>
        <p className="text-base text-gray-700">
          Build consistent study habits and track your progress
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                <Flame
                  className={`h-12 w-12 ${currentStreak > 0 ? "text-gray-900" : "text-gray-400"}`}
                />
              </div>
            </div>

            <div className="mb-6 text-center">
              <div className="mb-2 text-6xl font-bold text-gray-900">
                {currentStreak || 0}
              </div>
              <div className="text-base text-gray-700">
                {currentStreak === 1 ? "Day" : "Days"} streak
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <Badge className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
                {getStreakTitle(currentStreak)}
              </Badge>
            </div>

            {todayCompleted && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  Today completed
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-6">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <TrendingUp className="h-5 w-5 text-gray-900" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Longest streak
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {longestStreak || 0}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-black transition-all"
                  style={{
                    width: `${currentStreak && longestStreak ? (currentStreak / longestStreak) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Current is{" "}
                {currentStreak && longestStreak
                  ? Math.round((currentStreak / longestStreak) * 100)
                  : 0}
                % of your best
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Next milestone
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {daysToMilestone} {daysToMilestone === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-black transition-all"
                  style={{
                    width: `${currentStreak >= 100 ? 100 : (currentStreak / nextMilestone) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                {nextMilestone} day milestone
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {streakHistory?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(((streakHistory?.length || 0) / 30) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200 p-6">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Calendar className="h-5 w-5 text-gray-900" />
            This week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-xs font-medium text-gray-600">
                  {day.day}
                </div>
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold ${
                    day.isCompleted
                      ? "bg-green-500 text-white"
                      : day.isToday
                        ? "border-2 border-black bg-white text-gray-900"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {day.isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    day.date
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudyStreakDisplay;
