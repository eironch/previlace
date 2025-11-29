import { Clock, Target, BookOpen, AlertCircle, CheckCircle, Calendar } from "lucide-react";

function CountdownRecommendations({ countdownPlan }) {
  if (!countdownPlan) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        Set an exam date to see your countdown plan
      </div>
    );
  }

  const { daysUntilExam, phases, dailyPlan, criticalActions, stats } = countdownPlan;

  function getPriorityColor(priority) {
    switch (priority) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "high":
        return "border-yellow-200 bg-yellow-50";
      case "medium":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  }

  function getPriorityIcon(priority) {
    switch (priority) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Days Until Exam</p>
            <p className="text-2xl font-bold text-gray-900">{daysUntilExam}</p>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.totalCards || 0}</p>
              <p className="text-xs text-gray-500">Total Cards</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{stats.masteredCards || 0}</p>
              <p className="text-xs text-gray-500">Mastered</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.avgRetention || 0}%</p>
              <p className="text-xs text-gray-500">Retention</p>
            </div>
          </div>
        )}
      </div>

      {criticalActions && criticalActions.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Target className="h-4 w-4" />
            Priority Actions
          </h4>
          <div className="space-y-2">
            {criticalActions.map((action, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border p-3 ${getPriorityColor(action.priority)}`}
              >
                {getPriorityIcon(action.priority)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.action}</p>
                  <p className="text-xs text-gray-600">{action.reason}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-gray-500">{action.timeEstimate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dailyPlan && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock className="h-4 w-4" />
            Daily Plan
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{dailyPlan.reviewTarget}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{dailyPlan.practiceMinutes}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{dailyPlan.newQuestionsTarget}</p>
              <p className="text-xs text-gray-500">New Items</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-sm font-medium text-gray-900">{dailyPlan.mockExamFrequency?.replace("_", " ")}</p>
              <p className="text-xs text-gray-500">Mock Exams</p>
            </div>
          </div>
        </div>
      )}

      {phases && phases.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <BookOpen className="h-4 w-4" />
            Study Phases
          </h4>
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="font-semibold text-gray-900">{phase.name}</h5>
                  <span className="text-xs text-gray-500">{phase.duration}</span>
                </div>
                <p className="mb-2 text-sm text-gray-600">{phase.focus}</p>
                <div className="flex flex-wrap gap-1">
                  {phase.activities.map((activity, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
                {phase.dailyGoal && (
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    <span>New: {phase.dailyGoal.newContent}%</span>
                    <span>Review: {phase.dailyGoal.review}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CountdownRecommendations;
