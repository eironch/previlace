import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useQuestionBankStore } from "@/store/questionBankStore";
import useAdminCacheStore from "@/store/adminCacheStore";
import QuestionList from "@/components/questionBank/QuestionList";
import AdminSkeleton from "@/components/ui/AdminSkeleton";

const QuestionBankView = forwardRef((props, ref) => {
  const { fetchQuestions, fetchQuestionCounts } = useQuestionBankStore();
  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'question-bank-data';
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: refreshData
  }));

  async function loadData() {
    const cached = getCachedData(CACHE_KEY);
    if (cached) {
      useQuestionBankStore.setState({
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
    const { questions, questionCounts } = useQuestionBankStore.getState();
    setCachedData(CACHE_KEY, { questions, counts: questionCounts });
  }

  return (
    <div className="space-y-6">
        {isLoadingCache && !useQuestionBankStore.getState().questions.length ? (
          <AdminSkeleton />
        ) : (
          <QuestionList
            useQuestionStore={useQuestionBankStore}
            statusFilter={["approved", "published"]}
          />
        )}
    </div>
  );
});

QuestionBankView.displayName = "QuestionBankView";

export default QuestionBankView;
