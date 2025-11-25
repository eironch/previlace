import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Lock, Play, TrendingUp } from "lucide-react";
import usePostTestStore from "@/store/postTestStore";
import useExamStore from "@/store/examStore";
import useStudyPlanStore from "@/store/studyPlanStore";

function WeeklyQuizCard() {
  const navigate = useNavigate();
  const { activePlan, fetchActivePlan } = useStudyPlanStore();
  const { postTestStatus, pretestAvailable, fetchPostTestStatus, checkPretestAvailability, loading } = usePostTestStore();
  const { startQuizSession, loading: quizLoading } = useExamStore();
  const [currentWeek, setCurrentWeek] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivePlan();
    fetchPostTestStatus();
    checkPretestAvailability();
  }, [fetchActivePlan, fetchPostTestStatus, checkPretestAvailability]);

  useEffect(() => {
    if (activePlan?.weeks) {
      const today = new Date();
      const current = activePlan.weeks.find((week) => {
        const start = new Date(week.startDate);
        const end = new Date(week.endDate);
        return today >= start && today <= end;
      });
      setCurrentWeek(current);
    }
  }, [activePlan]);

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

  async function handleStartAssessment() {
    if (!currentWeek) return;
    
    try {
      setError(null);
      await startQuizSession({
        mode: "assessment",
        currentWeekNumber: currentWeek.weekNumber,
      });
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Start assessment error:", err);
      }
      setError(err.message || "Failed to start assessment");
    }
  }

  async function handleStartPretest() {
    try {
      setError(null);
      await startQuizSession({
        mode: "pretest",
      });
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Start pretest error:", err);
      }
      setError(err.message || "Failed to start pretest");
    }
  }

  if (loading || !activePlan) {
    return null;
  }

  const postTestCompleted = currentWeek ? postTestStatus.find((s) => s.weekNumber === currentWeek.weekNumber && s.completed) : null;
  const showPretest = pretestAvailable && currentWeek?.weekNumber === 1;

  if (!currentWeek && !showPretest) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Review</h3>
        {currentWeek && (
          <span className="text-sm font-medium text-gray-600">Week {currentWeek.weekNumber}</span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {showPretest && (
          <button
            onClick={handleStartPretest}
            disabled={quizLoading}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-black hover:shadow-md disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <TrendingUp className="h-5 w-5 text-gray-900" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Week 0 Pretest</p>
                <p className="text-xs text-gray-500">Assess your baseline knowledge</p>
              </div>
            </div>
            <Play className="h-5 w-5 text-gray-400" />
          </button>
        )}

        {currentWeek && (
          <>
            <button
              onClick={handleStartPostTest}
              disabled={quizLoading || postTestCompleted}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-black hover:shadow-md disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${postTestCompleted ? "bg-green-50" : "bg-gray-100"}`}>
                  {postTestCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Play className="h-5 w-5 text-gray-900" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Post-Test</p>
                  <p className="text-xs text-gray-500">
                    {postTestCompleted ? "Completed" : "Test your week's learning"}
                  </p>
                </div>
              </div>
              {!postTestCompleted && <Play className="h-5 w-5 text-gray-400" />}
            </button>

            <button
              onClick={handleStartAssessment}
              disabled={quizLoading}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-black hover:shadow-md disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <TrendingUp className="h-5 w-5 text-gray-900" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Assessment</p>
                  <p className="text-xs text-gray-500">
                    Mixed practice questions
                  </p>
                </div>
              </div>
              <Play className="h-5 w-5 text-gray-400" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default WeeklyQuizCard;
