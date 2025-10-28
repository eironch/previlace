import { BookOpen, Hash, Star, Clock } from "lucide-react";
import DifficultyIndicator from "./DifficultyIndicator";

function QuestionDisplay({ question, questionNumber, isAnswered, userAnswer }) {
  if (!question) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No question available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              Question {questionNumber}
            </span>
          </div>
          
          {question.category && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {question.category}
            </span>
          )}
          
          {question.subjectArea && question.subjectArea !== question.category && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {question.subjectArea}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {question.difficulty && (
            <DifficultyIndicator difficulty={question.difficulty} />
          )}
          
          {isAnswered && (
            <div className="flex items-center gap-1 text-green-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-xs font-medium">Answered</span>
            </div>
          )}
        </div>
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

      {userAnswer && (
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Your Answer:</span>
            <span className="text-sm text-blue-900">{userAnswer}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionDisplay;