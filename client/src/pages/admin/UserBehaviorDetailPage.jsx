import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Activity,
  Eye,
  Target,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import useBehaviorAnalyticsStore from "@/store/behaviorAnalyticsStore";
import useAdminAnalyticsStore from "@/store/adminAnalyticsStore";
import BehaviorTrendChart from "@/components/admin/charts/BehaviorTrendChart";

function ScoreCard({ title, score, icon: Icon, trend }) {
  function getScoreColor(s) {
    if (s >= 90) return "text-green-600";
    if (s >= 70) return "text-yellow-600";
    return "text-red-600";
  }

  function getTrendIcon() {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />;
    if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        {getTrendIcon()}
      </div>
      <p className={`mt-3 text-3xl font-bold ${getScoreColor(score)}`}>
        {Math.round(score)}%
      </p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

function TimelineEvent({ event, isLast }) {
  function getEventColor() {
    if (event.flagged) return "bg-red-500";
    if (event.integrityScore < 70) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${getEventColor()}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200" />}
      </div>
      <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {event.quiz?.title || "Quiz Session"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(event.date).toLocaleString()}
              </p>
            </div>
            {event.flagged && (
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                Flagged
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{event.integrityScore}%</p>
              <p className="text-xs text-gray-500">Integrity</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{event.focusScore}%</p>
              <p className="text-xs text-gray-500">Focus</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{event.duration} min</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{event.integrityEventCount}</p>
              <p className="text-xs text-gray-500">Events</p>
            </div>
          </div>
          {event.quiz?.score !== undefined && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">
                Score: {event.quiz.score}/{event.quiz.total} ({Math.round((event.quiz.score / event.quiz.total) * 100)}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskFactorsList({ factors }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm">No risk factors identified</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {factors.map((factor, idx) => (
        <div key={idx} className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{factor}</span>
        </div>
      ))}
    </div>
  );
}

export default function UserBehaviorDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { userDetail, isLoading, fetchUserDetail } = useBehaviorAnalyticsStore();
  const { userTimeline, fetchUserTimeline } = useAdminAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (userId) {
      fetchUserDetail(userId);
      fetchUserTimeline(userId, 30);
    }
  }, [userId, fetchUserDetail, fetchUserTimeline]);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchUserDetail(userId), fetchUserTimeline(userId, 30)]);
    setRefreshing(false);
  }

  const profile = userDetail?.profile;
  const stats = userDetail?.stats;
  const sessions = userDetail?.recentSessions || [];
  const timeline = userTimeline || [];

  const trendData = timeline.map((t) => ({
    date: t.date,
    integrity: t.integrityScore,
    engagement: t.engagementScore,
    focus: t.focusScore,
  }));

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.userId?.firstName} {profile?.userId?.lastName}
              </h1>
              <p className="text-sm text-gray-500">{profile?.userId?.email}</p>
            </div>
            {profile?.riskLevel && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  profile.riskLevel === "high"
                    ? "bg-red-50 text-red-700"
                    : profile.riskLevel === "medium"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {profile.riskLevel} risk
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4">
          {["overview", "timeline", "sessions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <ScoreCard
                    title="Avg Integrity"
                    score={profile?.averageIntegrityScore || 100}
                    icon={Shield}
                  />
                  <ScoreCard
                    title="Avg Engagement"
                    score={profile?.averageEngagementScore || 100}
                    icon={Activity}
                  />
                  <ScoreCard
                    title="Avg Focus"
                    score={profile?.averageFocusScore || 100}
                    icon={Eye}
                  />
                  <ScoreCard
                    title="Avg Confidence"
                    score={profile?.averageConfidenceScore || 100}
                    icon={Target}
                  />
                </div>

                {trendData.length > 0 && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      30-Day Behavior Trends
                    </h3>
                    <BehaviorTrendChart data={trendData} />
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Behavior Profile
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Total Quizzes</span>
                        <span className="font-medium text-gray-900">
                          {profile?.totalQuizzesTaken || 0}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Learning Pace</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {profile?.learningPace || "moderate"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Avg Session Duration</span>
                        <span className="font-medium text-gray-900">
                          {Math.round((profile?.averageSessionDuration || 0) / 60000)} min
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Avg Question Time</span>
                        <span className="font-medium text-gray-900">
                          {Math.round((profile?.averageQuestionTime || 30000) / 1000)}s
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Tab Switch Rate</span>
                        <span className="font-medium text-gray-900">
                          {profile?.baselineTabSwitchRate?.toFixed(1) || 0} per session
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Answer Change Rate</span>
                        <span className="font-medium text-gray-900">
                          {profile?.typicalAnswerChangeRate?.toFixed(1) || 0} per question
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Risk Assessment</h3>
                    <RiskFactorsList factors={profile?.riskFactors} />

                    {profile?.optimalRetention && (
                      <div className="mt-6 rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">FSRS Optimal Retention</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(profile.optimalRetention * 100).toFixed(0)}%
                        </p>
                        {profile.lastOptimizedAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            Last optimized: {new Date(profile.lastOptimizedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {stats && (
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <p className="text-xl font-bold text-gray-900">{stats.totalSessions || 0}</p>
                          <p className="text-xs text-gray-500">Total Sessions</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <p className="text-xl font-bold text-gray-900">{stats.flaggedCount || 0}</p>
                          <p className="text-xs text-gray-500">Flagged</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-6 text-lg font-semibold text-gray-900">Session Timeline</h3>
                  {timeline.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8" />
                      <p className="mt-2">No timeline data available</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {timeline.map((event, index) => (
                        <TimelineEvent
                          key={event.id || index}
                          event={event}
                          isLast={index === timeline.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">All Sessions</h3>
                    <span className="text-sm text-gray-500">{sessions.length} sessions</span>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Activity className="h-8 w-8" />
                      <p className="mt-2">No session data available</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-500">Date</th>
                            <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-500">Quiz</th>
                            <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Integrity</th>
                            <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Focus</th>
                            <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Duration</th>
                            <th className="pb-3 text-right text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((session) => (
                            <tr key={session._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 pr-4 text-sm text-gray-600">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 pr-4 text-sm text-gray-900">
                                {session.quizAttemptId?.title || "Quiz"}
                              </td>
                              <td className="py-3 pr-4 text-right text-sm">
                                <span className={session.integrityScore < 70 ? "text-red-600" : "text-gray-900"}>
                                  {session.integrityScore}%
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-right text-sm text-gray-900">
                                {session.focusScore}%
                              </td>
                              <td className="py-3 pr-4 text-right text-sm text-gray-600">
                                {Math.round((session.totalDuration || 0) / 60000)} min
                              </td>
                              <td className="py-3 text-right">
                                {session.flaggedForReview ? (
                                  <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                    Flagged
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                    Clean
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
