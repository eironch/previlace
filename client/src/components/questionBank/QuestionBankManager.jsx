import { useEffect, useState } from "react";
import { Database, Plus, RefreshCw, Loader } from "lucide-react";
import { useQuestionBankStore } from "../../store/questionBankStore";
import QuestionTypeSelection from "./QuestionTypeSelection";
import QuestionCreationForm from "./QuestionCreationForm";
import QuestionList from "./QuestionList";
import Button from "../ui/Button";

function QuestionBankManager() {
  const [currentView, setCurrentView] = useState("questions");
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchQuestions, fetchQuestionCounts } = useQuestionBankStore();

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchQuestions(), 
        fetchQuestionCounts(),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    } finally {
      setIsRefreshing(false);
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
            variant="outline" 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="flex items-center gap-2 active:scale-95 transition-all duration-200"
          >
            <RefreshCw 
              className="h-4 w-4" 
              style={{ animation: isRefreshing ? "custom-spin 1s linear infinite" : "none" }}
            />
            Refresh
          </Button>

          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Question
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

export default QuestionBankManager;
