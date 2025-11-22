import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { useInquiryStore } from "../../store/inquiryStore";
import { useSubjectStore } from "../../store/subjectStore";

export default function TicketForm({ subjectId, topicId, onClose }) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createTicket } = useInquiryStore();
  const { subjects } = useSubjectStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !question.trim() || !selectedSubjectId) return;

    setIsSubmitting(true);
    try {
      await createTicket({
        subjectId: selectedSubjectId,
        title,
        question,
        // topicId // Optional: if we want to link to specific topic later
      });
      onClose();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
              disabled={!!subjectId} // Disable if pre-selected
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your question"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your question in detail..."
              rows="5"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
              maxLength={2000}
            />
          </div>

          {/* File Upload Placeholder - Phase 2 */}
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 text-sm text-gray-600 hover:text-black"
              disabled
            >
              <Upload className="h-4 w-4" />
              <span>Attach screenshot (Coming Soon)</span>
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
