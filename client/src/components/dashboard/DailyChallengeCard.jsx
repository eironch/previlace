import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Trophy, CheckCircle, Clock, Zap } from "lucide-react";
import usePostTestStore from "@/store/postTestStore";
import useExamStore from "@/store/examStore";
import useDashboardStore from "@/store/dashboardStore";
import weekendClassService from "@/services/weekendClassService";

function getDayName(date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

function DailyChallengeCard() {
  const navigate = useNavigate();
  const { studyPlan: activePlan, isLoading: dashboardLoading } = useDashboardStore();
  const { postTestStatus, fetchPostTestStatus, loading: postTestLoading } = usePostTestStore();
  const { startQuizSession, startDailyPractice, loading: quizLoading, currentSession, sessionActive } = useExamStore();
  const [weekendClass, setWeekendClass] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [error, setError] = useState(null);

  const isDailyPracticeActive = sessionActive && currentSession?.mode === "daily-practice";

  const today = new Date();
  const dayName = getDayName(today);
  const isWeekend = dayName === "Saturday" || dayName === "Sunday";

  useEffect(() => {
    fetchPostTestStatus();
  }, [fetchPostTestStatus]);

  useEffect(() => {
    if (activePlan?.weeks) {
      const current = activePlan.weeks.find((week) => {
        const start = new Date(week.startDate);
        const end = new Date(week.endDate);
        return today >= start && today <= end;
      });
      setCurrentWeek(current);
    }
  }, [activePlan]);

  useEffect(() => {
    async function fetchClass() {
      try {
        const data = await weekendClassService.getUpcomingClass();
        setWeekendClass(data);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch weekend class", err);
        }
      }
    }
    fetchClass();
  }, []);

  async function handleStartPostTest() {
    if (!currentWeek) return;
    
    try {
      setError(null);
      await startQuizSession({
        mode: "post-test",
        weekNumber: currentWeek.weekNumber,
      });
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Start post-test error:", err);
      }
      setError(err.message || "Failed to start post-test");
    }
  }

  async function handleStartDailyPractice() {
    try {
      setError(null);
      await startDailyPractice();
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Start daily practice error:", err);
      }
      setError(err.message || "Failed to start daily practice");
    }
  }

  if (postTestLoading || dashboardLoading || !activePlan) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200" />
          <div className="flex-1">
            <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isWeekend) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Target className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekend Class</h3>
            <p className="text-sm text-gray-500">{dayName} session</p>
          </div>
        </div>
        {weekendClass ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-bold text-gray-900">{weekendClass.topic}</h4>
            <p className="mb-3 text-sm text-gray-600">{weekendClass.description}</p>
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{weekendClass.startTime} - {weekendClass.endTime}</span>
            </div>
            {weekendClass.meetingLink && (
              <a 
                href={weekendClass.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-black px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Join Class
              </a>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 py-6 text-center text-gray-500">
            No class scheduled for today.
          </div>
        )}
      </div>
    );
  }

  if (!currentWeek) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Target className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Practice</h3>
            <p className="text-sm text-gray-500">Study plan not active</p>
          </div>
        </div>
      </div>
    );
  }

  const currentWeekPostTest = postTestStatus.find(
    (s) => s.weekNumber === currentWeek.weekNumber && s.completed
  );

  const isPostTestCompleted = !!currentWeekPostTest;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black">
            {isPostTestCompleted ? (
              <Zap className="h-6 w-6 text-white" />
            ) : (
              <Target className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isPostTestCompleted ? "Daily Practice" : "Post-Test"}
            </h3>
            <p className="text-sm text-gray-500">
              Week {currentWeek.weekNumber} - {dayName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <Trophy className="h-4 w-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">
              +{isPostTestCompleted ? "15" : "30"} XP
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {isPostTestCompleted ? (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Post-Test Completed</span>
          </div>
          <div className="mb-4 space-y-2 text-sm text-gray-600">
             <div className="flex items-center justify-between">
              <span>Questions</span>
              <span className="font-medium text-gray-900">10</span>
            </div>
          </div>
          <button
            onClick={handleStartDailyPractice}
            disabled={quizLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {quizLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {quizLoading ? "Starting..." : (
              isDailyPracticeActive ? "Continue Daily Practice" : "Start Daily Practice"
            )}
          </button>
        </>
      ) : (
        <>
          <div className="mb-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Questions</span>
              <span className="font-medium text-gray-900">30</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Time Limit</span>
              <span className="font-medium text-gray-900">45 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Coverage</span>
              <span className="font-medium text-gray-900">Topics Covered</span>
            </div>
          </div>
          <button
            onClick={handleStartPostTest}
            disabled={quizLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {quizLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {quizLoading ? "Starting..." : "Start Post-Test"}
          </button>
        </>
      )}
    </div>
  );
}

export default DailyChallengeCard;
