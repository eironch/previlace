import { useState } from "react";
import { useTestStore } from "../../store/testStore";
import MathRenderer from "../ui/MathRenderer";
import Button from "../ui/button";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

function TestResults({ onBackToConfig }) {
  const { testResult } = useTestStore();
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  if (!testResult) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  function toggleQuestionExpansion(questionId) {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function getScoreColor(percentage) {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreBackground(percentage) {
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 60) return "bg-blue-50 border-blue-200";
    if (percentage >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  }

  const { score, timing, analytics, answers } = testResult;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black">Test Results</h1>
            <Button onClick={onBackToConfig} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Take Another Test
            </Button>
          </div>
        </div>

        <div
          className={`mb-8 rounded-lg border-2 p-8 ${getScoreBackground(score.percentage)}`}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Trophy
                  className={`h-12 w-12 ${getScoreColor(score.percentage)}`}
                />
              </div>
              <div
                className={`text-4xl font-bold ${getScoreColor(score.percentage)}`}
              >
                {score.percentage}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Target className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600">
                {score.correct}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-red-600">
                {score.incorrect}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Clock className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {formatTime(timing.totalTimeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        {analytics && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-black">
              Performance Analysis
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {analytics.strongAreas && analytics.strongAreas.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-green-700">
                    Strong Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.strongAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded bg-green-100 px-2 py-1 text-sm text-green-700"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analytics.weakAreas && analytics.weakAreas.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-red-700">
                    Areas for Improvement
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.weakAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded bg-red-100 px-2 py-1 text-sm text-red-700"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-black">
            Question Review
          </h2>

          <div className="space-y-4">
            {answers.map((answer, index) => {
              const isExpanded = expandedQuestions.has(answer.questionId);

              return (
                <div
                  key={answer.questionId}
                  className="border-b border-gray-200 pb-4"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between py-2"
                    onClick={() => toggleQuestionExpansion(answer.questionId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {index + 1}
                      </div>

                      <div className="flex items-center gap-2">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            answer.isCorrect ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {answer.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {isExpanded && answer.question && (
                    <div className="mt-4 ml-11 space-y-4">
                      {answer.question.passageText && (
                        <div className="rounded border border-gray-200 bg-gray-50 p-4">
                          {answer.question.passageTitle && (
                            <h4 className="mb-2 font-medium text-black">
                              {answer.question.passageTitle}
                            </h4>
                          )}
                          <div className="prose prose-sm max-w-none text-gray-700">
                            {answer.question.passageText
                              .split("\n")
                              .map((paragraph, idx) => (
                                <p key={idx} className="mb-2">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="mb-2 font-medium text-black">
                          Question:
                        </h4>
                        <p className="text-gray-800">
                          {answer.question.questionText}
                        </p>
                        {answer.question.questionMath && (
                          <div className="mt-2">
                            <MathRenderer
                              latex={answer.question.questionMath}
                              displayMode={true}
                              className="text-base"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {answer.question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`rounded border p-3 ${
                              option.isCorrect
                                ? "border-green-200 bg-green-50"
                                : answer.userAnswer === option.text
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-800">{option.text}</p>
                                {option.math && (
                                  <div className="mt-1">
                                    <MathRenderer
                                      latex={option.math}
                                      displayMode={false}
                                      className="text-sm"
                                    />
                                  </div>
                                )}
                                {option.isCorrect && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Correct Answer
                                  </span>
                                )}
                                {answer.userAnswer === option.text &&
                                  !option.isCorrect && (
                                    <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-red-700">
                                      <XCircle className="h-4 w-4" />
                                      Your Answer
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {answer.question.explanation && (
                        <div className="rounded border border-blue-200 bg-blue-50 p-4">
                          <h4 className="mb-2 font-medium text-blue-900">
                            Explanation:
                          </h4>
                          <p className="text-blue-800">
                            {answer.question.explanation}
                          </p>
                          {answer.question.explanationMath && (
                            <div className="mt-2">
                              <MathRenderer
                                latex={answer.question.explanationMath}
                                displayMode={true}
                                className="text-base"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onBackToConfig} className="px-8">
            <RotateCcw className="mr-2 h-4 w-4" />
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TestResults;
