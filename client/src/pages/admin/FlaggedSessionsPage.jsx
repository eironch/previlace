import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  User,
  Check,
  Filter,
  Search,
} from "lucide-react";
import useBehaviorAnalyticsStore from "@/store/behaviorAnalyticsStore";

function ScoreBadge({ score, label }) {
  const getColor = (s) => {
    if (s >= 90) return "bg-green-50 text-green-700";
    if (s >= 70) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className="flex flex-col items-center">
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getColor(score)}`}>
        {Math.round(score)}%
      </span>
      <span className="mt-1 text-xs text-gray-500">{label}</span>
    </div>
  );
}

function FlaggedSessionCard({ session, onReview, onViewUser }) {
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitReview() {
    setSubmitting(true);
    try {
      await onReview(session._id, { reviewNotes });
      setShowReviewForm(false);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to submit review:", error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <button
              onClick={() => onViewUser(session.userId?._id)}
              className="text-lg font-semibold text-gray-900 hover:underline"
            >
              {session.userId?.firstName} {session.userId?.lastName}
            </button>
            <p className="text-sm text-gray-500">{session.userId?.email}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {new Date(session.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <ScoreBadge score={session.integrityScore} label="Integrity" />
          <ScoreBadge score={session.engagementScore} label="Engagement" />
          <ScoreBadge score={session.focusScore} label="Focus" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700">Flag Reasons:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {session.flagReasons?.map((reason, idx) => (
            <span
              key={idx}
              className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm font-medium text-gray-900">
            {Math.round((session.totalDuration || 0) / 60000)} min
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Integrity Events</p>
          <p className="text-sm font-medium text-gray-900">
            {session.integrityEvents?.length || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Questions</p>
          <p className="text-sm font-medium text-gray-900">
            {session.questionTimings?.length || 0}
          </p>
        </div>
      </div>

      {session.integrityEvents && session.integrityEvents.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Event Timeline:</p>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
            {session.integrityEvents.slice(0, 10).map((event, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1 text-xs">
                <span className="font-mono text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="rounded bg-gray-200 px-2 py-0.5 text-gray-700">
                  {event.type.replace(/_/g, " ")}
                </span>
                {event.duration && (
                  <span className="text-gray-500">
                    {(event.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            ))}
            {session.integrityEvents.length > 10 && (
              <p className="mt-2 text-xs text-gray-500">
                +{session.integrityEvents.length - 10} more events
              </p>
            )}
          </div>
        </div>
      )}

      {showReviewForm ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add review notes (optional)..."
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {submitting ? "Submitting..." : "Mark Reviewed"}
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Check className="h-4 w-4" />
            Review
          </button>
          <button
            onClick={() => onViewUser(session.userId?._id)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            View User
          </button>
        </div>
      )}
    </div>
  );
}

export default function FlaggedSessionsPage() {
  const navigate = useNavigate();
  const { flaggedSessions, isLoading, fetchFlaggedSessions, reviewSession } =
    useBehaviorAnalyticsStore();

  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFlaggedSessions({ reviewed: filter === "reviewed" ? true : filter === "pending" ? false : undefined });
  }, [filter, fetchFlaggedSessions]);

  function handleViewUser(userId) {
    navigate(`/admin/behavior-analytics/user/${userId}`);
  }

  const filteredSessions = flaggedSessions?.filter((session) => {
    if (!searchQuery) return true;
    const name = `${session.userId?.firstName} ${session.userId?.lastName}`.toLowerCase();
    const email = session.userId?.email?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

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
            <h1 className="text-xl font-bold text-gray-900">Flagged Sessions</h1>
            <p className="text-sm text-gray-500">Review sessions with integrity concerns</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            >
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : filteredSessions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">No flagged sessions</p>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "pending"
                ? "All sessions have been reviewed"
                : "No sessions match your criteria"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions?.map((session) => (
              <FlaggedSessionCard
                key={session._id}
                session={session}
                onReview={reviewSession}
                onViewUser={handleViewUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
