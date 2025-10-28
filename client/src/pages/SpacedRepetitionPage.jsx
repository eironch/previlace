import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Brain, RotateCcw, CheckCircle } from "lucide-react";
import useExamStore from "@/store/examStore";
import QuizInterface from "@/components/exam/QuizInterface";

function SpacedRepetitionPage() {
  const {
    fetchSpacedRepetitionQuestions,
    fetchReviewSchedule,
    spacedRepetitionData,
    reviewSchedule,
    loading,
    startQuizSession,
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
      day: "numeric",
    });
  }

  function getDayColor(date) {
    const today = new Date().toDateString();
    const reviewDate = new Date(date).toDateString();

    if (reviewDate === today)
      return "border-blue-300 bg-blue-100 text-blue-800";
    if (new Date(date) < new Date())
      return "border-red-300 bg-red-100 text-red-800";
    return "border-gray-300 bg-gray-100 text-gray-800";
  }

  if (showQuiz) {
    return <QuizInterface onComplete={() => setShowQuiz(false)} />;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Spaced Repetition System
        </h1>
        <p className="text-gray-600">
          Review questions at optimal intervals to maximize retention and
          learning efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    <p className="text-sm text-gray-600">
                      Questions due for review
                    </p>
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

                <div className="mb-4 flex gap-2">
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
                  disabled={
                    !spacedRepetitionData.questions ||
                    spacedRepetitionData.questions.length === 0
                  }
                  className="w-full"
                  size="lg"
                >
                  {spacedRepetitionData.questions?.length > 0
                    ? `Start Review Session (${spacedRepetitionData.questions.length} questions)`
                    : "No Questions Due for Review"}
                </Button>

                {spacedRepetitionData.dueCount === 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      Great job! You're all caught up with your reviews.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Brain className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="mb-4 text-gray-500">
                  No spaced repetition data available yet
                </p>
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
                    className={`rounded-lg border p-3 ${getDayColor(day._id)}`}
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
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="mb-4 text-gray-500">
                  No upcoming reviews scheduled
                </p>
                <p className="text-sm text-gray-400">
                  Answer more questions to build your review schedule
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SpacedRepetitionPage;
