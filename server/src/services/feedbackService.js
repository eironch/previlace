import ManualQuestion from "../models/ManualQuestion.js";
import UserActivity from "../models/UserActivity.js";

class FeedbackService {
  async generateImmediateFeedback(questionId, userAnswer, isCorrect) {
    const question = await ManualQuestion.findById(questionId)
      .populate("topicId")
      .populate("subjectId");

    if (!question) {
      throw new Error("Question not found");
    }

    const feedback = {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || this.generateDefaultExplanation(question, isCorrect),
      relatedConcepts: [],
      nextSteps: this.generateNextSteps(isCorrect, question),
    };

    if (!isCorrect) {
      feedback.commonMistakes = this.getCommonMistakes(question);
      feedback.studyResources = this.getStudyResources(question);
    }

    return feedback;
  }

  generateDefaultExplanation(question, isCorrect) {
    if (isCorrect) {
      return `Correct! ${question.correctAnswer} is the right answer.`;
    }
    return `The correct answer is ${question.correctAnswer}. ${this.getConceptExplanation(question)}`;
  }

  getConceptExplanation(question) {
    if (question.topicId?.name) {
      return `This question tests your understanding of ${question.topicId.name}.`;
    }
    return "Review the concept to strengthen your understanding.";
  }

  generateNextSteps(isCorrect, question) {
    if (isCorrect) {
      return [
        "Continue to the next question",
        "Try a harder question on this topic",
      ];
    }

    return [
      "Review the explanation carefully",
      "Try similar questions to practice",
      "Ask your instructor for clarification",
    ];
  }

  getCommonMistakes(question) {
    const mistakes = [];

    if (question.choices) {
      for (const choice of question.choices) {
        if (choice.text !== question.correctAnswer && choice.explanation) {
          mistakes.push({
            answer: choice.text,
            reason: choice.explanation,
          });
        }
      }
    }

    return mistakes;
  }

  getStudyResources(question) {
    const resources = [];

    if (question.topicId?.name) {
      resources.push({
        type: "topic",
        title: `Study ${question.topicId.name}`,
        description: "Review the key concepts for this topic",
      });
    }

    if (question.subjectId?.name) {
      resources.push({
        type: "subject",
        title: `${question.subjectId.name} Resources`,
        description: "Access additional learning materials",
      });
    }

    return resources;
  }

