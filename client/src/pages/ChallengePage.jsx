import { useEffect, useState } from "react";
import { Swords, Clock, Target, Users } from "lucide-react";
import challengeService from "@/services/challengeService.js";
import useChallengeStore from "@/store/challengeStore.js";

function ChallengePage() {
  const {
    pendingChallenges,
    activeChallenges,
    challengeStats,
    updateChallenges,
  } = useChallengeStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    try {
      const [pending, active, stats] = await Promise.all([
        challengeService.getPendingChallenges(),
        challengeService.getActiveChallenges(),
        challengeService.getUserChallengeStats(),
      ]);

      updateChallenges({
        pending: pending.challenges || [],
        active: active.challenges || [],
        stats: stats || {},
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to load challenges:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptChallenge(challengeId) {
    try {
      await challengeService.acceptChallenge(challengeId);
      loadChallenges();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to accept challenge:", error);
      }
    }
  }

  async function handleDeclineChallenge(challengeId) {
    try {
      await challengeService.declineChallenge(challengeId);
      loadChallenges();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to decline challenge:", error);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Challenges</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  TOTAL CHALLENGES
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {challengeStats.totalChallenges || 0}
                </p>
              </div>
              <Swords size={24} className="text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">WINS</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {challengeStats.wins || 0}
                </p>
              </div>
              <Target size={24} className="text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">LOSSES</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {challengeStats.losses || 0}
                </p>
              </div>
              <Users size={24} className="text-red-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">WIN RATE</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {challengeStats.winRate || 0}%
                </p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-300">
            <div className="flex">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === "pending"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending ({pendingChallenges.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === "active"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Active ({activeChallenges.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "pending" && (
              <div className="space-y-4">
                {pendingChallenges.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    No pending challenges
                  </div>
                ) : (
                  pendingChallenges.map((challenge) => (
                    <div
                      key={challenge._id}
                      className="flex items-center justify-between rounded-lg border border-gray-300 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            challenge.challengerId.avatar ||
                            "https://via.placeholder.com/48"
                          }
                          alt={challenge.challengerId.firstName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {challenge.challengerId.firstName}{" "}
                            {challenge.challengerId.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {challenge.type.charAt(0).toUpperCase() +
                              challenge.type.slice(1)}{" "}
                            • {challenge.questionCount} questions
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptChallenge(challenge._id)}
                          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineChallenge(challenge._id)}
                          className="rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-400"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "active" && (
              <div className="space-y-4">
                {activeChallenges.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    No active challenges
                  </div>
                ) : (
                  activeChallenges.map((challenge) => (
                    <div
                      key={challenge._id}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              challenge.opponentId.avatar ||
                              "https://via.placeholder.com/48"
                            }
                            alt={challenge.opponentId.firstName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              vs {challenge.opponentId.firstName}{" "}
                              {challenge.opponentId.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {challenge.type.charAt(0).toUpperCase() +
                                challenge.type.slice(1)}{" "}
                              Challenge
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock size={16} />
                          {challenge.timeLimit}s
                        </div>
                      </div>
                      <button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
                        Continue Quiz
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengePage;
