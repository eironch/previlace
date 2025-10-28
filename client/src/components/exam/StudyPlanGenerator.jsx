import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Calendar, Target, Clock, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import useExamStore from "../../store/examStore";

function StudyPlanGenerator() {
  const { generateStudyPlan, studyPlan, loading, error } = useExamStore();
  const [targetDate, setTargetDate] = useState("");

  function handleGenerate() {
    if (targetDate) {
      generateStudyPlan(targetDate);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function getDaysRemaining(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function getWeekProgress(weekNumber, totalWeeks) {
    const today = new Date();
    const planStart = new Date(studyPlan?.startDate);
    const currentWeek = Math.ceil((today - planStart) / (1000 * 60 * 60 * 24 * 7));
    
    if (weekNumber < currentWeek) return 100;
    if (weekNumber === currentWeek) return 50;
    return 0;
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  }

  if (!studyPlan) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Plan Generator</h1>
          <p className="text-gray-600">
            Create a personalized study plan based on your target exam date and performance
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Generate Your Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Exam Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                max={new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              onClick={handleGenerate}
              disabled={!targetDate || loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Generating Plan..." : "Generate Study Plan"}
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What Your Study Plan Includes:</h3>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Weekly study schedule tailored to your weak areas</li>
                <li>• Daily question targets and study time goals</li>
                <li>• Progress milestones and assessments</li>
                <li>• Personalized recommendations based on performance</li>
                <li>• Adaptive adjustments as you improve</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(studyPlan.targetExamDate);
  const currentWeek = Math.ceil((new Date() - new Date(studyPlan.startDate)) / (1000 * 60 * 60 * 24 * 7));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Study Plan</h1>
        <p className="text-gray-600">
          Personalized study schedule for your Civil Service Examination
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{daysRemaining}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Target Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(studyPlan.targetExamDate)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{studyPlan.dailyStudyTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Readiness Score</p>
                <p className="text-2xl font-bold text-gray-900">{studyPlan.currentReadinessScore}%</p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyPlan.weeklySchedule?.map((week) => (
                <div key={week.week} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Week {week.week}</h3>
                    <Badge variant={week.week === currentWeek ? "default" : "outline"}>
                      {week.focus}
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <Progress 
                      value={getWeekProgress(week.week, studyPlan.weeklySchedule.length)} 
                      className="h-2"
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p><strong>Goals:</strong> {week.goals?.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyPlan.milestones?.map((milestone) => (
                <div key={milestone.week} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.description}</h4>
                    <p className="text-sm text-gray-600">Week {milestone.week}, Day {milestone.day}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{milestone.assessmentType}</Badge>
                      <Badge variant="secondary">
                        Target: {milestone.targetReadinessScore}%
                      </Badge>
                      {milestone.actualScore && (
                        <Badge variant={milestone.actualScore >= milestone.targetReadinessScore ? "success" : "destructive"}>
                          Actual: {milestone.actualScore}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {studyPlan.recommendations && studyPlan.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyPlan.recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="capitalize">
                      {rec.priority} Priority
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{rec.message}</p>
                      {rec.actions && rec.actions.length > 0 && (
                        <ul className="mt-2 text-sm space-y-1">
                          {rec.actions.map((action, actionIndex) => (
                            <li key={actionIndex}>• {action}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          onClick={() => setTargetDate("")}
          variant="outline"
          className="flex-1"
        >
          Generate New Plan
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="flex-1"
        >
          Update Progress
        </Button>
      </div>
    </div>
  );
}

export default StudyPlanGenerator;
