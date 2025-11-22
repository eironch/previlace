import React from "react";
import { Clock, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TicketCard({ ticket, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === "high") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-black hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
              ticket.status
            )}`}
          >
            {ticket.status.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {ticket.subject?.name || "General"}
          </span>
        </div>
        {getPriorityIcon(ticket.priority)}
      </div>

      <h3 className="mb-1 line-clamp-1 text-base font-semibold text-gray-900 group-hover:text-black">
        {ticket.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
        {ticket.question}
      </p>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(ticket.createdAt))} ago</span>
          </div>
          {ticket.responses?.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{ticket.responses.length} replies</span>
            </div>
          )}
        </div>
        
        {ticket.status === "resolved" && (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
    </div>
  );
}
