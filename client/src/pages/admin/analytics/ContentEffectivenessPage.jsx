import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, AlertTriangle, BarChart3, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import useAdminAnalyticsStore from "@/store/adminAnalyticsStore";

function PassRateBadge({ rate }) {
  const getColor = () => {
    if (rate >= 80) return "bg-green-50 text-green-700";
    if (rate >= 60) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getColor()}`}>
      {rate}%
    </span>
  );
}

function TopicRow({ topic, rank }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 pr-4 text-sm text-gray-500">{rank}</td>
      <td className="py-3 pr-4">
        <span className="text-sm font-medium text-gray-900">{topic.name}</span>
      </td>
      <td className="py-3 pr-4 text-right">
        <PassRateBadge rate={topic.passRate} />
      </td>
      <td className="py-3 pr-4 text-right text-sm text-gray-600">
        {topic.totalAttempts.toLocaleString()}
      </td>
      <td className="py-3 text-right text-sm text-gray-600">{topic.totalQuestions}</td>
    </tr>
  );
}

function DifficultQuestionCard({ question }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{question.topicName}</p>
          <p className="mt-1 text-xs text-gray-500">
            Difficulty: {question.difficulty}
          </p>
        </div>
        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
          {question.failureRate}% fail
        </span>
      </div>
    </div>
  );
}

export default function ContentEffectivenessPage() {
  const navigate = useNavigate();
  const { contentEffectiveness, subjectCompletion, isLoading, fetchAllContentData } = useAdminAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  useEffect(() => {
    fetchAllContentData();
  }, [fetchAllContentData]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAllContentData();
    setRefreshing(false);
  }

  const topics = contentEffectiveness?.topicEffectiveness || [];
  const difficultQuestions = contentEffectiveness?.difficultQuestions || [];
  const subjects = subjectCompletion || [];

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 10);
  const lowestTopics = topics.slice(0, 5);
  const highestTopics = [...topics].sort((a, b) => b.passRate - a.passRate).slice(0, 5);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/behavior-analytics")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Content Effectiveness</h1>
              <p className="text-sm text-gray-500">Analyze topic and question performance</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {isLoading && !contentEffectiveness ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <BookOpen className="h-5 w-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Topics</p>
                    <p className="text-xl font-bold text-gray-900">
                      {contentEffectiveness?.totalTopics || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <BarChart3 className="h-5 w-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="text-xl font-bold text-gray-900">
                      {contentEffectiveness?.totalQuestions?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Difficult Questions</p>
                    <p className="text-xl font-bold text-gray-900">
                      {difficultQuestions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Lowest Pass Rate Topics</h3>
                <div className="space-y-3">
                  {lowestTopics.map((topic, i) => (
                    <div key={topic.topicId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{i + 1}.</span>
                        <span className="text-sm text-gray-900">{topic.name}</span>
                      </div>
                      <PassRateBadge rate={topic.passRate} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Highest Pass Rate Topics</h3>
                <div className="space-y-3">
                  {highestTopics.map((topic, i) => (
                    <div key={topic.topicId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{i + 1}.</span>
                        <span className="text-sm text-gray-900">{topic.name}</span>
                      </div>
                      <PassRateBadge rate={topic.passRate} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {difficultQuestions.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  High-Failure Questions
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Questions with failure rate above 50%
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {difficultQuestions.slice(0, 9).map((q) => (
                    <DifficultQuestionCard key={q.questionId} question={q} />
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Topics by Pass Rate</h3>
                <span className="text-sm text-gray-500">{topics.length} topics</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-500">#</th>
                      <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-500">Topic</th>
                      <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Pass Rate</th>
                      <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Attempts</th>
                      <th className="pb-3 text-right text-xs font-medium text-gray-500">Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTopics.map((topic, i) => (
                      <TopicRow key={topic.topicId} topic={topic} rank={i + 1} />
                    ))}
                  </tbody>
                </table>
              </div>
              {topics.length > 10 && (
                <button
                  onClick={() => setShowAllTopics(!showAllTopics)}
                  className="mt-4 flex w-full items-center justify-center gap-1 text-sm text-gray-600 hover:text-black"
                >
                  {showAllTopics ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show all {topics.length} topics <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {subjects.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Subject Mastery Rates</h3>
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.subjectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                        <span className="text-sm text-gray-500">
                          {subject.masteryRate}% mastered
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-black transition-all"
                          style={{ width: `${subject.masteryRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{subject.uniqueUsers} users</span>
                        <span>{subject.totalReviews.toLocaleString()} reviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
