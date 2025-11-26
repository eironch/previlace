import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import useDashboardStore from "@/store/dashboardStore";
import { Target, TrendingUp, Flame, Award } from "lucide-react";

import JourneyMap from "@/components/dashboard/JourneyMap";
import DailyChallengeCard from "@/components/dashboard/DailyChallengeCard";
import StatCard from "@/components/dashboard/StatCard";
import StudyStreakModal from "@/components/dashboard/StudyStreakModal";
import UpcomingClassCard from "@/components/dashboard/UpcomingClassCard";
import LevelIndicator from "@/components/dashboard/LevelIndicator";
import StandardHeader from "@/components/ui/StandardHeader";

function DashboardPage() {
  const { user } = useAuthStore();
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const { 
    currentStreak, 
    longestStreak, 
    analytics, 
    studyPlan, 
    isLoading, 
    fetchDashboardData 
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    <div className="bg-gray-50">
      <StandardHeader 
        title={`Welcome back, ${user?.firstName || "Student"}`}
        description="Track your exam preparation progress"
        onRefresh={fetchDashboardData}
      >
        <LevelIndicator />
      </StandardHeader>
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <DailyChallengeCard />
          <UpcomingClassCard />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-300" />)
          ) : (
            <>
              <StatCard title="Current Streak" value={currentStreak} unit="days" icon={Flame} onClick={() => setIsStreakModalOpen(true)} />
              <StatCard title="Longest Streak" value={longestStreak} unit="days" icon={Award} onClick={() => setIsStreakModalOpen(true)} />
              <StatCard title="Exam Readiness" value={`${analytics?.accuracy || 0}%`} unit="score" icon={Target} navigateTo="/dashboard/analytics" />
              <StatCard title="Weak Areas" value={analytics?.weakAreas?.length || 0} unit="topics" icon={TrendingUp} navigateTo="/dashboard/analytics" />
            </>
          )}
        </div>


        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Study Plan Progress</h3>
            {!isLoading && studyPlan && <span className="text-sm font-semibold text-gray-600">{calculateCompletion()}% complete</span>}
          </div>
          {isLoading ? (
            <div className="h-96 animate-pulse rounded-lg bg-gray-300"></div>
          ) : (
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <JourneyMap studyPlan={studyPlan} />
            </div>
          )}
        </div>
        <StudyStreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />
      </main>
    </div>
  );
}

export default DashboardPage;
