import { useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw, Loader, CheckCircle } from "lucide-react";
import { useReviewQuestionStore } from "../../store/reviewQuestionStore";
import QuestionList from "../questionBank/QuestionList";
import ReviewActionModal from "../questionBank/ReviewActionModal";
import Button from "../ui/button";

function ReviewManager() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const {
    fetchQuestions,
    fetchQuestionCounts,
    approveQuestion,
    rejectQuestion,
    requestChanges,
  } = useReviewQuestionStore();

  async function refreshData() {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchQuestions(1), fetchQuestionCounts()]);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleReviewAction(action, notes) {
    if (!selectedQuestion) return;

    let result;
    if (action === "approved") {
      result = await approveQuestion(selectedQuestion._id, notes);
    } else if (action === "rejected") {
      result = await rejectQuestion(selectedQuestion._id, notes);
    } else if (action === "requested_changes") {
      result = await requestChanges(selectedQuestion._id, notes);
    }

    if (result.success) {
      setSelectedQuestion(null);
      setShowReviewModal(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-black" />
          <div>
            <h2 className="text-xl font-semibold text-black">Review Queue</h2>
            <p className="text-gray-600">
              Review and approve questions awaiting publication
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <QuestionList
        useQuestionStore={useReviewQuestionStore}
        statusFilter={["draft", "review"]}
        showReviewActions
        onSelectForReview={(question) => {
          setSelectedQuestion(question);
          setShowReviewModal(true);
        }}
      />

      {showReviewModal && selectedQuestion && (
        <ReviewActionModal
          question={selectedQuestion}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedQuestion(null);
          }}
          onSubmit={handleReviewAction}
        />
      )}
    </div>
  );
}

export default ReviewManager;
