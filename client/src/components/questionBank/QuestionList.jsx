import { useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  Copy,
  AlertTriangle,
  CheckSquare,
  ToggleLeft,
  Type,
  Shuffle,
  List,
  FileText,
  Calculator,
  Grid3x3,
  Loader,
  CheckCircle,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

function QuestionList({
  useQuestionStore,
  statusFilter = [],
  showReviewActions = false,
  onSelectForReview,
}) {
  const { questions, pagination, isLoading, deleteQuestion, duplicateQuestion, sendBackToReview } =
    useQuestionStore();

  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    examLevel: "",
    questionType: "",
    source: "",
  });

  async function handleDeleteConfirm() {
    if (deleteConfirm) {
      setDeleteLoading(true);
      try {
        if (showReviewActions) {
          await deleteQuestion(deleteConfirm._id);
        } else {
          const result = await sendBackToReview(deleteConfirm._id);
          if (!result.success) {
            throw new Error(result.error);
          }
        }
        setDeleteConfirm(null);
      } finally {
        setDeleteLoading(false);
      }
    }
  }

  async function handleDuplicateConfirm() {
    if (duplicateConfirm) {
      setDuplicateLoading(true);
      try {
        await duplicateQuestion(duplicateConfirm._id);
        setDuplicateConfirm(null);
      } finally {
        setDuplicateLoading(false);
      }
    }
  }

  function getStatusColor(status) {
    const colors = {
      draft: "bg-gray-100 text-gray-700",
      review: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      published: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  }

  function getSourceColor(source) {
    const colors = {
      manual: "bg-purple-100 text-purple-700",
      ai_generated: "bg-cyan-100 text-cyan-700",
      imported: "bg-orange-100 text-orange-700",
      cloned: "bg-indigo-100 text-indigo-700",
    };
    return colors[source] || "bg-gray-100 text-gray-700";
  }

  function getQuestionTypeIcon(type) {
    const iconMap = {
      multiple_choice: CheckSquare,
      true_false: ToggleLeft,
      fill_blank: Type,
      matching: Shuffle,
      sequence: List,
      essay: FileText,
      numeric: Calculator,
      matrix: Grid3x3,
    };
    return iconMap[type] || CheckSquare;
  }

  function formatQuestionType(type) {
    const typeMap = {
      multiple_choice: "Multiple Choice",
      true_false: "True/False",
      fill_blank: "Fill in the Blank",
      matching: "Matching",
      sequence: "Sequence",
      essay: "Essay",
      numeric: "Numeric",
      matrix: "Matrix",
    };
    return typeMap[type] || type;
  }

  function formatSource(source) {
    const sourceMap = {
      manual: "Manual",
      ai_generated: "AI Generated",
      imported: "Imported",
      cloned: "Cloned",
    };
    return sourceMap[source] || source;
  }

  if (isLoading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <div className="text-black">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search questions..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-6">
          <Select
            placeholder="Source"
            value={filters.source}
            onChange={(value) => setFilters({ ...filters, source: value })}
            options={[
              { value: "", label: "All Sources" },
              { value: "manual", label: "Manual" },
              { value: "ai_generated", label: "AI Generated" },
              { value: "imported", label: "Imported" },
              { value: "cloned", label: "Cloned" },
            ]}
          />

          <Select
            placeholder="Question Type"
            value={filters.questionType}
            onChange={(value) =>
              setFilters({ ...filters, questionType: value })
            }
            options={[
              { value: "", label: "All Types" },
              { value: "multiple_choice", label: "Multiple Choice" },
              { value: "true_false", label: "True/False" },
              { value: "fill_blank", label: "Fill in the Blank" },
              { value: "matching", label: "Matching" },
              { value: "sequence", label: "Sequence" },
              { value: "essay", label: "Essay" },
              { value: "numeric", label: "Numeric" },
              { value: "matrix", label: "Matrix" },
            ]}
          />

          <Select
            placeholder="Category"
            value={filters.category}
            onChange={(value) => setFilters({ ...filters, category: value })}
            options={[
              { value: "", label: "All Categories" },
              { value: "Vocabulary", label: "Vocabulary" },
              { value: "Grammar", label: "Grammar" },
              { value: "Reading Comprehension", label: "Reading Comprehension" },
              { value: "Mathematics", label: "Mathematics" },
              { value: "General Information", label: "General Information" },
              { value: "Clerical", label: "Clerical" },
              { value: "Analytical Reasoning", label: "Analytical Reasoning" },
            ]}
          />

          <Select
            placeholder="Difficulty"
            value={filters.difficulty}
            onChange={(value) => setFilters({ ...filters, difficulty: value })}
            options={[
              { value: "", label: "All Difficulties" },
              { value: "Beginner", label: "Beginner" },
              { value: "Intermediate", label: "Intermediate" },
              { value: "Advanced", label: "Advanced" },
            ]}
          />

          <Select
            placeholder="Exam Level"
            value={filters.examLevel}
            onChange={(value) => setFilters({ ...filters, examLevel: value })}
            options={[
              { value: "", label: "All Levels" },
              { value: "Professional", label: "Professional" },
              { value: "Subprofessional", label: "Sub-Professional" },
            ]}
          />
        </div>
      )}

      {questions.length === 0 && !isLoading ? (
        <div className="py-12 text-center">
          <div className="mb-2 text-gray-400">No questions found</div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((question) => {
              const IconComponent = getQuestionTypeIcon(question.questionType);
              return (
                <div
                  key={question._id}
                  className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-300"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-gray-600" />
                          <h3 className="line-clamp-1 font-semibold text-black">
                            {question.questionText}
                          </h3>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(
                            question.status || question.workflowState
                          )}`}
                        >
                          {question.status || question.workflowState}
                        </span>
                      </div>

                      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                          {question.category}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                          {question.difficulty}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                          {question.examLevel}
                        </span>
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                          {formatQuestionType(question.questionType)}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${getSourceColor(
                            question.metadata?.source
                          )}`}
                        >
                          {formatSource(question.metadata?.source)}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-sm text-gray-600">
                        {question.explanation || "No explanation provided"}
                      </p>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      {showReviewActions && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectForReview?.(question)}
                            className="text-black hover:text-gray-700"
                            title="Review Question"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Duplicate"
                            onClick={() => setDuplicateConfirm(question)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(question)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {!showReviewActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(question)}
                          className="text-yellow-600 hover:text-yellow-700"
                          title="Send Back to Review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      Created by {question.createdBy?.firstName}{" "}
                      {question.createdBy?.lastName}
                    </div>
                    <div>
                      {question.usageStats?.totalAttempts || 0} uses •{" "}
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {question.reviewHistory &&
                    question.reviewHistory.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <p className="text-xs font-medium uppercase text-gray-500">
                          Review History
                        </p>
                        {question.reviewHistory.map((review, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start justify-between rounded border-l-4 p-2 text-xs ${
                              review.action === "approved"
                                ? "border-l-green-500 bg-green-50"
                                : review.action === "rejected"
                                  ? "border-l-red-500 bg-red-50"
                                  : "border-l-yellow-500 bg-yellow-50"
                            }`}
                          >
                            <div>
                              <span
                                className={`font-medium ${
                                  review.action === "approved"
                                    ? "text-green-700"
                                    : review.action === "rejected"
                                      ? "text-red-700"
                                      : "text-yellow-700"
                                }`}
                              >
                                {review.action === "approved"
                                  ? "Approved"
                                  : review.action === "rejected"
                                    ? "Rejected"
                                    : "Changes Requested"}
                              </span>
                              {review.notes && (
                                <p className="mt-1 text-gray-600">{review.notes}</p>
                              )}
                            </div>
                            <div className="text-right text-gray-500">
                              <p className="font-medium">
                                {review.reviewerId?.firstName}{" "}
                                {review.reviewerId?.lastName}
                              </p>
                              <p>
                                {new Date(review.reviewedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
                {Math.min(
                  pagination.currentPage * 20,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} questions
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" disabled={!pagination.hasPrevPage}>
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <Button variant="ghost" disabled={!pagination.hasNextPage}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              {showReviewActions ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-black">Delete Question</h3>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-black">Send Back to Review</h3>
                </>
              )}
            </div>
            <p className="mb-6 text-gray-600">
              {showReviewActions
                ? "Are you sure you want to delete this question? This action cannot be undone."
                : "This question will be moved back to the review queue for further evaluation."}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className={`text-white ${
                  showReviewActions
                    ? "bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                    : "bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400"
                } disabled:cursor-not-allowed`}
              >
                {deleteLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : showReviewActions ? (
                  "Delete"
                ) : (
                  "Send Back"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {duplicateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <Copy className="h-5 w-5 text-black" />
              <h3 className="text-lg font-semibold text-black">
                Duplicate Question
              </h3>
            </div>
            <p className="mb-6 text-gray-600">
              Create a copy of this question? It will be saved as a draft.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDuplicateConfirm(null)}
                disabled={duplicateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDuplicateConfirm}
                disabled={duplicateLoading}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {duplicateLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Duplicate"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionList;
