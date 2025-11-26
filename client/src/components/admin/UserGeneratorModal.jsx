import React, { useState } from "react";
import { UserPlus, Copy, Check } from "lucide-react";
import userManagementService from "../../services/userManagementService";
import { useAuthStore } from "@/store/authStore";
import Modal from "@/components/ui/Modal";

export default function UserGeneratorModal({ onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await userManagementService.createUser(formData);
      if (response.data?.user?.password) {
        setCreatedUser(response.data.user);
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

  // Success modal when a user (including admin) is created and password is returned
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
            <h3 className="text-lg font-medium text-gray-900">
              {createdUser.firstName} {createdUser.lastName}
            </h3>
            <p className="text-sm text-gray-500">{createdUser.email}</p>
            {createdUser.role === "admin" && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Note: Admin credentials are NOT emailed. Please copy them now.
              </p>
            )}
          </div>
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <label className="text-xs font-medium uppercase text-gray-500">Password</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm border border-gray-200">
                {createdUser.password}
              </code>
              <button
                onClick={() => copyToClipboard(createdUser.password)}
                className="rounded p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
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
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  // Default modal with form for creating a user
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Generate User Account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            {user?.role === "super_admin" && (
              <option value="admin">Admin</option>
            )}
          </select>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium">Note:</p>
          <p>
            {formData.role === "admin"
              ? "Admin credentials will be displayed here after creation. They will NOT be emailed."
              : "A secure password and Student ID (for students) will be automatically generated and sent to the user's email address."}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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
