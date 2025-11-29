import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useExamStore from "@/store/examStore";
import dssService from "@/services/dssService";
import ReadinessBreakdown from "@/components/analytics/ReadinessBreakdown";
import CountdownRecommendations from "@/components/analytics/CountdownRecommendations";

function ExamReadinessPage() {
  const navigate = useNavigate();
  const { examReadiness, fetchExamReadiness, loading } = useExamStore();
  const [selectedLevel, setSelectedLevel] = useState("professional");
  const [examDate, setExamDate] = useState("");
  const [countdownPlan, setCountdownPlan] = useState(null);
  const [countdownLoading, setCountdownLoading] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    fetchExamReadiness(selectedLevel);
  }, [fetchExamReadiness, selectedLevel]);

  async function handleSetExamDate(date) {
    setExamDate(date);
    if (!date) {
      setCountdownPlan(null);
      return;
    }

    setCountdownLoading(true);
    try {
      const response = await dssService.getExamCountdownPlan(date, selectedLevel);
      if (response.success) {
        setCountdownPlan(response.data);
        setShowCountdown(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch countdown plan:", error);
      }
    } finally {
      setCountdownLoading(false);
    }
  }

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
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Exam Readiness</h1>
          </div>
        </div>
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Exam Readiness</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLevel("professional")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedLevel === "professional"
                  ? "bg-black text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => setSelectedLevel("sub-professional")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedLevel === "sub-professional"
                  ? "bg-black text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sub-Professional
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={examDate}
              onChange={(e) => handleSetExamDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="Set exam date"
            />
          </div>
        </div>

        {examReadiness && (
          <>
            <div className={`rounded-lg border-2 p-6 ${getReadinessColor(examReadiness.overallScore)}`}>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="relative h-32 w-32">
                    <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 36 36">
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
                      <span className="text-3xl font-bold">{examReadiness.overallScore}%</span>
                    </div>
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold">Overall Readiness Score</h2>
                <p className="text-lg font-semibold">{getReadinessLabel(examReadiness.overallScore)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category Readiness</span>
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{examReadiness.categoryReadiness}%</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${examReadiness.categoryReadiness}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Consistency</span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{examReadiness.performanceConsistency}%</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${examReadiness.performanceConsistency}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Efficiency</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{examReadiness.timeEfficiency}%</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${examReadiness.timeEfficiency}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Passing Probability</h3>
                </div>
                <div className={`text-3xl font-bold ${getPassingProbabilityColor(examReadiness.estimatedPassingProbability)}`}>
                  {examReadiness.estimatedPassingProbability}%
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Based on current performance for {selectedLevel} level exam
              </p>
            </div>

            {countdownPlan && (
              <div className="rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() => setShowCountdown(!showCountdown)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">
                      Exam Countdown Plan ({countdownPlan.daysUntilExam} days)
                    </h3>
                  </div>
                  {showCountdown ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {showCountdown && (
                  <div className="border-t border-gray-200 p-4">
                    {countdownLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                      </div>
                    ) : (
                      <CountdownRecommendations countdownPlan={countdownPlan} />
                    )}
                  </div>
                )}
              </div>
            )}

            {examReadiness.recommendations && examReadiness.recommendations.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Improvement Recommendations
                </h3>
                <div className="space-y-3">
                  {examReadiness.recommendations.map((rec, index) => (
                    <div key={index} className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="font-medium text-gray-900">{rec.message}</p>
                      {rec.timeframe && (
                        <p className="mt-1 text-sm text-gray-600">Timeframe: {rec.timeframe}</p>
                      )}
                      {rec.categories && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rec.categories.map((category) => (
                            <span
                              key={category}
                              className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(examReadiness.subjectReadiness || countdownPlan?.atRiskTopics) && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Detailed Breakdown</h3>
                <ReadinessBreakdown
                  subjects={examReadiness.subjectReadiness}
                  atRiskTopics={countdownPlan?.atRiskTopics}
                />
              </div>
            )}
          </>
        )}

        {!examReadiness && !loading && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12">
            <Target className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No readiness data available yet.</p>
            <p className="mt-1 text-sm text-gray-400">Start taking quizzes to see your exam readiness.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamReadinessPage;
