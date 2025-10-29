import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card1";
import Button from "../ui/button1";
import { Input } from "../ui/input1";
import Label from "../ui/label";
import { Badge } from "../ui/badge1";
import { Progress } from "../ui/progress1";
import {
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
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
      day: "numeric",
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
    const currentWeek = Math.ceil(
      (today - planStart) / (1000 * 60 * 60 * 24 * 7)
    );

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
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Study Plan Generator
          </h1>
          <p className="text-gray-600">
            Create a personalized study plan based on your target exam date and
            performance
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
                min={
                  new Date(Date.now() + 86400000).toISOString().split("T")[0]
                }
                max={
                  new Date(Date.now() + 365 * 86400000)
                    .toISOString()
                    .split("T")[0]
                }
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
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

            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">
                What Your Study Plan Includes:
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
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
  const currentWeek = Math.ceil(
    (new Date() - new Date(studyPlan.startDate)) / (1000 * 60 * 60 * 24 * 7)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Your Study Plan
        </h1>
        <p className="text-gray-600">
          Personalized study schedule for your Civil Service Examination
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Days Remaining
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {daysRemaining}
                </p>
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
                <p className="text-sm font-medium text-gray-600">
                  Daily Study Time
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {studyPlan.dailyStudyTime}m
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
                <p className="text-sm font-medium text-gray-600">
                  Readiness Score
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {studyPlan.currentReadinessScore}%
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyPlan.weeklySchedule?.map((week) => (
                <div key={week.week} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Week {week.week}</h3>
                    <Badge
                      variant={
                        week.week === currentWeek ? "default" : "outline"
                      }
                    >
                      {week.focus}
                    </Badge>
                  </div>

                  <div className="mb-2">
                    <Progress
                      value={getWeekProgress(
                        week.week,
                        studyPlan.weeklySchedule.length
                      )}
                      className="h-2"
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Goals:</strong> {week.goals?.join(", ")}
                    </p>
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
                <div
                  key={milestone.week}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-1">
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.description}</h4>
                    <p className="text-sm text-gray-600">
                      Week {milestone.week}, Day {milestone.day}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">
                        {milestone.assessmentType}
                      </Badge>
                      <Badge variant="secondary">
                        Target: {milestone.targetReadinessScore}%
                      </Badge>
                      {milestone.actualScore && (
                        <Badge
                          variant={
                            milestone.actualScore >=
                            milestone.targetReadinessScore
                              ? "success"
                              : "destructive"
                          }
                        >
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
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="capitalize">
                      {rec.priority} Priority
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{rec.message}</p>
                      {rec.actions && rec.actions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
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
        <Button onClick={() => window.location.reload()} className="flex-1">
          Update Progress
        </Button>
      </div>
    </div>
  );
}

export default StudyPlanGenerator;
