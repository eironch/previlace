import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Brain, Calendar, Clock, Target, TrendingUp, AlertTriangle } from "lucide-react";
import useExamStore from "../../store/examStore";

function ExamReadinessAssessment() {
  const { examReadiness, fetchExamReadiness, loading } = useExamStore();
  const [selectedLevel, setSelectedLevel] = useState("professional");

  useEffect(() => {
    fetchExamReadiness(selectedLevel);
  }, [fetchExamReadiness, selectedLevel]);

  function getReadinessColor(score) {
    if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  }

  function getReadinessLabel(score) {
    if (score >= 90) return "Excellent - Ready to Take Exam";
    if (score >= 80) return "Good - Almost Ready";
    if (score >= 70) return "Fair - More Practice Needed";
    if (score >= 60) return "Poor - Significant Improvement Required";
    return "Very Poor - Extensive Preparation Needed";
  }

  function getPassingProbabilityColor(probability) {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Readiness Assessment</h1>
        <p className="text-gray-600">
          Evaluate your preparation level and get personalized recommendations
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedLevel === "professional" ? "default" : "outline"}
          onClick={() => setSelectedLevel("professional")}
        >
          Professional Level
        </Button>
        <Button
          variant={selectedLevel === "sub-professional" ? "default" : "outline"}
          onClick={() => setSelectedLevel("sub-professional")}
        >
          Sub-Professional Level
        </Button>
      </div>

      {examReadiness && (
        <>
          <div className={`p-6 rounded-lg border-2 ${getReadinessColor(examReadiness.overallScore)}`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${examReadiness.overallScore}, 100`}
                      className="text-current opacity-30"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${examReadiness.overallScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{examReadiness.overallScore}%</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Overall Readiness Score</h2>
              <p className="text-lg font-semibold">{getReadinessLabel(examReadiness.overallScore)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Category Readiness</h3>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {examReadiness.categoryReadiness}%
                  </div>
                  <Progress value={examReadiness.categoryReadiness} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2">
                    Subject area mastery level
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Consistency</h3>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {examReadiness.performanceConsistency}%
                  </div>
                  <Progress value={examReadiness.performanceConsistency} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2">
                    Performance stability
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Time Efficiency</h3>
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {examReadiness.timeEfficiency}%
                  </div>
                  <Progress value={examReadiness.timeEfficiency} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2">
                    Speed and accuracy balance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Passing Probability Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Based on current performance</p>
                  <p className="text-lg font-semibold">
                    Estimated chance of passing the {selectedLevel} level exam:
                  </p>
                </div>
                <div className={`text-right ${getPassingProbabilityColor(examReadiness.estimatedPassingProbability)}`}>
                  <div className="text-3xl font-bold">
                    {examReadiness.estimatedPassingProbability}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {examReadiness.recommendations && examReadiness.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examReadiness.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{rec.message}</p>
                          {rec.timeframe && (
                            <p className="text-sm text-gray-600 mt-1">
                              Recommended timeframe: {rec.timeframe}
                            </p>
                          )}
                          {rec.categories && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rec.categories.map((category) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-auto p-4 justify-start" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">Take Practice Quiz</div>
                    <div className="text-sm text-gray-600">Improve weak areas</div>
                  </div>
                </Button>
                <Button className="h-auto p-4 justify-start" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">Generate Study Plan</div>
                    <div className="text-sm text-gray-600">Structured preparation</div>
                  </div>
                </Button>
                <Button className="h-auto p-4 justify-start" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">Take Mock Exam</div>
                    <div className="text-sm text-gray-600">Full simulation</div>
                  </div>
                </Button>
                <Button className="h-auto p-4 justify-start" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">Review Analytics</div>
                    <div className="text-sm text-gray-600">Detailed insights</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default ExamReadinessAssessment;
