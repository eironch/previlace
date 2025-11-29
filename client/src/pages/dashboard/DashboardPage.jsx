import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useDashboard } from "@/hooks/useDashboard";
import { Target, TrendingUp, Flame, Award, MapPin } from "lucide-react";

import JourneyMap from "@/components/dashboard/JourneyMap";
import DailyChallengeCard from "@/components/dashboard/DailyChallengeCard";
import StatCard from "@/components/dashboard/StatCard";
import StudyStreakModal from "@/components/dashboard/StudyStreakModal";
import UpcomingClassCard from "@/components/dashboard/UpcomingClassCard";
import LevelIndicator from "@/components/dashboard/LevelIndicator";
import StandardHeader from "@/components/ui/StandardHeader";

function DashboardPage() {
  const { user: authUser } = useAuthStore();
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const journeyMapRef = useRef(null);
  
  const { 
    user: dashboardUser,
    streak,
    analytics, 
    studyPlan, 
    isBaseLoading,
    isScheduleLoading,
    isAnalyticsLoading,
    refreshDashboard 
  } = useDashboard();

  const user = dashboardUser || authUser;

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  return (
    <div className="bg-gray-50">
      <StandardHeader 
        title={`Welcome back, ${user?.firstName || "Student"}`}
        description="Track your exam preparation progress"
        onRefresh={refreshDashboard}
        isRefreshing={isBaseLoading}
      >
        <LevelIndicator user={user} />
      </StandardHeader>
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <DailyChallengeCard studyPlan={studyPlan} />
          <UpcomingClassCard />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {isBaseLoading ? (
            Array.from({ length: 2 }).map((_, i) => <div key={`base-${i}`} className="h-24 animate-pulse rounded-lg bg-gray-200" />)
          ) : (
            <>
              <StatCard title="Current Streak" value={currentStreak} unit="days" icon={Flame} onClick={() => setIsStreakModalOpen(true)} />
              <StatCard title="Longest Streak" value={longestStreak} unit="days" icon={Award} onClick={() => setIsStreakModalOpen(true)} />
            </>
          )}

          {isAnalyticsLoading ? (
             Array.from({ length: 2 }).map((_, i) => <div key={`analytics-${i}`} className="h-24 animate-pulse rounded-lg bg-gray-200" />)
          ) : (
            <>
              <StatCard title="Exam Readiness" value={`${analytics?.accuracy || 0}%`} unit="score" icon={Target} navigateTo="/dashboard/analytics" />
              <StatCard title="Weak Areas" value={analytics?.weakAreas?.length || 0} unit="topics" icon={TrendingUp} navigateTo="/dashboard/analytics" />
            </>
          )}
        </div>


        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Study Plan Progress</h3>
            {!isScheduleLoading && studyPlan && (
              <button
                onClick={() => journeyMapRef.current?.scrollToCurrent()}
                className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
              >
                <MapPin size={14} />
                Jump to Current
              </button>
            )}
          </div>
          {isScheduleLoading ? (
            <div className="h-48 w-full animate-pulse rounded-lg bg-gray-200"></div>
          ) : (
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <JourneyMap ref={journeyMapRef} studyPlan={studyPlan} />
            </div>
          )}
        </div>
        <StudyStreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />
      </main>
    </div>
  );
}

export default DashboardPage;
