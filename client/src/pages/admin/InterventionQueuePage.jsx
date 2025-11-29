import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  User,
  ChevronRight,
  Shield,
  Activity,
  Eye,
  TrendingDown,
} from "lucide-react";
import useBehaviorAnalyticsStore from "@/store/behaviorAnalyticsStore";

function RiskBadge({ level }) {
  const colors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${colors[level] || colors.low}`}>
      {level}
    </span>
  );
}

function UserInterventionCard({ user, onViewDetail }) {
  return (
    <div
      onClick={() => onViewDetail(user.userId)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-black hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              user.priority === "high"
                ? "bg-red-100"
                : user.priority === "medium"
                ? "bg-yellow-100"
                : "bg-gray-100"
            }`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${
                user.priority === "high"
                  ? "text-red-600"
                  : user.priority === "medium"
                  ? "text-yellow-600"
                  : "text-gray-600"
              }`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user.user?.firstName} {user.user?.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.user?.email}</p>
          </div>
        </div>
        <RiskBadge level={user.priority} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Flagged Sessions</p>
          <p className="text-xl font-bold text-gray-900">{user.flaggedSessions}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Last Flagged</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(user.lastFlagged).toLocaleDateString()}
          </p>
        </div>
      </div>

      {user.reasons && user.reasons.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500">Reasons:</p>
          <div className="flex flex-wrap gap-2">
            {user.reasons.slice(0, 3).map((reason, idx) => (
              <span
                key={idx}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {reason}
              </span>
            ))}
            {user.reasons.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                +{user.reasons.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end text-sm text-gray-500">
        View Details
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function AtRiskUserCard({ user, onViewDetail }) {
  return (
    <div
      onClick={() => onViewDetail(user.userId)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-black"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {user.userId?.firstName} {user.userId?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.riskLevel} risk</p>
          </div>
        </div>
        <div className="flex gap-2">
          {user.riskFactors?.slice(0, 2).map((factor, idx) => (
            <span
              key={idx}
              className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700"
            >
              {factor}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InterventionQueuePage() {
  const navigate = useNavigate();
  const { interventionQueue, isLoading, fetchInterventionQueue } =
    useBehaviorAnalyticsStore();

  useEffect(() => {
    fetchInterventionQueue();
  }, [fetchInterventionQueue]);

  function handleViewDetail(userId) {
    navigate(`/admin/behavior-analytics/user/${userId}`);
  }

  const highPriority = interventionQueue?.interventionQueue?.filter(
    (u) => u.priority === "high"
  ) || [];
  const mediumPriority = interventionQueue?.interventionQueue?.filter(
    (u) => u.priority === "medium"
  ) || [];
  const lowPriority = interventionQueue?.interventionQueue?.filter(
    (u) => u.priority === "low"
  ) || [];

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/behavior-analytics")}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Intervention Queue</h1>
            <p className="text-sm text-gray-500">
              Users requiring attention based on behavior patterns
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {highPriority.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    High Priority ({highPriority.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {highPriority.map((user) => (
                    <UserInterventionCard
                      key={user.userId}
                      user={user}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              </section>
            )}

            {mediumPriority.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Medium Priority ({mediumPriority.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {mediumPriority.map((user) => (
                    <UserInterventionCard
                      key={user.userId}
                      user={user}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              </section>
            )}

            {lowPriority.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Low Priority ({lowPriority.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {lowPriority.map((user) => (
                    <UserInterventionCard
                      key={user.userId}
                      user={user}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              </section>
            )}

            {interventionQueue?.atRiskUsers?.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    At-Risk Users ({interventionQueue.atRiskUsers.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {interventionQueue.atRiskUsers.map((user) => (
                    <AtRiskUserCard
                      key={user._id}
                      user={user}
                      onViewDetail={() => handleViewDetail(user.userId?._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {!highPriority.length &&
              !mediumPriority.length &&
              !lowPriority.length &&
              !interventionQueue?.atRiskUsers?.length && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-900">
                    No users require intervention
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    All users are showing healthy behavior patterns
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
