import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RecentUsers() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isOpen && !hasFetched) {
      const fetchRecentUsers = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/admin/users/recent`, { withCredentials: true });
          if (response.data.success) {
            setUsers(response.data.data.users);
          }
        } catch (error) {
          console.error("Failed to fetch recent users:", error);
        } finally {
          setLoading(false);
          setHasFetched(true);
        }
      };
      fetchRecentUsers();
    }
  }, [isOpen, hasFetched]);

  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-black" />
          <h3 className="text-lg font-semibold text-black">Recent Users</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-300 p-6 pt-0">
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between border-b border-gray-300 py-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-black">
                      {user.firstName || "Unknown"} {user.lastName || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
                        {user.examType || "No Type"}
                      </span>
                      {user.isProfileComplete && (
                        <div
                          className="h-2 w-2 rounded-full bg-green-500"
                          title="Profile Complete"
                        ></div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent users found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
