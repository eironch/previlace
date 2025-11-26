import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useReviewQuestionStore } from "@/store/reviewQuestionStore";
import useAdminCacheStore from "@/store/adminCacheStore";
import QuestionList from "@/components/questionBank/QuestionList";
import AdminSkeleton from "@/components/ui/AdminSkeleton";
import ReviewActionModal from "@/components/questionBank/ReviewActionModal";

const ReviewQueueView = forwardRef((props, ref) => {
  const { fetchQuestions, fetchQuestionCounts } = useReviewQuestionStore();
  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'review-queue-data';
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: refreshData
  }));

  async function loadData() {
    const cached = getCachedData(CACHE_KEY);
    if (cached) {
      useReviewQuestionStore.setState({
        questions: cached.data.questions,
        questionCounts: cached.data.counts,
        isLoading: false
      });
      setIsLoadingCache(false);
      if (!cached.isStale) return;
    }

    await refreshData();
    setIsLoadingCache(false);
  }

  async function refreshData() {
    await Promise.all([fetchQuestions(1), fetchQuestionCounts()]);
    const { questions, questionCounts } = useReviewQuestionStore.getState();
    setCachedData(CACHE_KEY, { questions, counts: questionCounts });
  }

  return (
    <div className="space-y-6">
        {isLoadingCache && !useReviewQuestionStore.getState().questions.length ? (
          <AdminSkeleton />
        ) : (
          <QuestionList
            useQuestionStore={useReviewQuestionStore}
            statusFilter={["draft", "review"]}
            showReviewActions
            onSelectForReview={(question) => {
              setSelectedQuestion(question);
              setShowReviewModal(true);
            }}
          />
        )}

      {showReviewModal && selectedQuestion && (
        <ReviewModal
          question={selectedQuestion}
          onClose={() => setShowReviewModal(false)}
          onReviewComplete={() => {
            setShowReviewModal(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
});

ReviewQueueView.displayName = "ReviewQueueView";

export default ReviewQueueView;
