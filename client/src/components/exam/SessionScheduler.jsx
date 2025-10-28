import { useState } from "react";
import { Calendar, Clock, Users, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { TextArea } from "../ui/TextArea";
import useStudyGroupStore from "../../store/studyGroupStore";

export default function SessionScheduler({ groupId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    sessionType: "study",
    topics: [],
    maxParticipants: 20,
  });

  const [newTopic, setNewTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const { scheduleGroupSession } = useStudyGroupStore();

  const handleScheduleSession = async () => {
    if (!formData.title.trim() || !formData.scheduledAt) {
      alert("Title and date/time are required");
      return;
    }

    setLoading(true);
    try {
      await scheduleGroupSession(groupId, {
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
      onSuccess?.();
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData({
        ...formData,
        topics: [...formData.topics, newTopic.trim()],
      });
      setNewTopic("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-screen w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Schedule Study Session
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Session Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Weekly Practice Quiz"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What will be covered in this session?"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledAt: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                min={15}
                max={480}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Session Type
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) =>
                  setFormData({ ...formData, sessionType: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="study">Study</option>
                <option value="quiz">Quiz</option>
                <option value="discussion">Discussion</option>
                <option value="review">Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Max Participants
              </label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipants: parseInt(e.target.value),
                  })
                }
                min={2}
                max={50}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Topics to Cover
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTopic();
                  }
                }}
              />
              <Button onClick={addTopic} variant="outline">
                Add
              </Button>
            </div>
            {formData.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                  >
                    {topic}
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          topics: formData.topics.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="hover:text-purple-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t border-slate-200 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSession}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
