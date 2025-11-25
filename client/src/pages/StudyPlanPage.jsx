import { useState } from "react";
import {
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import Button from "@/components/ui/Button";
import useStudyPlanStore from "@/store/studyPlanStore";

function StudyPlanPage() {
  const { generateStudyPlan, activePlan: studyPlan, loading, error } = useStudyPlanStore();
  const [targetDate, setTargetDate] = useState("");

  function handleGenerate() {
    if (targetDate) {
      generateStudyPlan(targetDate);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getDaysRemaining(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function getWeekProgress(weekNumber) {
    const today = new Date();
    const planStart = new Date(studyPlan?.startDate);
    const currentWeek = Math.ceil(
      (today - planStart) / (1000 * 60 * 60 * 24 * 7)
    );

    if (weekNumber < currentWeek) return 100;
    if (weekNumber === currentWeek) return 50;
    return 0;
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  }

  if (!studyPlan && !loading) {
    return (
      <div className="min-h-screen bg-white">
        <StandardHeader title="Study Plan" />

        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Generate Your Study Plan
            </h2>
            <p className="text-gray-400">
              Create a personalized study plan based on your target exam date
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="targetDate"
                  className="text-sm font-medium text-black"
                >
                  Target Exam Date
                </label>
                <input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={
                    new Date(Date.now() + 86400000).toISOString().split("T")[0]
                  }
                  max={
                    new Date(Date.now() + 365 * 86400000)
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black"
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!targetDate || loading}
                className="w-full"
              >
                {loading ? "Generating Plan..." : "Generate Study Plan"}
              </Button>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">
                  What Your Study Plan Includes:
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>Weekly study schedule tailored to your weak areas</li>
                  <li>Daily question targets and study time goals</li>
                  <li>Progress milestones and assessments</li>
                  <li>Personalized recommendations based on performance</li>
                  <li>Adaptive adjustments as you improve</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !studyPlan) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(studyPlan.targetExamDate);
  const currentWeek = Math.ceil(
    (new Date() - new Date(studyPlan.startDate)) / (1000 * 60 * 60 * 24 * 7)
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Study Plan</h1>
          <p className="text-gray-600">Track your progress and stay on schedule</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Days Remaining
                </p>
                <p className="text-2xl font-bold text-black">{daysRemaining}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Target Date</p>
                <p className="text-sm font-bold text-black">
                  {formatDate(studyPlan.targetExamDate)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Daily Study Time
                </p>
                <p className="text-2xl font-bold text-black">
                  {studyPlan.dailyStudyTime}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Readiness Score
                </p>
                <p className="text-2xl font-bold text-black">
                  {studyPlan.currentReadinessScore}%
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">
              Weekly Schedule
            </h3>
            <div className="space-y-4">
              {studyPlan.weeklySchedule?.map((week) => (
                <div
                  key={week.week}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-black">
                      Week {week.week}
                    </h4>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${week.week === currentWeek ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {week.focus}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${getWeekProgress(week.week)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Goals:</strong> {week.goals?.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">Milestones</h3>
            <div className="space-y-4">
              {studyPlan.milestones?.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="mt-1">
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-black">
                      {milestone.description}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Week {milestone.week}, Day {milestone.day}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded border px-2 py-1 text-xs">
                        {milestone.assessmentType}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                        Target: {milestone.targetReadinessScore}%
                      </span>
                      {milestone.actualScore && (
                        <span
                          className={`rounded px-2 py-1 text-xs ${milestone.actualScore >= milestone.targetReadinessScore ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          Actual: {milestone.actualScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {studyPlan.recommendations && studyPlan.recommendations.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">
              Recommendations
            </h3>
            <div className="space-y-3">
              {studyPlan.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded border px-2 py-1 text-xs font-medium capitalize">
                      {rec.priority} Priority
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-black">{rec.message}</p>
                      {rec.actions && rec.actions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                          {rec.actions.map((action, actionIndex) => (
                            <li key={actionIndex}>{action}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 rounded-lg border border-white bg-transparent px-4 py-2 font-medium text-white hover:bg-white hover:text-black"
          >
            Generate New Plan
          </button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            Update Progress
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StudyPlanPage;
