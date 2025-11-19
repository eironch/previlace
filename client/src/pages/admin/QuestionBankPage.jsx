import { useEffect, useState } from "react";
import { Database, RefreshCw, Loader } from "lucide-react";
import { useQuestionBankStore } from "@/store/questionBankStore";
import QuestionTypeSelection from "@/components/questionBank/QuestionTypeSelection";
import QuestionCreationForm from "@/components/questionBank/QuestionCreationForm";
import QuestionList from "@/components/questionBank/QuestionList";
import Button from "@/components/ui/Button";

function QuestionBankPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchQuestions, fetchQuestionCounts } = useQuestionBankStore();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-black" />
          <div>
            <h2 className="text-xl font-semibold text-black">Question Bank</h2>
            <p className="text-gray-600">
              Published questions available to users
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
        </div>
      </div>

      <QuestionList
        useQuestionStore={useQuestionBankStore}
        statusFilter={["approved", "published"]}
      />
    </div>
  );
}

export default QuestionBankPage;
