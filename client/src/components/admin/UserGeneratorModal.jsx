import React, { useState } from "react";
import { UserPlus, Copy, Check, Eye, EyeOff, Mail } from "lucide-react";
import userManagementService from "../../services/userManagementService";
import { useAuthStore } from "@/store/authStore";
import Modal from "@/components/ui/Modal";

// Helper for years
const getCurrentYear = () => new Date().getFullYear();
const getFutureYears = (count = 3) => {
    const startYear = getCurrentYear();
    return Array.from({ length: count }, (_, i) => startYear + i);
};
const FUTURE_YEARS = getFutureYears();

const CORE_SUBJECTS = [
    "Numerical Ability",
    "Verbal Ability",
    "General Information",
    "Clerical Ability",
    "Logic & Reasoning",
    "Reading Comprehension",
    "Grammar & Language",
    "Philippine Constitution",
];

export default function UserGeneratorModal({ onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    examType: "",
    targetExamMonth: "",
    targetExamYear: "",
    strongSubjects: [],
    sendCredentials: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError(null);
  }

  function toggleSubject(subject) {
      setFormData(prev => {
          const current = prev.strongSubjects;
          const updated = current.includes(subject)
              ? current.filter(s => s !== subject)
              : [...current, subject];
          return { ...prev, strongSubjects: updated };
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Calculate target date if month/year are present
    let targetExamDate = "";
    if (formData.targetExamMonth && formData.targetExamYear) {
        const datePart = formData.targetExamMonth === 'March' ? '03-01' : '08-01';
        targetExamDate = `${formData.targetExamYear}-${datePart}`;
    }

    // Calculate weak subjects
    const weakSubjects = CORE_SUBJECTS.filter(s => !formData.strongSubjects.includes(s));

    const payload = {
        ...formData,
        targetExamDate,
        weakSubjects,
        isProfileComplete: true, // Auto-complete profile since admin is filling it
    };

    try {
      const response = await userManagementService.createUser(payload);
      if (response.data?.user) {
        setCreatedUser(response.data.user);
        // If the backend returns the password (it should for admin gen), store it
        if (response.data.user.password) {
            setGeneratedPassword(response.data.user.password);
        }
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Success modal
  if (createdUser) {
    return (
      <Modal
        isOpen={true}
        onClose={() => {
          onSuccess();
          onClose();
        }}
        title="User Created Successfully"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {createdUser.firstName} {createdUser.lastName}
            </h3>
            <p className="text-sm text-gray-500">{createdUser.email}</p>
            
            {formData.sendCredentials && (
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-blue-600">
                    <Mail className="h-4 w-4" />
                    <span>Credentials sent via email</span>
                </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-gray-500">Password</label>
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm border border-gray-300 text-gray-900">
                {showPassword ? generatedPassword : "••••••••••••"}
              </code>
              <button
                onClick={() => copyToClipboard(generatedPassword)}
                className="rounded p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                title="Copy Password"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Generate User Account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">First Name</label>
                <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                />
            </div>
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Last Name</label>
                <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                />
            </div>
            </div>
            <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
            </div>
            <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
            <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                {user?.role === "super_admin" && (
                <option value="admin">Admin</option>
                )}
            </select>
            </div>
        </div>

        {/* Student Specific Fields */}
        {formData.role === 'student' && (
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 pt-2">Exam Details</h4>
                
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Exam Level</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Professional', 'Sub-Professional'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, examType: type }))}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    formData.examType === type 
                                    ? 'border-black bg-black text-white' 
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Month</label>
                        <select
                            name="targetExamMonth"
                            value={formData.targetExamMonth}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        >
                            <option value="">Select Month</option>
                            <option value="March">March</option>
                            <option value="August">August</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Year</label>
                        <select
                            name="targetExamYear"
                            value={formData.targetExamYear}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        >
                            <option value="">Select Year</option>
                            {FUTURE_YEARS.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Strong Subjects (Optional)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                        {CORE_SUBJECTS.map(subject => (
                            <label key={subject} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.strongSubjects.includes(subject)}
                                    onChange={() => toggleSubject(subject)}
                                    className="rounded border-gray-300 text-black focus:ring-black"
                                />
                                <span className="text-xs text-gray-700">{subject}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Account Options */}
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 pt-2">Account Options</h4>
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    name="sendCredentials"
                    checked={formData.sendCredentials}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                />
                <div>
                    <span className="block text-sm font-medium text-gray-900">Send Credentials via Email</span>
                    <span className="block text-xs text-gray-500">User will receive their login details automatically</span>
                </div>
            </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Account
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
