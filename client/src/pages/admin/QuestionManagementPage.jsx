import { useState, useRef } from "react";
import { Plus, Eye, Save, CheckCircle2 } from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import QuestionBankView from "@/components/admin/questions/QuestionBankView";
import ReviewQueueView from "@/components/admin/questions/ReviewQueueView";
import QuestionCreationForm from "@/components/questionBank/QuestionCreationForm";
import Button from "@/components/ui/Button";

export default function QuestionManagementPage() {
  const [activeTab, setActiveTab] = useState("bank"); // "bank" or "review"
  const [view, setView] = useState("list"); // "list", "create"
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const bankRef = useRef(null);
  const reviewRef = useRef(null);
  const formRef = useRef(null);

  const handleRefresh = () => {
    if (activeTab === "bank") {
      bankRef.current?.refresh();
    } else {
      reviewRef.current?.refresh();
    }
  };

  const handleCreateClick = () => {
    setView("create");
    setShowPreview(false);
    // Optionally set a default type or let the form handle it
    setSelectedQuestionType({ name: 'Multiple Choice', questionTypes: ['multiple_choice'] }); 
  };

  const handleBackToQuestions = () => {
    setView("list");
    setSelectedQuestionType(null);
    setShowPreview(false);
  };

  const handleSuccess = () => {
    setView("list");
    setSelectedQuestionType(null);
    setShowPreview(false);
    // Refresh both views
    setTimeout(() => {
        bankRef.current?.refresh();
        reviewRef.current?.refresh();
    }, 100);
  };

  if (view === "create") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <StandardHeader 
          title="Create Question" 
          showBack 
          onBack={handleBackToQuestions}
          onRefresh={null}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-5 w-5" />
              {showPreview ? "Edit" : "Preview"}
            </Button>

            <Button
              onClick={() => formRef.current?.submit("draft")}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              Save Draft
            </Button>

            <Button
              onClick={() => formRef.current?.submit("review")}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              Submit for Review
            </Button>
          </div>
        </StandardHeader>
        <div className="flex-1 overflow-y-auto mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
            <QuestionCreationForm 
              ref={formRef}
              questionType={selectedQuestionType}
              onBack={handleBackToQuestions}
              onSuccess={handleSuccess}
              onCancel={handleBackToQuestions}
              showPreview={showPreview}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <StandardHeader 
        title="Questions" 
        description="Manage question bank and review submitted questions."
        onRefresh={handleRefresh}
        bottomContent={
          <div className="border-b border-gray-300">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("bank")}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === "bank"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}
                `}
              >
                Question Bank
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === "review"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}
                `}
              >
                Review Queue
              </button>
            </nav>
          </div>
        }
      >
        <button
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Question</span>
        </button>
      </StandardHeader>

      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Tab Content */}
        <div className={activeTab === "bank" ? "block" : "hidden"}>
            <QuestionBankView key={refreshKey} ref={bankRef} />
        </div>
        <div className={activeTab === "review" ? "block" : "hidden"}>
            <ReviewQueueView ref={reviewRef} />
        </div>
      </div>
    </div>
  );
}
