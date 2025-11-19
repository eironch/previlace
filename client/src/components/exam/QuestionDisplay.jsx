import { useState } from "react";
import { Hash, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";

function QuestionDisplay({ question, questionNumber, isAnswered }) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!question) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-500 text-lg">No question available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">
            Question {questionNumber}
          </span>
        </div>

        <button
          onClick={() => setShowInfoModal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="prose prose-sm max-w-none">
        <div className="text-gray-900 leading-relaxed">
          {question.questionText && (
            <div 
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: question.questionText }}
            />
          )}
          
          {question.questionMath && (
            <div 
              className="mb-4 p-4 bg-gray-50 rounded-lg font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: question.questionMath }}
            />
          )}
        </div>
      </div>

      {question.image && (
        <div className="rounded-lg bg-gray-50 p-4">
          <img 
            src={question.image} 
            alt="Question image"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}

      <Modal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)}
        title="Question Details"
      >
        <div className="space-y-3">
          {question.topicName && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-1 text-xs font-semibold text-gray-600">Topic</p>
              <p className="text-sm font-medium text-gray-900">{question.topicName}</p>
            </div>
          )}

          {question.category && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-1 text-xs font-semibold text-gray-600">Category</p>
              <p className="text-sm font-medium text-gray-900">{question.category}</p>
            </div>
          )}

          {question.subjectArea && question.subjectArea !== question.category && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-1 text-xs font-semibold text-gray-600">Subject Area</p>
              <p className="text-sm font-medium text-gray-900">{question.subjectArea}</p>
            </div>
          )}

          {question.difficulty && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-1 text-xs font-semibold text-gray-600">Difficulty</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{question.difficulty}</p>
            </div>
          )}

          {isAnswered && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="mb-1 text-xs font-semibold text-green-600">Status</p>
              <p className="text-sm font-medium text-green-900">Answered</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default QuestionDisplay;
