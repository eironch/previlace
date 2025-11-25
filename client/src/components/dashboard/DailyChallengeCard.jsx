import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Trophy, CheckCircle } from "lucide-react";
import usePostTestStore from "@/store/postTestStore";
import useExamStore from "@/store/examStore";
import useDashboardStore from "@/store/dashboardStore";
import weekendClassService from "@/services/weekendClassService";

const getDayName = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

function DailyChallengeCard() {
  const navigate = useNavigate();
  const { studyPlan: activePlan, isLoading: dashboardLoading } = useDashboardStore();
  const { postTestStatus, fetchPostTestStatus, loading: postTestLoading } = usePostTestStore();
  const { startQuizSession, loading: quizLoading } = useExamStore();
  const [weekendClass, setWeekendClass] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [error, setError] = useState(null);

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
    if (isWeekend) {
      const fetchClass = async () => {
        try {
          const data = await weekendClassService.getUpcomingClass();
          setWeekendClass(data);
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to fetch weekend class", error);
          }
        }
      };
      fetchClass();
    }
  }, [isWeekend]);

  async function handleStartQuiz() {
    if (!currentWeek) return;
    
    try {
      setError(null);
      
      const previousWeekPostTest = postTestStatus.find(
        (s) => s.weekNumber === currentWeek.weekNumber - 1 && s.completed
      );
      
      const currentWeekPostTest = postTestStatus.find(
        (s) => s.weekNumber === currentWeek.weekNumber && s.completed
      );

      if (!currentWeekPostTest) {
        await startQuizSession({
          mode: "post-test",
          weekNumber: currentWeek.weekNumber,
        });
      } else if (currentWeek.weekNumber === 1 || previousWeekPostTest) {
        await startQuizSession({
          mode: "assessment",
          currentWeekNumber: currentWeek.weekNumber,
        });
      } else {
        setError("Please complete the previous week's post-test first");
        return;
      }
      
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Start quiz error:", err);
      }
      setError(err.message || "Failed to start quiz");
    }
  }

  if (postTestLoading || dashboardLoading || !activePlan) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-300"></div>;
  }

  if (isWeekend) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Target className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekend Class</h3>
            <p className="text-sm text-gray-500">Weekend class schedule</p>
          </div>
        </div>
        {weekendClass ? (
          <div className="rounded-lg border border-gray-300 bg-white p-4">
            <h4 className="font-bold text-gray-900">{weekendClass.topic}</h4>
            <p className="mb-2 text-sm text-gray-600">{weekendClass.description}</p>
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
              <span>{weekendClass.startTime} - {weekendClass.endTime}</span>
            </div>
            {weekendClass.meetingLink && (
              <a 
                href={weekendClass.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block w-full rounded-lg bg-black px-4 py-2 text-center text-sm font-semibold text-white hover:bg-gray-800"
              >
                Join Class
              </a>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No class scheduled for today.
          </div>
        )}
      </div>
    );
  }

  if (!currentWeek) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Target className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Practice</h3>
            <p className="text-sm text-gray-500">No active week</p>
          </div>
        </div>
      </div>
    );
  }

  const previousWeekPostTest = postTestStatus.find(
    (s) => s.weekNumber === currentWeek.weekNumber - 1 && s.completed
  );
  
  const currentWeekPostTest = postTestStatus.find(
    (s) => s.weekNumber === currentWeek.weekNumber && s.completed
  );

  const isPostTestCompleted = !!currentWeekPostTest;
  const canAccessDailyPractice = currentWeek.weekNumber === 1 || previousWeekPostTest;
  const showPostTest = !isPostTestCompleted;
  const showDailyPractice = isPostTestCompleted && canAccessDailyPractice;

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {showPostTest ? "Post-Test" : "Daily Practice"}
            </h3>
            <p className="text-sm text-gray-500">
              {showPostTest ? "Complete this week's assessment" : "Mixed review questions"}
            </p>
          </div>
        </div>
        {!isPostTestCompleted && (
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <Trophy className="h-4 w-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">+30 XP</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {showPostTest ? (
        <>
          <p className="mb-4 text-gray-600">
            30 questions covering this week's class topics
          </p>
          <button
            onClick={handleStartQuiz}
            disabled={quizLoading}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            Start Post-Test
          </button>
        </>
      ) : showDailyPractice ? (
        <>
          <p className="mb-4 text-gray-600">
            20 questions reviewing previous weeks and key concepts
          </p>
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Post-Test Completed</span>
          </div>
          <button
            onClick={handleStartQuiz}
            disabled={quizLoading}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            Start Daily Practice
          </button>
        </>
      ) : (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-sm font-medium text-yellow-800">
            Complete the previous week's Post-Test to unlock Daily Practice
          </p>
        </div>
      )}
    </div>
  );
}

export default DailyChallengeCard;
