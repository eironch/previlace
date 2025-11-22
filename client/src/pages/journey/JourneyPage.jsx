import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useJourneyStore from "../../store/journeyStore";
import useAuthStore from "../../store/authStore";

function JourneyPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { journey, path, loading, fetchJourney, fetchJourneyPath } = useJourneyStore();

  useEffect(() => {
    fetchJourney();
    fetchJourneyPath();
  }, []);

  function handleActivityClick(activity) {
    if (activity.isUnlocked) {
      navigate(`/activity/${activity.activityId}`);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const groupedByWeek = path.reduce((acc, activity) => {
    if (!acc[activity.weekNumber]) {
      acc[activity.weekNumber] = [];
    }
    acc[activity.weekNumber].push(activity);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Learning Journey</h1>
          <p className="text-sm text-gray-600">
            Level {journey?.level || 1} • {journey?.totalXP || 0} XP
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-600">Daily Goal</p>
            <p className="text-lg font-semibold text-gray-900">{journey?.dailyGoal || 30} min</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedByWeek).map(([weekNumber, activities]) => (
          <div key={weekNumber}>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Week {weekNumber}</h2>
            <div className="space-y-3">
              {activities.map((activity) => (
                <button
                  key={activity.activityId}
                  onClick={() => handleActivityClick(activity)}
                  disabled={!activity.isUnlocked}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    activity.isCompleted
                      ? "border-green-600 bg-green-50"
                      : activity.isUnlocked
                        ? "border-black bg-white hover:border-black hover:shadow-lg"
                        : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        {activity.isCompleted && <span className="text-green-600">✓</span>}
                        {!activity.isUnlocked && <span className="text-gray-400">🔒</span>}
                      </div>
                      <p className="text-sm text-gray-600">
                        {activity.activityType} • {activity.estimatedDuration} min • {activity.xpReward} XP
                      </p>
                      {activity.subjectName && (
                        <p className="text-xs text-gray-500">{activity.subjectName}</p>
                      )}
                    </div>
                    {activity.score !== undefined && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{activity.score}%</p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JourneyPage;
