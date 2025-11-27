import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Zap } from "lucide-react";
import useChallengeStore from "../../store/challengeStore";

export default function ChallengeLeaderboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("overall");

  const { leaderboardData, fetchChallengeLeaderboard } = useChallengeStore();

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      await fetchChallengeLeaderboard();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Challenge Leaderboard
            </h3>
          </div>

          <div className="flex gap-2">
            {["overall", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Player
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Wins
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Win Rate
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Challenges
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-600">
                  Loading leaderboard...
                </td>
              </tr>
            ) : leaderboardData.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-600">
                  No challenge data yet
                </td>
              </tr>
            ) : (
              leaderboardData.map((entry, idx) => (
                <tr
                  key={entry.userId}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-blue-200 font-semibold text-blue-700">
                      {idx + 1}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatar}
                        alt={entry.firstName}
                        className="h-8 w-8 rounded-full bg-slate-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {entry.firstName} {entry.lastName}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-900">
                        {entry.wins}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block rounded-full bg-green-200 px-3 py-1 text-sm font-semibold text-green-700">
                      {entry.winRate}%
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {entry.totalChallenges}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
