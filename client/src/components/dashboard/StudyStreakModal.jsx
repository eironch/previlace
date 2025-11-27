import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Calendar, TrendingUp, Flame, CheckCircle, X } from "lucide-react";
import useStudyStreakStore from "@/store/studyStreakStore";

export default function StudyStreakModal({ isOpen, onClose }) {
  const {
    currentStreak,
    longestStreak,
    streakHistory,
    todayCompleted,
    fetchStudyStreakData,
    loading,
  } = useStudyStreakStore();

  useEffect(() => {
    if (isOpen) {
      fetchStudyStreakData();
    }
  }, [isOpen, fetchStudyStreakData]);

  if (!isOpen) return null;

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

  const weekDays = getDaysOfWeek();
  const nextMilestone = getNextMilestone(currentStreak);
  const daysToMilestone = nextMilestone - currentStreak;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-black"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Study streak</h1>
          <p className="text-base text-gray-700">
            Build consistent study habits and track your progress
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-64 rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="rounded-lg border border-gray-300 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200">
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
                    <Badge className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-900">
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

              <Card className="rounded-lg border border-gray-300 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-300 p-6">
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

                  <div className="border-t border-gray-300 pt-6">
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

            <Card className="rounded-lg border border-gray-300 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-300 p-6">
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
                              : "bg-gray-200 text-gray-400"
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
        )}
      </div>
    </div>
  );
}
