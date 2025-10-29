import { useEffect, useState } from "react";
import {
  Brain,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import Button from "@/components/ui/button1";
import useExamStore from "@/store/examStore";

function ExamReadinessPage() {
  const { examReadiness, fetchExamReadiness, loading } = useExamStore();
  const [selectedLevel, setSelectedLevel] = useState("professional");

  useEffect(() => {
    fetchExamReadiness(selectedLevel);
  }, [fetchExamReadiness, selectedLevel]);

  function getReadinessColor(score) {
    if (score >= 85) return "border-green-200 bg-green-50 text-green-600";
    if (score >= 70) return "border-yellow-200 bg-yellow-50 text-yellow-600";
    return "border-red-200 bg-red-50 text-red-600";
  }

  function getReadinessLabel(score) {
    if (score >= 90) return "Excellent - Ready to Take Exam";
    if (score >= 80) return "Good - Almost Ready";
    if (score >= 70) return "Fair - More Practice Needed";
    if (score >= 60) return "Poor - Significant Improvement Required";
    return "Very Poor - Extensive Preparation Needed";
  }

  function getPassingProbabilityColor(probability) {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <StandardHeader title="Exam Readiness" showBack={true} />
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StandardHeader title="Exam Readiness" showBack={true} />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="mb-6 flex gap-2">
          <Button
            variant={selectedLevel === "professional" ? "default" : "outline"}
            onClick={() => setSelectedLevel("professional")}
          >
            Professional Level
          </Button>
          <Button
            variant={
              selectedLevel === "sub-professional" ? "default" : "outline"
            }
            onClick={() => setSelectedLevel("sub-professional")}
          >
            Sub-Professional Level
          </Button>
        </div>

        {examReadiness && (
          <>
            <div
              className={`rounded-lg border-2 p-6 ${getReadinessColor(examReadiness.overallScore)}`}
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="relative h-32 w-32">
                    <svg
                      className="h-32 w-32 -rotate-90 transform"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${examReadiness.overallScore}, 100`}
                        className="text-current opacity-30"
                      />
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${examReadiness.overallScore}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">
                        {examReadiness.overallScore}%
                      </span>
                    </div>
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold">
                  Overall Readiness Score
                </h2>
                <p className="text-lg font-semibold">
                  {getReadinessLabel(examReadiness.overallScore)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-black">
                    Category Readiness
                  </h3>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-bold text-black">
                    {examReadiness.categoryReadiness}%
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${examReadiness.categoryReadiness}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Subject area mastery level
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-black">Consistency</h3>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-bold text-black">
                    {examReadiness.performanceConsistency}%
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{
                        width: `${examReadiness.performanceConsistency}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Performance stability
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-black">Time Efficiency</h3>
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-bold text-black">
                    {examReadiness.timeEfficiency}%
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: `${examReadiness.timeEfficiency}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Speed and accuracy balance
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-black">
                <Brain className="h-5 w-5" />
                Passing Probability Estimate
              </h3>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Based on current performance
                  </p>
                  <p className="text-lg font-semibold text-black">
                    Estimated chance of passing the {selectedLevel} level exam:
                  </p>
                </div>
                <div
                  className={`text-right ${getPassingProbabilityColor(examReadiness.estimatedPassingProbability)}`}
                >
                  <div className="text-3xl font-bold">
                    {examReadiness.estimatedPassingProbability}%
                  </div>
                </div>
              </div>
            </div>

            {examReadiness.recommendations &&
              examReadiness.recommendations.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-black">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Improvement Recommendations
                  </h3>
                  <div className="space-y-4">
                    {examReadiness.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-0.5 h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-black">
                              {rec.message}
                            </p>
                            {rec.timeframe && (
                              <p className="mt-1 text-sm text-gray-600">
                                Recommended timeframe: {rec.timeframe}
                              </p>
                            )}
                            {rec.categories && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {rec.categories.map((category) => (
                                  <span
                                    key={category}
                                    className="rounded border px-2 py-1 text-xs"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExamReadinessPage;
