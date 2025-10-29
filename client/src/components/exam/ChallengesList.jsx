import { useState, useEffect } from "react";
import { Trophy, Clock, Target, User } from "lucide-react";
import Button from "../ui/button1";
import useChallengeStore from "../../store/challengeStore";
import useAuthStore from "../../store/authStore";

export default function ChallengesList() {
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const {
    pendingChallenges,
    activeChallenges,
    challengeHistory,
    fetchPendingChallenges,
    fetchActiveChallenges,
    fetchChallengeHistory,
    acceptChallenge,
    declineChallenge,
  } = useChallengeStore();

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        await fetchPendingChallenges();
      } else if (activeTab === "active") {
        await fetchActiveChallenges();
      } else {
        await fetchChallengeHistory();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (challengeId) => {
    await acceptChallenge(challengeId);
    loadChallenges();
  };

  const handleDecline = async (challengeId) => {
    await declineChallenge(challengeId);
    loadChallenges();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Challenges</h1>
          <p className="mt-2 text-slate-600">
            Compete with friends and track your progress
          </p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-slate-200">
          {[
            { id: "pending", label: "Pending" },
            { id: "active", label: "In Progress" },
            { id: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-600">
            Loading challenges...
          </div>
        ) : (
          <>
            {activeTab === "pending" && (
              <div className="space-y-4">
                {pendingChallenges.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">No pending challenges</p>
                  </div>
                ) : (
                  pendingChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      status="pending"
                      onAccept={() => handleAccept(challenge._id)}
                      onDecline={() => handleDecline(challenge._id)}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "active" && (
              <div className="space-y-4">
                {activeChallenges.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">No active challenges</p>
                  </div>
                ) : (
                  activeChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      status="active"
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {challengeHistory.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">No challenge history</p>
                  </div>
                ) : (
                  challengeHistory.map((challenge) => (
                    <CompletedChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, status, onAccept, onDecline }) {
  const isChallenger =
    challenge.challengerId?._id === useAuthStore((state) => state.user?._id);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isChallenger ? "You challenged" : "Challenged by"}{" "}
            <span className="text-blue-600">
              {isChallenger
                ? challenge.opponentId?.firstName
                : challenge.challengerId?.firstName}
            </span>
          </h3>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="capitalize">{challenge.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{challenge.questionCount} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="capitalize">{challenge.difficulty}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 capitalize">
          {status}
        </div>
      </div>

      {status === "pending" && !isChallenger && (
        <div className="flex gap-2">
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Accept
          </Button>
          <Button onClick={onDecline} variant="outline" className="flex-1">
            Decline
          </Button>
        </div>
      )}

      {status === "active" && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          Challenge in progress. Complete the quiz to finish.
        </div>
      )}
    </div>
  );
}

function CompletedChallengeCard({ challenge }) {
  const isWinner =
    challenge.winner?.toString() === useAuthStore((state) => state.user?._id);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            vs {challenge.opponentId?.firstName}
          </h3>

          {isWinner && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Won</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ScoreComparison
          label="Your Score"
          score={challenge.challengerScore}
          opponentLabel={challenge.opponentId?.firstName}
          opponentScore={challenge.opponentScore}
        />
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Completed {new Date(challenge.completedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

function ScoreComparison({ label, score, opponentLabel, opponentScore }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="mb-3 text-sm font-medium text-slate-700">{label}</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Score:</span>
          <span className="font-semibold text-slate-900">
            {score?.percentage || 0}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Time:</span>
          <span className="font-semibold text-slate-900">
            {Math.floor((score?.timeSpent || 0) / 60)}m
          </span>
        </div>
      </div>
    </div>
  );
}
