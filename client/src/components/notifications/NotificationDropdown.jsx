import React from "react";
import { useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { useNotificationStore } from "../../store/notificationStore";

export default function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const { notifications, markAllAsRead } = useNotificationStore();

  const handleViewAll = () => {
    navigate("/dashboard/notifications");
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg border border-gray-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
      <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={markAllAsRead}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onClose={onClose}
            />
          ))
        )}
      </div>

      <div className="border-t border-gray-300 bg-gray-50 p-2">
        <button
          onClick={handleViewAll}
          className="w-full rounded-md px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
