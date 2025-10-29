import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Loader,
} from "lucide-react";
import Button from "../ui/button";

function ReviewActionModal({ question, onClose, onSubmit, isLoading }) {
  const [action, setAction] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!action) return;

    setIsSubmitting(true);
    try {
      await onSubmit(action, notes);
      setAction(null);
      setNotes("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!question) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold text-black">Review Question</h3>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            ✕
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Question
            </p>
            <p className="mt-2 text-base text-black">{question.questionText}</p>
          </div>

          {question.options && question.options.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Options
              </p>
              <div className="mt-2 space-y-2">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 ${
                      option.isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-4 w-4 rounded-full border-2 ${
                          option.isCorrect
                            ? "border-green-600 bg-green-600"
                            : "border-gray-300"
                        }`}
                      />
                      <span className="text-sm text-black">{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Explanation
            </p>
            <p className="mt-2 text-sm text-gray-700">{question.explanation}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Difficulty</p>
              <p className="text-sm font-medium text-black">
                {question.difficulty}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium text-black">
                {question.category}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Exam Level</p>
              <p className="text-sm font-medium text-black">
                {question.examLevel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quality Score</p>
              <p className="text-sm font-medium text-black">
                {question.qualityMetrics?.overallScore || 0}/100
              </p>
            </div>
          </div>
        </div>

        {!action ? (
          <div className="mb-6 space-y-3 border-t pt-6">
            <p className="text-sm font-medium text-gray-700">Select Action:</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                onClick={() => setAction("approved")}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 p-4 text-left transition-colors hover:border-green-500 hover:bg-green-100 disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">Approve</p>
                  <p className="text-xs text-green-600">Move to Published</p>
                </div>
              </button>

              <button
                onClick={() => setAction("rejected")}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-left transition-colors hover:border-red-500 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">Reject</p>
                  <p className="text-xs text-red-600">Return to Draft</p>
                </div>
              </button>

              <button
                onClick={() => setAction("requested_changes")}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-left transition-colors hover:border-yellow-500 hover:bg-yellow-100 disabled:opacity-50"
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-700">Request Changes</p>
                  <p className="text-xs text-yellow-600">Ask Creator to Edit</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-4 border-t pt-6">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
              <div
                className={`h-4 w-4 rounded-full ${
                  action === "approved"
                    ? "bg-green-600"
                    : action === "rejected"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                }`}
              />
              <span className="text-sm font-medium text-blue-700">
                {action === "approved"
                  ? "Question will be approved and added to Question Bank"
                  : action === "rejected"
                    ? "Question will be rejected and returned to draft"
                    : "Creator will be notified to make changes"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Review Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === "rejected"
                    ? "Explain why the question needs to be revised..."
                    : action === "requested_changes"
                      ? "Specify what changes are needed..."
                      : "Add any comments about this question..."
                }
                className="mt-2 h-24 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-black"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {action && (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setAction(null);
                  setNotes("");
                }}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 text-white ${
                  action === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : action === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                } disabled:cursor-not-allowed disabled:bg-gray-400`}
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {action === "approved"
                  ? "Approve"
                  : action === "rejected"
                    ? "Reject"
                    : "Request Changes"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewActionModal;
