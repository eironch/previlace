import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import useStudyStreakStore from "@/store/studyStreakStore";
import useAnalyticsStore from "@/store/analyticsStore";
import useStudyPlanStore from "@/store/studyPlanStore";
import { Target, TrendingUp, Flame, Award } from "lucide-react";

import Navigation from "@/components/Navigation";
import JourneyMap from "@/components/dashboard/JourneyMap";
import DailyChallengeCard from "@/components/dashboard/DailyChallengeCard";
import WeeklyProgressCard from "@/components/dashboard/WeeklyProgressCard";
import StatCard from "@/components/dashboard/StatCard";

function DashboardPage() {
  const { user } = useAuthStore();
  const { currentStreak, longestStreak, fetchStudyStreakData, isLoading: streakLoading } = useStudyStreakStore();
  const { readiness, weakAreas, fetchAnalytics } = useAnalyticsStore();
  const { activePlan: studyPlan, fetchActivePlan, loading: planLoading } = useStudyPlanStore();

  useEffect(() => {
    fetchStudyStreakData();
    fetchAnalytics();
    fetchActivePlan();
  }, [fetchStudyStreakData, fetchAnalytics, fetchActivePlan]);

  function calculateCompletion() {
    if (!studyPlan?.weeks) return 0;

    const allSessions = studyPlan.weeks.flatMap((week) => [week.saturdaySession, week.sundaySession]);

    const completedSessions = allSessions.filter((session) => {
      if (!session?.date) return false;
      const sessionDate = new Date(session.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today;
    });

    return Math.round((completedSessions.length / allSessions.length) * 100);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome back, {user?.firstName || "Student"}</h2>
          <p className="text-gray-600">Continue your journey to CSE success</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {streakLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />)
          ) : (
            <>
              <StatCard title="Current Streak" value={currentStreak} unit="days" icon={Flame} navigateTo="/dashboard/study-streak" />
              <StatCard title="Longest Streak" value={longestStreak} unit="days" icon={Award} navigateTo="/dashboard/study-streak" />
              <StatCard title="Exam Readiness" value={`${readiness?.overall || 0}%`} unit="score" icon={Target} />
              <StatCard title="Weak Areas" value={weakAreas?.length || 0} unit="topics" icon={TrendingUp} />
            </>
          )}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <DailyChallengeCard />
          <WeeklyProgressCard />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Your Learning Journey</h3>
            {!planLoading && studyPlan && <span className="text-sm font-semibold text-gray-600">{calculateCompletion()}% Complete</span>}
          </div>
          {planLoading ? (
            <div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <JourneyMap studyPlan={studyPlan} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
