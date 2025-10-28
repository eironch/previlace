import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown, Target, Clock, Brain, Award } from "lucide-react";
import useExamStore from "../../store/examStore";

function PerformanceDashboard() {
  const { analytics, fetchAnalytics, loading } = useExamStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No performance data available yet. Take a quiz to see your analytics.</p>
        </div>
      </div>
    );
  }

  function getPerformanceColor(percentage) {
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  }

  function getTrendIcon(current, previous) {
    if (!previous) return null;
    return current > previous ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
        <p className="text-gray-600">Track your progress and identify areas for improvement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overall?.accuracy?.toFixed(1) || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overall?.totalQuestions || 0}
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((analytics.overall?.totalTimeSpent || 0) / 3600000)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overall?.bestScore?.toFixed(0) || 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categories?.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPerformanceColor(category.accuracy)}>
                        {category.accuracy?.toFixed(0)}%
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {category.totalQuestions} questions
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={category.accuracy || 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.difficulty?.map((diff) => (
                <div key={diff.difficulty} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{diff.difficulty}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPerformanceColor(diff.accuracy)}>
                        {diff.accuracy?.toFixed(0)}%
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {Math.round((diff.averageTime || 0) / 1000)}s avg
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={diff.accuracy || 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics.trends && analytics.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {analytics.trends.map((trend, index) => (
                <div key={trend._id} className="text-center p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{trend._id}</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold">
                      {trend.averageScore?.toFixed(0)}%
                    </span>
                    {index > 0 && getTrendIcon(
                      trend.averageScore, 
                      analytics.trends[index - 1]?.averageScore
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {trend.sessionCount} sessions
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.recommendations && analytics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high' 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge 
                      variant="outline" 
                      className={rec.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}
                    >
                      {rec.priority}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{rec.message}</p>
                      {rec.categories && (
                        <p className="text-sm text-gray-600 mt-1">
                          Focus areas: {rec.categories.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PerformanceDashboard;
