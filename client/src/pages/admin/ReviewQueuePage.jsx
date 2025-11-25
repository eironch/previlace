import { useEffect, useState } from "react";
import { ClipboardCheck, Plus, RefreshCw, Loader } from "lucide-react";
import { useReviewQuestionStore } from "@/store/reviewQuestionStore";
import QuestionList from "@/components/questionBank/QuestionList";
import ReviewActionModal from "@/components/questionBank/ReviewActionModal";
import QuestionTypeSelection from "@/components/questionBank/QuestionTypeSelection";
import QuestionCreationForm from "@/components/questionBank/QuestionCreationForm";
import Button from "@/components/ui/Button";

function ReviewQueuePage() {
  const [currentView, setCurrentView] = useState("questions");
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
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

  useEffect(() => {
    refreshData();
  }, []);

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

  function handleTypeSelect(questionType) {
    setSelectedQuestionType(questionType);
    setCurrentView("create");
  }

  function handleBackToQuestions() {
    setSelectedQuestionType(null);
    setCurrentView("questions");
  }

  function handleQuestionSuccess() {
    setCurrentView("questions");
    refreshData();
  }

  function handleCreateNew() {
    setCurrentView("types");
  }

  if (currentView === "types") {
    return (
      <QuestionTypeSelection
        onSelectType={handleTypeSelect}
        onBack={handleBackToQuestions}
      />
    );
  }

  if (currentView === "create" && selectedQuestionType) {
    return (
      <QuestionCreationForm
        questionType={selectedQuestionType}
        onBack={handleBackToQuestions}
        onSuccess={handleQuestionSuccess}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
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
        <div className="flex items-center gap-2">
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
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Question
          </Button>
        </div>
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

export default ReviewQueuePage;
