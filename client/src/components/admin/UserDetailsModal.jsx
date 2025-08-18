import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Activity,
  BookOpen,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import userManagementService from "../../services/userManagementService";

function UserDetailsModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [activityData, setActivityData] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (activeTab === "activity") {
      fetchUserActivity();
    }
  }, [activeTab]);

  async function fetchUserActivity() {
    setLoadingActivity(true);
    try {
      const response = await userManagementService.getUserActivity(user._id);
      setActivityData(response.data);
    } catch (error) {
      setActivityData(null);
    }
    setLoadingActivity(false);
  }

  function getStatusIcon() {
    if (user.isSuspended) return <XCircle className="h-5 w-5 text-red-500" />;
    if (user.isEmailVerified)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  }

  function getStatusText() {
    if (user.isSuspended) return "Suspended";
    if (!user.isEmailVerified) return "Unverified";
    if (user.lockUntil && new Date(user.lockUntil) > new Date())
      return "Locked";
    return "Active";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="text-xl font-semibold text-gray-900">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-full">
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
            <div className="mb-6 text-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="mx-auto mb-3 h-24 w-24 rounded-full"
                />
              ) : (
                <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-300">
                  <span className="text-2xl font-medium text-gray-600">
                    {user.firstName?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("exam")}
                className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === "exam"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Exam Details
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === "activity"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Activity & Sessions
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === "preferences"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "profile" && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        First Name
                      </label>
                      <p className="text-gray-900">{user.firstName || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Name
                      </label>
                      <p className="text-gray-900">{user.lastName || "-"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email Address
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Bio
                    </label>
                    <p className="text-gray-900">
                      {user.bio || "No bio provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Role
                      </label>
                      <p className="text-gray-900">
                        {user.role === "admin" ? "Administrator" : "User"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Education
                      </label>
                      <p className="text-gray-900">{user.education || "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Created
                      </label>
                      <p className="text-gray-900">
                        {format(
                          new Date(user.createdAt),
                          "MMM dd, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Login
                      </label>
                      <p className="text-gray-900">
                        {user.lastLogin
                          ? format(
                              new Date(user.lastLogin),
                              "MMM dd, yyyy 'at' h:mm a"
                            )
                          : "Never"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          user.isEmailVerified ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm">
                        Email {user.isEmailVerified ? "" : "Not "}Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          user.isProfileComplete
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-sm">
                        Profile {user.isProfileComplete ? "" : "In"}complete
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          user.googleId ? "bg-blue-500" : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm">
                        {user.googleId ? "Google" : "Email"} Auth
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "exam" && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Exam Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Exam Type
                      </label>
                      <p className="text-gray-900">
                        {user.examType || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Has Taken Exam
                      </label>
                      <p className="text-gray-900">
                        {user.hasTakenExam || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Previous Score
                      </label>
                      <p className="text-gray-900">
                        {user.previousScore || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Target Score
                      </label>
                      <p className="text-gray-900">
                        {user.targetScore || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Review Experience
                    </label>
                    <p className="text-gray-900">
                      {user.reviewExperience || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Target Date
                    </label>
                    <p className="text-gray-900">
                      {user.targetDate || "Not set"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Struggles
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.struggles && user.struggles.length > 0 ? (
                        user.struggles.map((struggle) => (
                          <span
                            key={struggle}
                            className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800"
                          >
                            {struggle}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">None specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Study Modes
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.studyMode && user.studyMode.length > 0 ? (
                        user.studyMode.map((mode) => (
                          <span
                            key={mode}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                          >
                            {mode}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">None selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  Activity & Sessions
                </h3>
                {loadingActivity ? (
                  <p className="text-gray-500">Loading activity data...</p>
                ) : activityData ? (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 font-medium">Activity Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">
                            Days Since Creation
                          </label>
                          <p className="text-2xl font-semibold">
                            {activityData.activity.daysSinceCreation}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Days Since Last Login
                          </label>
                          <p className="text-2xl font-semibold">
                            {activityData.activity.daysSinceLastLogin ||
                              "Never"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Login Attempts
                          </label>
                          <p className="text-2xl font-semibold">
                            {activityData.activity.loginAttempts}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Active Sessions
                          </label>
                          <p className="text-2xl font-semibold">
                            {activityData.activity.activeSessions}
                          </p>
                        </div>
                      </div>
                    </div>

                    {activityData.sessions &&
                      activityData.sessions.length > 0 && (
                        <div>
                          <h4 className="mb-3 font-medium">Recent Sessions</h4>
                          <div className="space-y-2">
                            {activityData.sessions.map((session, index) => (
                              <div
                                key={index}
                                className="rounded border border-gray-200 bg-white p-3"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {session.userAgent || "Unknown Device"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {session.ipAddress || "Unknown IP"}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded px-2 py-1 text-xs ${
                                      session.isExpired
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {session.isExpired ? "Expired" : "Active"}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                  Created:{" "}
                                  {format(
                                    new Date(session.createdAt),
                                    "MMM dd, yyyy h:mm a"
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Failed to load activity data
                  </p>
                )}
              </div>
            )}

            {activeTab === "preferences" && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Study Time
                      </label>
                      <p className="text-gray-900">
                        {user.studyTime || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Hours Per Week
                      </label>
                      <p className="text-gray-900">
                        {user.hoursPerWeek || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reason for Taking Exam
                    </label>
                    <p className="text-gray-900">
                      {user.reason || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded ${
                          user.showLeaderboard
                            ? "bg-blue-600"
                            : "border-2 border-gray-300 bg-white"
                        }`}
                      >
                        {user.showLeaderboard && (
                          <CheckCircle className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <span className="text-sm">Show on Leaderboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded ${
                          user.receiveReminders
                            ? "bg-blue-600"
                            : "border-2 border-gray-300 bg-white"
                        }`}
                      >
                        {user.receiveReminders && (
                          <CheckCircle className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <span className="text-sm">Receive Study Reminders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded ${
                          user.studyBuddy
                            ? "bg-blue-600"
                            : "border-2 border-gray-300 bg-white"
                        }`}
                      >
                        {user.studyBuddy && (
                          <CheckCircle className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <span className="text-sm">
                        Interested in Study Buddy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
