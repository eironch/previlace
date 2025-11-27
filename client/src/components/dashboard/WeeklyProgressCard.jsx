import { useEffect } from "react";
import { Calendar, CheckCircle, Circle, Clock } from "lucide-react";
import useActivityStore from "@/store/activityStore";

function WeeklyProgressCard() {
  const { weeklyProgress: progress, fetchWeeklyProgress, loading, error } = useActivityStore();

  useEffect(() => {
    fetchWeeklyProgress();
  }, [fetchWeeklyProgress]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            <p className="text-sm text-gray-500">Unable to load progress</p>
          </div>
        </div>
        <button
          onClick={fetchWeeklyProgress}
          className="mt-4 w-full rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (progress.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 mx-auto mb-3">
          <Calendar className="h-6 w-6 text-gray-900" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Activities Yet</h3>
        <p className="text-sm text-gray-500 mt-1">Complete your first daily challenge</p>
      </div>
    );
  }

  const completedCount = progress.filter((p) => p.status === "completed" || p.status === "perfect").length;
  const totalCount = progress.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            <p className="text-sm text-gray-500">Monday to Friday challenges</p>
          </div>
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1">
          <span className="text-sm font-semibold text-gray-900">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-black transition-all" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {progress.map((day, index) => {
          const isCompleted = day.status === "completed" || day.status === "perfect";
          const isInProgress = day.status === "in_progress";
          const isLocked = day.status === "locked";

          return (
            <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isInProgress ? (
                  <Circle className="h-5 w-5 text-black" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
                <div>
                  <p className={`text-sm font-medium ${isLocked ? "text-gray-400" : "text-gray-900"}`}>
                    {day.dayName}
                  </p>
                  {day.activity && <p className="text-xs text-gray-500">{day.activity}</p>}
                </div>
              </div>

              {isCompleted && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-900">{day.score}%</span>
                  {day.timeSpent && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(day.timeSpent / 60)}m</span>
                    </div>
                  )}
                </div>
              )}

              {isInProgress && <span className="text-xs font-medium text-gray-900">In Progress</span>}

              {isLocked && <span className="text-xs font-medium text-gray-400">Upcoming</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyProgressCard;
