import { useState, useEffect } from "react";
import { Trophy, MessageSquare, Share2, TrendingUp } from "lucide-react";
import useStudyGroupStore from "../../store/studyGroupStore";

export default function GroupLeaderboard({ groupId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getGroupLeaderboard } = useStudyGroupStore();

  useEffect(() => {
    loadLeaderboard();
  }, [groupId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getGroupLeaderboard(groupId);
      setLeaderboard(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">
            Group Leaderboard
          </h3>
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
                Member
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Quizzes
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Avg Score
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Points
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
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-600">
                  No data available
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, idx) => (
                <tr
                  key={entry.userId}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                      {idx + 1}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.user?.avatar}
                        alt={entry.user?.firstName}
                        className="h-8 w-8 rounded-full bg-slate-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {entry.user?.firstName} {entry.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {entry.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-slate-900">
                      {entry.totalQuizzes}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-medium text-slate-900">
                        {entry.avgScore}%
                      </span>
                      {entry.avgScore >= 80 && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {entry.points}
                    </span>
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
