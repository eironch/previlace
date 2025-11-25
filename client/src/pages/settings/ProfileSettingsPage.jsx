import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings, BookOpen, Save } from "lucide-react";
import useAuthStore from "@/store/authStore";
import apiClient from "@/services/apiClient";
import StandardHeader from "@/components/ui/StandardHeader";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [examLevel, setExamLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.examType) {
      setExamLevel(user.examType);
    }
  }, [user]);

  async function handleSave() {
    if (!examLevel) {
      setError("Please select an exam level");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.patch("/users/profile", {
        examType: examLevel,
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        setSuccess("Exam level updated successfully");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to update exam level:", err);
      }
      setError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <SkeletonLoader variant="title" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <SkeletonLoader className="mb-4 h-32" />
          <SkeletonLoader className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
            <BookOpen className="h-5 w-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Exam Level</h2>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select your target exam level
            </label>
            <p className="mb-4 text-sm text-gray-600">
              This determines which questions and quizzes you'll see throughout the platform
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setExamLevel("Professional")}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  examLevel === "Professional"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Professional Level</h3>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      examLevel === "Professional"
                        ? "border-black bg-black"
                        : "border-gray-300"
                    }`}
                  >
                    {examLevel === "Professional" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  For first and second level positions requiring professional qualifications
                </p>
              </button>

              <button
                onClick={() => setExamLevel("Sub-Professional")}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  examLevel === "Sub-Professional"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Sub-Professional Level</h3>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      examLevel === "Sub-Professional"
                        ? "border-black bg-black"
                        : "border-gray-300"
                    }`}
                  >
                    {examLevel === "Sub-Professional" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  For clerical and support positions in government service
                </p>
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !examLevel}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-900">Sign Out</h3>
              <p className="text-sm text-red-700">Sign out of your account on this device</p>
            </div>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
