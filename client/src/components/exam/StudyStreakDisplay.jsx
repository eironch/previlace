import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Calendar, Zap, Target, TrendingUp, Flame, Clock, CheckCircle } from "lucide-react";
import useStudyStreakStore from "../../store/studyStreakStore";

function StudyStreakDisplay() {
  const { 
    currentStreak, 
    longestStreak, 
    streakHistory,
    todayCompleted,
    fetchStreakData,
    markTodayComplete,
    loading 
  } = useStudyStreakStore();

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  function getStreakColor(streak) {
    if (streak >= 30) return "text-purple-600 bg-purple-100";
    if (streak >= 14) return "text-orange-600 bg-orange-100";
    if (streak >= 7) return "text-blue-600 bg-blue-100";
    if (streak >= 3) return "text-green-600 bg-green-100";
    return "text-gray-600 bg-gray-100";
  }

  function getStreakTitle(streak) {
    if (streak >= 100) return "Legendary Scholar";
    if (streak >= 50) return "Master Student";
    if (streak >= 30) return "Dedicated Learner";
    if (streak >= 14) return "Consistent Student";
    if (streak >= 7) return "Week Warrior";
    if (streak >= 3) return "Getting Started";
    return "New Learner";
  }

  function getMotivationalMessage(streak, todayCompleted) {
    if (todayCompleted) {
      if (streak === 0) return "Great job completing your first day!";
      if (streak < 7) return `Day ${streak + 1} complete! Keep building momentum!`;
      if (streak < 30) return `${streak + 1} days strong! You're on fire!`;
      return `Incredible ${streak + 1} day streak! You're unstoppable!`;
    } else {
      if (streak === 0) return "Start your study streak today!";
      if (streak < 7) return `Don't break your ${streak} day streak!`;
      return `Keep your amazing ${streak} day streak alive!`;
    }
  }

  function getDaysOfWeek() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const isToday = date.toDateString() === today.toDateString();
      const isCompleted = streakHistory?.some(entry => 
        new Date(entry.date).toDateString() === date.toDateString()
      );
      
      return {
        day,
        date: date.getDate(),
        isToday,
        isCompleted: isCompleted || (isToday && todayCompleted)
      };
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const weekDays = getDaysOfWeek();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Streak</h1>
        <p className="text-gray-600">Build consistent study habits and track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`border-2 ${currentStreak > 0 ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100' : 'border-gray-300'}`}>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {currentStreak > 0 ? (
                <Flame className="h-16 w-16 text-orange-500" />
              ) : (
                <Zap className="h-16 w-16 text-gray-400" />
              )}
            </div>
            
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {currentStreak || 0}
            </div>
            
            <div className="text-lg text-gray-600 mb-4">
              {currentStreak === 1 ? 'Day' : 'Days'} Current Streak
            </div>

            <Badge className={getStreakColor(currentStreak)} variant="outline">
              {getStreakTitle(currentStreak)}
            </Badge>

            <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                {getMotivationalMessage(currentStreak, todayCompleted)}
              </p>
            </div>

            {!todayCompleted && (
              <Button 
                onClick={markTodayComplete}
                className="mt-4 w-full"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Today Complete
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Streak Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Longest Streak</span>
                <span className="text-2xl font-bold text-blue-600">{longestStreak || 0}</span>
              </div>
              <Progress 
                value={currentStreak && longestStreak ? (currentStreak / longestStreak) * 100 : 0}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current streak is {currentStreak && longestStreak ? 
                  Math.round((currentStreak / longestStreak) * 100) : 0}% of your best
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Next Milestone</span>
                <span className="text-lg font-semibold text-purple-600">
                  {currentStreak >= 100 ? '100+' : 
                   currentStreak >= 50 ? '100' :
                   currentStreak >= 30 ? '50' :
                   currentStreak >= 14 ? '30' :
                   currentStreak >= 7 ? '14' :
                   currentStreak >= 3 ? '7' : '3'} days
                </span>
              </div>
              <Progress 
                value={currentStreak >= 100 ? 100 :
                       currentStreak >= 50 ? (currentStreak / 100) * 100 :
                       currentStreak >= 30 ? (currentStreak / 50) * 100 :
                       currentStreak >= 14 ? (currentStreak / 30) * 100 :
                       currentStreak >= 7 ? (currentStreak / 14) * 100 :
                       currentStreak >= 3 ? (currentStreak / 7) * 100 :
                       (currentStreak / 3) * 100}
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {streakHistory?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Days</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {todayCompleted ? '✓' : '-'}
                  </div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(((streakHistory?.length || 0) / 30) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  {day.day}
                </div>
                <div 
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                    day.isCompleted 
                      ? 'bg-green-500 text-white' 
                      : day.isToday 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.isCompleted ? '✓' : day.date}
                </div>
                {day.isToday && (
                  <div className="text-xs text-blue-600 font-medium mt-1">Today</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Better Retention</h3>
              <p className="text-sm text-gray-600">Daily practice improves long-term memory</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Bonus Points</h3>
              <p className="text-sm text-gray-600">Streaks multiply your quiz scores</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Habit Formation</h3>
              <p className="text-sm text-gray-600">Build lasting study routines</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudyStreakDisplay;
