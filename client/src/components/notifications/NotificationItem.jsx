import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell, MessageSquare, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore";

export default function NotificationItem({ notification, onClose }) {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationStore();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      if (onClose) onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "ticket_response":
      case "ticket_assigned":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "ticket_resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "study_reminder":
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case "weekly_unlock":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer items-start gap-3 border-b border-gray-300 p-4 transition-colors hover:bg-gray-50 ${
        !notification.isRead ? "bg-blue-50/50" : ""
      }`}
    >
      <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>
      <div className="flex-1">
        <p className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500">{notification.message}</p>
        <p className="mt-1 text-xs text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt))} ago
        </p>
      </div>
      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );
}
