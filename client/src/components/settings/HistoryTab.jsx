import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { useNavigate } from "react-router-dom";

export default function HistoryTab() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  const [filters, setFilters] = useState({
    mode: "",
    status: "",
    examLevel: ""
  });

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, filters]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...filters
      });
      
      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) queryParams.delete(key);
      });

      const response = await apiClient.get(`/exam/history?${queryParams}`);
      
      if (response.data.success) {
        setHistory(response.data.data.sessions);
        setPagination(prev => ({
          ...prev,
          ...response.data.data.pagination
        }));
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatTime = (ms) => {
    if (!ms) return "0m 0s";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getModeLabel = (mode) => {
    const modes = {
      "practice": "Practice Quiz",
      "timed": "Timed Quiz",
      "mock": "Mock Exam",
      "assessment": "Assessment",
      "daily-practice": "Daily Practice",
      "post-test": "Post-Test",
      "pretest": "Pre-Test"
    };
    return modes[mode] || mode;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "active": return "bg-blue-100 text-blue-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "abandoned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Test History</h2>
            <p className="text-gray-500 text-sm mt-1">View your past quiz attempts and performance.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={filters.mode}
              onChange={(e) => handleFilterChange("mode", e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
            >
              <option value="">All Modes</option>
              <option value="practice">Practice</option>
              <option value="mock">Mock Exam</option>
              <option value="daily-practice">Daily Practice</option>
              <option value="post-test">Post-Test</option>
              <option value="pretest">Pre-Test</option>
            </select>

            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="active">In Progress</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                    <td className="px-4 py-4"><div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : history.length > 0 ? (
                history.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(session.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {getModeLabel(session.mode)}
                    </td>
                    <td className="px-4 py-4">
                      {session.status === 'completed' ? (
                        <span className={`font-bold ${
                          session.score.percentage >= 75 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {session.score.percentage}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatTime(session.timing?.totalTimeSpent)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {session.status === 'completed' && (
                        <button 
                          onClick={() => navigate(`/dashboard/quiz/results/${session._id}`)}
                          className="text-sm font-medium text-black hover:underline"
                        >
                          View Results
                        </button>
                      )}
                      {session.status === 'active' && (
                        <button 
                          onClick={() => navigate(`/dashboard/quiz-session`)}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <p>No history found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
