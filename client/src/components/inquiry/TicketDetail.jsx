import React, { useState } from "react";
import { format } from "date-fns";
import { Send, User, Shield, Lock } from "lucide-react";
import { useInquiryStore } from "../../store/inquiryStore";
import { useAuthStore } from "../../store/authStore";

export default function TicketDetail({ ticket, isInstructor }) {
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [activeTab, setActiveTab] = useState("reply"); // reply | note
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addResponse, addInternalNote, updateTicketStatus } = useInquiryStore();
  const { user } = useAuthStore();

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSubmitting(true);
    try {
      await addResponse(ticket._id, reply);
      setReply("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;

    setIsSubmitting(true);
    try {
      await addInternalNote(ticket._id, internalNote);
      setInternalNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (window.confirm("Are you sure you want to close this ticket?")) {
      try {
        await updateTicketStatus(ticket._id, "resolved");
      } catch (error) {
        console.error("Failed to resolve ticket:", error);
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-300 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {ticket.subject?.name}
              </span>
              <span className="text-xs text-gray-500">
                #{ticket._id.slice(-6)}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                {ticket.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
          </div>
          {isInstructor && ticket.status !== "resolved" && (
            <button
              onClick={handleResolve}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Close Ticket
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <User className="h-3 w-3 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">
              {ticket.student?.firstName} {ticket.student?.lastName}
            </span>
          </div>
          <span>•</span>
          <span>{format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}</span>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Original Question */}
        <div className="mb-8">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-800">{ticket.question}</p>
          </div>
        </div>

        {/* Responses & Notes */}
        <div className="space-y-6">
          {/* Combine responses and notes, sort by date */}
          {[
            ...ticket.responses.map((r) => ({ ...r, type: "response" })),
            ...(isInstructor ? ticket.internalNotes.map((n) => ({ ...n, type: "note" })) : []),
          ]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((item, index) => (
              <div
                key={index}
                className={`flex gap-4 ${item.type === "note" ? "bg-yellow-50 p-4 rounded-lg border border-yellow-200" : ""
                  }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${item.type === "note"
                      ? "bg-yellow-200"
                      : item.author._id === ticket.student._id
                        ? "bg-gray-200"
                        : "bg-black text-white"
                      }`}
                  >
                    {item.type === "note" ? (
                      <Lock className="h-4 w-4 text-yellow-700" />
                    ) : item.author.role === "instructor" || item.author.role === "admin" ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {item.author.firstName} {item.author.lastName}
                    </span>
                    {item.type === "note" && (
                      <span className="text-xs font-medium text-yellow-700">
                        Internal Note
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(item.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {item.type === "note" ? item.note : item.message}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Input Area */}
      {ticket.status !== "resolved" && ticket.status !== "expired" && (
        <div className="border-t border-gray-300 bg-gray-50 p-4">
          {isInstructor && (
            <div className="mb-2 flex gap-4">
              <button
                onClick={() => setActiveTab("reply")}
                className={`text-sm font-medium ${activeTab === "reply" ? "text-black" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Reply to Student
              </button>
              <button
                onClick={() => setActiveTab("note")}
                className={`flex items-center gap-1 text-sm font-medium ${activeTab === "note" ? "text-yellow-700" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Lock className="h-3 w-3" />
                Internal Note
              </button>
            </div>
          )}

          <form onSubmit={activeTab === "reply" ? handleSendReply : handleSendNote}>
            <div className={`relative rounded-lg border bg-white shadow-sm ${activeTab === "note" ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black"
              }`}>
              <textarea
                value={activeTab === "reply" ? reply : internalNote}
                onChange={(e) =>
                  activeTab === "reply"
                    ? setReply(e.target.value)
                    : setInternalNote(e.target.value)
                }
                placeholder={
                  activeTab === "reply"
                    ? "Type your reply..."
                    : "Add an internal note (visible only to instructors)..."
                }
                rows="3"
                className="w-full resize-none border-none bg-transparent p-3 focus:ring-0"
                required
              />
              <div className="flex items-center justify-between border-t border-gray-300 bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">
                  Markdown supported
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !(activeTab === "reply" ? reply.trim() : internalNote.trim())}
                  className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-semibold text-white transition-colors ${activeTab === "note"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-black hover:bg-gray-800"
                    } disabled:opacity-50`}
                >
                  <Send className="h-3.5 w-3.5" />
                  {activeTab === "reply" ? "Send Reply" : "Save Note"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
