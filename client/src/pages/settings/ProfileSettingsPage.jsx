import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings, BookOpen, Save, User, Lock, Bell } from "lucide-react";
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

  // New states
  const [activeSection, setActiveSection] = useState("profile"); // profile, password, notifications
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    if (user?.examType) {
      setExamLevel(user.examType);
    }
  }, [user]);

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updates = {};
      if (user.role === 'student') {
          if (!examLevel) {
            setError("Please select an exam level");
            setSaving(false);
            return;
          }
          updates.examType = examLevel;
      }

      // Add other profile updates here if needed (name, email)

      const response = await apiClient.patch("/users/profile", updates);

      if (response.data.success) {
        setUser(response.data.data.user);
        setSuccess("Profile updated successfully");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
      e.preventDefault();
      if (passwordForm.new !== passwordForm.confirm) {
          setError("New passwords do not match");
          return;
      }
      setSaving(true);
      setError("");
      setSuccess("");
      
      try {
          await apiClient.patch("/users/update-password", {
              currentPassword: passwordForm.current,
              newPassword: passwordForm.new
          });
          setSuccess("Password updated successfully");
          setPasswordForm({ current: "", new: "", confirm: "" });
      } catch (err) {
          setError(err.response?.data?.message || "Failed to update password");
      } finally {
          setSaving(false);
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
          <SkeletonLoader className="h-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-1">
                <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'profile' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <User className="w-4 h-4" /> Profile
                </button>
                <button
                    onClick={() => setActiveSection("password")}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'password' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <Lock className="w-4 h-4" /> Password
                </button>
                <button
                    onClick={() => setActiveSection("notifications")}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'notifications' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <Bell className="w-4 h-4" /> Notifications
                </button>
            </div>

            {/* Content */}
            <div className="md:col-span-3 space-y-6">
                {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
                )}
                {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    {success}
                </div>
                )}

                {activeSection === 'profile' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input type="text" value={user?.firstName || ''} disabled className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" value={user?.lastName || ''} disabled className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" value={user?.email || ''} disabled className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {user?.role === 'student' && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Exam Preferences</h2>
                                <div className="space-y-3">
                                    {['Professional', 'Sub-Professional'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setExamLevel(level)}
                                            className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                                            examLevel === level
                                                ? "border-black bg-gray-200"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900">{level} Level</span>
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${examLevel === level ? "border-black bg-black" : "border-gray-300"}`}>
                                                    {examLevel === level && <div className="h-2 w-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === 'password' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.current}
                                    onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {saving ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSection === 'notifications' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h2>
                        <p className="text-gray-500 text-sm">Manage how you receive notifications.</p>
                        {/* Placeholder for notification settings */}
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                    <p className="text-xs text-gray-500">Receive updates via email</p>
                                </div>
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Class Reminders</p>
                                    <p className="text-xs text-gray-500">Get reminded before class starts</p>
                                </div>
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" defaultChecked />
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

export default ProfileSettingsPage;