  async generateActivitySummary(userActivityId) {
    const activity = await UserActivity.findById(userActivityId)
      .populate("activityId")
      .populate("answers.questionId");

    if (!activity) {
      throw new Error("Activity not found");
    }

    const totalQuestions = activity.answers.length;
    const correctAnswers = activity.answers.filter(a => a.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const summary = {
      activityId: activity.activityId._id,
      activityType: activity.activityId.activityType,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      score,
      timeSpent: activity.timeSpent,
      xpEarned: activity.xpEarned,
      performance: this.getPerformanceLevel(score),
      strengths: [],
      weaknesses: [],
      recommendations: [],
    };

    const topicPerformance = this.analyzeTopicPerformance(activity);
    summary.strengths = topicPerformance.strengths;
    summary.weaknesses = topicPerformance.weaknesses;
    summary.recommendations = this.generateRecommendations(summary, topicPerformance);

    return summary;
  }

  getPerformanceLevel(score) {
    if (score >= 90) return "excellent";
    if (score >= 80) return "good";
    if (score >= 70) return "satisfactory";
    if (score >= 60) return "needs_improvement";
    return "needs_attention";
  }

  analyzeTopicPerformance(activity) {
    const topicStats = {};

    for (const answer of activity.answers) {
      if (!answer.questionId?.topicId) continue;

      const topicId = answer.questionId.topicId.toString();
      const topicName = answer.questionId.topicId.name || "Unknown Topic";

      if (!topicStats[topicId]) {
        topicStats[topicId] = {
          name: topicName,
          total: 0,
          correct: 0,
        };
      }

      topicStats[topicId].total++;
      if (answer.isCorrect) {
        topicStats[topicId].correct++;
      }
    }

    const strengths = [];
    const weaknesses = [];

    for (const [topicId, stats] of Object.entries(topicStats)) {
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

      if (accuracy >= 80) {
        strengths.push({
          topic: stats.name,
          accuracy: Math.round(accuracy),
        });
      } else if (accuracy < 60) {
        weaknesses.push({
          topic: stats.name,
          accuracy: Math.round(accuracy),
        });
      }
    }

    return { strengths, weaknesses };
  }

  generateRecommendations(summary, topicPerformance) {
    const recommendations = [];

    if (summary.score >= 90) {
      recommendations.push({
        priority: "high",
        message: "Excellent work! You're mastering this content.",
        actions: ["Try the next difficulty level", "Help peers with similar topics"],
      });
    } else if (summary.score >= 70) {
      recommendations.push({
        priority: "medium",
        message: "Good progress. Focus on consistency.",
        actions: ["Review mistakes", "Practice similar questions"],
      });
    } else {
      recommendations.push({
        priority: "high",
        message: "More practice needed on this topic.",
        actions: ["Review fundamentals", "Ask instructor for help", "Complete additional exercises"],
      });
    }

    if (topicPerformance.weaknesses.length > 0) {
      const weakTopics = topicPerformance.weaknesses.map(w => w.topic).join(", ");
      recommendations.push({
        priority: "high",
        message: `Focus on improving: ${weakTopics}`,
        actions: ["Review lesson materials", "Practice targeted questions", "Schedule instructor Q&A"],
      });
    }

    if (summary.timeSpent && summary.totalQuestions > 0) {
      const avgTimePerQuestion = summary.timeSpent / summary.totalQuestions;
      if (avgTimePerQuestion > 120) {
        recommendations.push({
          priority: "medium",
          message: "Work on time management for better exam readiness.",
          actions: ["Practice with timer", "Learn question patterns", "Focus on efficiency"],
        });
      }
    }

    return recommendations;
  }

  async generateProgressFeedback(userId, subjectId, timeframe = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const activities = await UserActivity.find({
      userId,
      completedAt: { $gte: startDate },
    })
      .populate({
        path: "activityId",
        match: { subjectId },
      })
      .sort({ completedAt: 1 });

    const validActivities = activities.filter(a => a.activityId);

    if (validActivities.length === 0) {
      return {
        message: "No recent activities to analyze",
        trend: "none",
      };
    }

    const scores = validActivities.map(a => {
      const correct = a.answers.filter(ans => ans.isCorrect).length;
      const total = a.answers.length;
      return total > 0 ? (correct / total) * 100 : 0;
    });

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const trend = this.calculateTrend(scores);

    return {
      message: this.getTrendMessage(trend, avgScore),
      trend,
      avgScore: Math.round(avgScore),
      activitiesCompleted: validActivities.length,
      improvementSuggestions: this.getImprovementSuggestions(trend, avgScore),
    };
  }

  calculateTrend(scores) {
    if (scores.length < 2) return "stable";

    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  }

  getTrendMessage(trend, avgScore) {
    if (trend === "improving") {
      return `Great progress! Your scores are improving. Keep up the good work!`;
    }
    if (trend === "declining") {
      return `Your scores have declined recently. Let's focus on reviewing fundamentals.`;
    }
    return `Your performance is consistent at ${Math.round(avgScore)}%. ${avgScore >= 75 ? "Maintain this level!" : "Work on improvement."}`;
  }

  getImprovementSuggestions(trend, avgScore) {
    const suggestions = [];

    if (trend === "declining" || avgScore < 70) {
      suggestions.push("Schedule a review session with your instructor");
      suggestions.push("Revisit foundational concepts");
      suggestions.push("Increase daily practice time");
    }

    if (avgScore >= 80 && trend === "improving") {
      suggestions.push("Challenge yourself with harder questions");
      suggestions.push("Explore advanced topics");
    }

    if (trend === "stable" && avgScore >= 70 && avgScore < 85) {
      suggestions.push("Focus on weak areas to break through plateau");
      suggestions.push("Try varied question types");
    }

    return suggestions;
  }
}

export default new FeedbackService();
