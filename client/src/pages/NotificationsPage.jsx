import React, { useEffect } from "react";
import { useNotificationStore } from "../store/notificationStore";
import NotificationItem from "../components/notifications/NotificationItem";
import { BellOff, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <BellOff className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
