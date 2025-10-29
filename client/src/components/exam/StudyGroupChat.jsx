import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Reply2, Smile, Pin } from "lucide-react";
import Button from "../ui/button1";
import { Input } from "../ui/input1";
import useStudyGroupStore from "../../store/studyGroupStore";
import useAuthStore from "../../store/authStore";

export default function StudyGroupChat({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const messagesEndRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const { getGroupMessages, sendGroupMessage, deleteGroupMessage } =
    useStudyGroupStore();

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getGroupMessages(groupId, 50, 0);
      setMessages(data.reverse());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendGroupMessage(groupId, {
      content: newMessage.trim(),
      replyTo: replyTo?._id,
    });

    setNewMessage("");
    setReplyTo(null);
    loadMessages();
  };

  const handleDeleteMessage = async (messageId) => {
    await deleteGroupMessage(groupId, messageId);
    loadMessages();
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Group Discussion
        </h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {loading ? (
          <div className="py-8 text-center text-slate-600">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-slate-600">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg._id}
              message={msg}
              isOwn={msg.senderId?._id === user?._id}
              onDelete={() => handleDeleteMessage(msg._id)}
              onReply={() => setReplyTo(msg)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 p-4">
        {replyTo && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm">
            <Reply2 className="h-4 w-4 text-blue-600" />
            <span className="flex-1 text-blue-900">
              Replying to {replyTo.senderId?.firstName}
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message, isOwn, onDelete, onReply }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${
          isOwn
            ? "bg-blue-600 text-white"
            : "border border-slate-200 bg-slate-50 text-slate-900"
        }`}
      >
        {message.replyTo && (
          <div
            className={`mb-2 border-l-2 pl-2 text-xs opacity-75 ${
              isOwn ? "border-blue-200" : "border-slate-300"
            }`}
          >
            Replying to {message.replyTo.senderId?.firstName}
          </div>
        )}

        <div className="text-sm break-words">{message.content}</div>

        <div className="relative mt-2 flex items-center justify-between">
          <span className="text-xs opacity-75">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="opacity-50 hover:opacity-100"
            >
              <MoreVertical className="h-3 w-3" />
            </button>

            {showActions && (
              <div className="absolute top-full right-0 mt-1 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    onReply();
                    setShowActions(false);
                  }}
                  className="px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Reply
                </button>
                {isOwn && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
