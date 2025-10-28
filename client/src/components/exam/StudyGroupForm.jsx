import { useState, useEffect } from "react";
import { X, Users, Settings, MessageSquare, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { TextArea } from "../ui/TextArea";
import useStudyGroupStore from "../../store/studyGroupStore";

export default function StudyGroupForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    isPrivate: false,
    memberLimit: 50,
    studyGoals: [],
    rules: [],
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      allowFileSharing: true,
      allowQuizSharing: true,
    },
  });

  const [newGoal, setNewGoal] = useState("");
  const [newRule, setNewRule] = useState("");
  const [loading, setLoading] = useState(false);

  const { createStudyGroup } = useStudyGroupStore();

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      alert("Group name is required");
      return;
    }

    setLoading(true);
    try {
      await createStudyGroup(formData);
      onSuccess?.();
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData({
        ...formData,
        studyGoals: [...formData.studyGoals, newGoal.trim()],
      });
      setNewGoal("");
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()],
      });
      setNewRule("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-screen w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">Create Study Group</h2>
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
              Group Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Professional CSE 2025"
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
              placeholder="Describe your study group's purpose..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="general">General</option>
                <option value="professional">Professional</option>
                <option value="sub-professional">Sub-Professional</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Member Limit
              </label>
              <Input
                type="number"
                value={formData.memberLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    memberLimit: parseInt(e.target.value),
                  })
                }
                min={2}
                max={100}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({ ...formData, isPrivate: e.target.checked })
                }
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">
                Make this group private (invite-only)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Study Goals
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a study goal..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGoal();
                  }
                }}
              />
              <Button onClick={addGoal} variant="outline">
                Add
              </Button>
            </div>
            {formData.studyGoals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.studyGoals.map((goal, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {goal}
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          studyGoals: formData.studyGoals.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="hover:text-blue-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Group Rules
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add a group rule..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRule();
                  }
                }}
              />
              <Button onClick={addRule} variant="outline">
                Add
              </Button>
            </div>
            {formData.rules.length > 0 && (
              <ul className="mt-3 space-y-1">
                {formData.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {rule}
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          rules: formData.rules.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.allowMemberInvites}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      allowMemberInvites: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">
                Allow members to invite others
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.allowQuizSharing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      allowQuizSharing: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">
                Allow quiz sharing in group
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.allowFileSharing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      allowFileSharing: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">
                Allow file sharing
              </span>
            </label>
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
              onClick={handleCreateGroup}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
