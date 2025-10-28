import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Calendar, Clock, Brain, RotateCcw, CheckCircle } from "lucide-react";
import useExamStore from "../../store/examStore";
import QuizInterface from "./QuizInterface";

function SpacedRepetitionSystem() {
  const { 
    fetchSpacedRepetitionQuestions, 
    fetchReviewSchedule,
    spacedRepetitionData, 
    reviewSchedule, 
    loading,
    startQuizSession
  } = useExamStore();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState(20);

  useEffect(() => {
    fetchSpacedRepetitionQuestions(selectedLimit);
    fetchReviewSchedule(7);
  }, [fetchSpacedRepetitionQuestions, fetchReviewSchedule, selectedLimit]);

  function handleStartReview() {
    if (spacedRepetitionData?.questions?.length > 0) {
      startQuizSession({
        mode: "spaced-repetition",
        title: "Spaced Repetition Review",
        questionCount: spacedRepetitionData.questions.length,
        timeLimit: spacedRepetitionData.questions.length * 120,
      });
      setShowQuiz(true);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function getDayColor(date) {
    const today = new Date().toDateString();
    const reviewDate = new Date(date).toDateString();
    
    if (reviewDate === today) return "bg-blue-100 border-blue-300 text-blue-800";
    if (new Date(date) < new Date()) return "bg-red-100 border-red-300 text-red-800";
    return "bg-gray-100 border-gray-300 text-gray-800";
  }

  if (showQuiz) {
    return <QuizInterface onComplete={() => setShowQuiz(false)} />;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spaced Repetition System</h1>
        <p className="text-gray-600">
          Review questions at optimal intervals to maximize retention and learning efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Ready for Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spacedRepetitionData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {spacedRepetitionData.dueCount}
                    </p>
                    <p className="text-sm text-gray-600">Questions due for review</p>
                  </div>
                  <RotateCcw className="h-12 w-12 text-blue-600 opacity-20" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Review Progress</span>
                    <span>{spacedRepetitionData.dueCount} remaining</span>
                  </div>
                  <Progress 
                    value={spacedRepetitionData.dueCount > 0 ? 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="flex gap-2 mb-4">
                  {[10, 20, 30, 50].map((limit) => (
                    <Button
                      key={limit}
                      size="sm"
                      variant={selectedLimit === limit ? "default" : "outline"}
                      onClick={() => setSelectedLimit(limit)}
                    >
                      {limit}
                    </Button>
                  ))}
                </div>

                <Button 
                  onClick={handleStartReview}
                  disabled={!spacedRepetitionData.questions || spacedRepetitionData.questions.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {spacedRepetitionData.questions?.length > 0 
                    ? `Start Review Session (${spacedRepetitionData.questions.length} questions)` 
                    : "No Questions Due for Review"
                  }
                </Button>

                {spacedRepetitionData.dueCount === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 text-sm">
                      Great job! You're all caught up with your reviews.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No spaced repetition data available yet</p>
                <p className="text-sm text-gray-400">
                  Take some quizzes to build your review schedule
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Upcoming Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewSchedule && reviewSchedule.length > 0 ? (
              <div className="space-y-3">
                {reviewSchedule.map((day) => (
                  <div 
                    key={day._id}
                    className={`p-3 rounded-lg border ${getDayColor(day._id)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{formatDate(day._id)}</p>
                        <p className="text-sm opacity-75">
                          {day.count} questions scheduled
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {day.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming reviews scheduled</p>
                <p className="text-sm text-gray-400">
                  Answer more questions to build your review schedule
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Spaced Repetition Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-sm text-gray-600">
                Questions are scheduled for review just before you're likely to forget them
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Optimal Timing</h3>
              <p className="text-sm text-gray-600">
                Review intervals increase based on how well you know each question
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Long-term Retention</h3>
              <p className="text-sm text-gray-600">
                Maximizes memory retention while minimizing study time
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Tips for Effective Review:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review questions daily for best results</li>
              <li>• Be honest about your confidence level</li>
              <li>• Focus on understanding, not just memorization</li>
              <li>• Don't skip review sessions to maintain the schedule</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SpacedRepetitionSystem;
