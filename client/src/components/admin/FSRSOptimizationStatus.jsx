import { useState } from "react";
import { RefreshCw, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

function FSRSOptimizationStatus({ data, onTriggerOptimization, isOptimizing }) {
  const [selectedUsers, setSelectedUsers] = useState([]);

  if (!data) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-500">
        No optimization data available
      </div>
    );
  }

  const { totalUsers, optimizedUsers, pendingOptimization, lastBatchOptimized, pendingList } = data;
  const optimizationRate = totalUsers > 0 ? Math.round((optimizedUsers / totalUsers) * 100) : 0;

  function handleSelectAll() {
    if (selectedUsers.length === pendingList?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingList?.map((u) => u.userId) || []);
    }
  }

  function handleTrigger() {
    if (onTriggerOptimization && selectedUsers.length > 0) {
      onTriggerOptimization(selectedUsers);
      setSelectedUsers([]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Total Users</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-900">{totalUsers || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Optimized</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-900">{optimizedUsers || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-900">{pendingOptimization || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Last Batch</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {lastBatchOptimized ? new Date(lastBatchOptimized).toLocaleDateString() : "Never"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${optimizationRate}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{optimizationRate}% optimized</span>
        </div>
        {pendingList && pendingList.length > 0 && (
          <button
            onClick={handleTrigger}
            disabled={selectedUsers.length === 0 || isOptimizing}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isOptimizing ? "animate-spin" : ""}`} />
            Optimize Selected ({selectedUsers.length})
          </button>
        )}
      </div>

      {pendingList && pendingList.length > 0 && (
        <div className="rounded-lg border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
            <span className="text-sm font-medium text-gray-700">Pending Optimization Queue</span>
            <button
              onClick={handleSelectAll}
              className="text-xs text-gray-600 hover:text-black transition-colors"
            >
              {selectedUsers.length === pendingList.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {pendingList.slice(0, 20).map((user) => (
              <label
                key={user.userId}
                className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2 last:border-b-0 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.userId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.userId]);
                    } else {
                      setSelectedUsers(selectedUsers.filter((id) => id !== user.userId));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{user.email || user.userId}</p>
                  <p className="text-xs text-gray-500">
                    {user.reviewCount} reviews | Last active: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {user.reason}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FSRSOptimizationStatus;
